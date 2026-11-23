/**
 * dsh-sdt — host routes.
 *
 * 挂在 `/sdt` 前缀下，只暴露三件事：
 *   GET /sdt/health         存活检查
 *   GET /sdt/config.json    配置的运行时视图（不含绝对路径）
 *   GET /sdt/asset/<name>   素材字节流（用户目录优先，内置回退）
 *
 * 安全：
 *  - `ctx.webServer.register()` 的自定义路由**不继承**宿主的鉴权与 Host/Origin 栅栏，
 *    所以 handler 第一件事就是 `ctx.connection.requestRejection(req)`，且异常时 fail-closed。
 *  - 用户可上传 SVG；SVG 在同源下可执行脚本，因此对 SVG 响应加 CSP：禁止一切外部与脚本能力。
 *  - HEAD 只回头，不回 body。
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolveAsset } from './assets.js';

const PLUGIN_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/** 读插件自身文件（console.html / features.json / package.json），失败返回 null。 */
function readPluginFile(name) {
  try {
    return fs.readFileSync(path.join(PLUGIN_ROOT, name));
  } catch {
    return null;
  }
}

function pluginVersion() {
  const raw = readPluginFile('package.json');
  if (!raw) return '0.0.0';
  try {
    return JSON.parse(raw.toString('utf8')).version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/** console 页面的 CSP：只允许自身资源与内联样式/脚本（本页无外部依赖）。 */
const CONSOLE_CSP = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'unsafe-inline'",
  "script-src 'unsafe-inline'",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const VERSION = pluginVersion();

function send(res, status, body, headers = {}, headOnly = false) {
  const isBuffer = Buffer.isBuffer(body);
  const payload = isBuffer ? body : Buffer.from(JSON.stringify(body), 'utf8');
  res.writeHead(status, {
    'content-type': isBuffer
      ? headers['content-type'] ?? 'application/octet-stream'
      : 'application/json; charset=utf-8',
    'content-length': payload.length,
    'cache-control': headers['cache-control'] ?? 'no-store',
    'x-content-type-options': 'nosniff',
    ...headers,
  });
  res.end(headOnly ? undefined : payload);
}

export function createHandler({ ctx, readConfig, userAssetDir }) {
  /**
   * 宿主对 requestRejection 的实现会解析请求的 Host/Origin 与 Peer；
   * 任何异常都必须当成「拒绝」处理（fail closed），否则会漏掉鉴权。
   */
  function fence(req) {
    try {
      const service = ctx.connection ?? ctx.get?.('connection');
      if (!service || typeof service.requestRejection !== 'function') {
        return { status: 500, detail: 'connection service unavailable' };
      }
      const rejection = service.requestRejection(req);
      if (rejection === undefined || rejection === null) return null;
      return { status: rejection === 401 ? 401 : 403, detail: `rejected:${rejection}` };
    } catch (error) {
      return { status: 403, detail: `fence threw: ${(error && error.message) || error}` };
    }
  }

  return function handle(req, res) {
    const headOnly = req.method === 'HEAD';
    try {
      const denied = fence(req);
      if (denied !== null) {
        send(res, denied.status, {
          ok: false,
          error: denied.status === 401 ? 'unauthorized' : 'forbidden',
          detail: denied.detail,
        }, {}, headOnly);
        return;
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        send(res, 405, { ok: false, error: 'method_not_allowed' }, { allow: 'GET, HEAD' }, headOnly);
        return;
      }

      let url;
      try {
        url = new URL(req.url ?? '/', 'http://127.0.0.1');
      } catch {
        send(res, 400, { ok: false, error: 'bad_url' }, {}, headOnly);
        return;
      }

      const route = url.pathname.slice('/sdt'.length) || '/';

      if (route === '/health') {
        send(res, 200, { ok: true, plugin: 'dsh-sdt', version: VERSION, ready: true }, {}, headOnly);
        return;
      }

      if (route === '/console' || route === '/console/') {
        const html = readPluginFile('console.html');
        if (!html) {
          send(res, 404, { ok: false, error: 'console_not_found' }, {}, headOnly);
          return;
        }
        send(res, 200, html, {
          'content-type': 'text/html; charset=utf-8',
          'content-security-policy': CONSOLE_CSP,
          'cache-control': 'no-store',
        }, headOnly);
        return;
      }

      if (route === '/features.json') {
        const raw = readPluginFile('features.json');
        if (!raw) {
          send(res, 404, { ok: false, error: 'features_not_found' }, {}, headOnly);
          return;
        }
        let parsed;
        try {
          parsed = JSON.parse(raw.toString('utf8'));
        } catch (error) {
          send(res, 500, { ok: false, error: 'features_invalid', detail: String(error && error.message) }, {}, headOnly);
          return;
        }
        send(res, 200, parsed, {}, headOnly);
        return;
      }

      if (route === '/config.json') {
        let snapshot;
        try {
          snapshot = readConfig();
        } catch (error) {
          send(res, 500, { ok: false, error: String(error) }, {}, headOnly);
          return;
        }
        send(res, 200, {
          ok: snapshot.ok !== false,
          config: snapshot.config,
          warnings: snapshot.warnings ?? [],
          exists: snapshot.exists,
          error: snapshot.error,
        }, {}, headOnly);
        return;
      }

      if (route.startsWith('/asset/')) {
        const name = route.slice('/asset/'.length);
        const asset = resolveAsset(name, userAssetDir);
        if (!asset) {
          send(res, 404, { ok: false, error: 'asset_not_found' }, {}, headOnly);
          return;
        }
        const headers = {
          'content-type': asset.type,
          'cache-control': 'public, max-age=60',
          'x-sdt-source': asset.source,
        };
        if (asset.type === 'image/svg+xml') {
          // 同源 SVG 若含脚本会在 DSH 源下执行；禁掉脚本与外链
          headers['content-security-policy'] = "default-src 'none'; style-src 'unsafe-inline'; img-src data:";
          headers['content-disposition'] = 'inline; filename="asset.svg"';
        }
        send(res, 200, asset.body, headers, headOnly);
        return;
      }

      send(res, 404, { ok: false, error: 'not_found' }, {}, headOnly);
    } catch (error) {
      // 绝不让异常逃逸：宿主会把 handler 抛错统一变成 400，反而掩盖原因
      try {
        if (!res.headersSent) {
          send(res, 500, {
            ok: false,
            error: 'internal',
            detail: String((error && error.message) || error),
          }, {}, headOnly);
        } else {
          res.destroy();
        }
      } catch {
        res.destroy?.();
      }
    }
  };
}