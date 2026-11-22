/**
 * dsh-sdt — host routes.
 *
 * 挂在 `/sdt` 前缀下，只暴露两件事：
 *   GET /sdt/config.json   配置的运行时视图（不含绝对路径）
 *   GET /sdt/asset/<name>  素材字节流（用户目录优先，内置回退）
 *
 * 安全：`ctx.webServer.register()` 的自定义路由不继承宿主的鉴权与 Host/Origin 栅栏，
 * 所以 handler 第一件事就是 `ctx.connection.requestRejection(req)`。
 */
import { resolveAsset } from './assets.js';

function send(res, status, body, headers = {}) {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body), 'utf8');
  res.writeHead(status, {
    'content-type': Buffer.isBuffer(body) ? headers['content-type'] ?? 'application/octet-stream' : 'application/json; charset=utf-8',
    'content-length': payload.length,
    'cache-control': headers['cache-control'] ?? 'no-store',
    'x-content-type-options': 'nosniff',
    ...headers,
  });
  res.end(payload);
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
    try {
      const denied = fence(req);
      if (denied !== null) {
        send(res, denied.status, {
          ok: false,
          error: denied.status === 401 ? 'unauthorized' : 'forbidden',
          detail: denied.detail,
        });
        return;
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        send(res, 405, { ok: false, error: 'method_not_allowed' }, { allow: 'GET, HEAD' });
        return;
      }

      let url;
      try {
        url = new URL(req.url ?? '/', 'http://127.0.0.1');
      } catch {
        send(res, 400, { ok: false, error: 'bad_url' });
        return;
      }

      const route = url.pathname.slice('/sdt'.length) || '/';

      if (route === '/health') {
        send(res, 200, { ok: true, plugin: 'dsh-sdt', ready: true });
        return;
      }

      if (route === '/config.json') {
        let snapshot;
        try {
          snapshot = readConfig();
        } catch (error) {
          send(res, 500, { ok: false, error: String(error) });
          return;
        }
        send(res, 200, {
          ok: snapshot.ok !== false,
          config: snapshot.config,
          warnings: snapshot.warnings ?? [],
          exists: snapshot.exists,
          error: snapshot.error,
        });
        return;
      }

      if (route.startsWith('/asset/')) {
        const name = route.slice('/asset/'.length);
        const asset = resolveAsset(name, userAssetDir);
        if (!asset) {
          send(res, 404, { ok: false, error: 'asset_not_found' });
          return;
        }
        send(res, 200, asset.body, {
          'content-type': asset.type,
          'cache-control': 'public, max-age=60',
          'x-sdt-source': asset.source,
        });
        return;
      }

      send(res, 404, { ok: false, error: 'not_found' });
    } catch (error) {
      // 绝不让异常逃逸：宿主会把 handler 抛错统一变成 400，无法定位
      try {
        if (!res.headersSent) send(res, 500, { ok: false, error: 'internal', detail: String(error && error.message || error) });
        else res.destroy();
      } catch {
        res.destroy?.();
      }
    }
  };
}