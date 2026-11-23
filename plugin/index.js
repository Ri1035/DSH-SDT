/**
 * dsh-sdt — host half.
 *
 * 只做三件事：
 *   1) 读 `$DSH_HOME/sdt/sdt.config.json`（带行列号报错 + mtime 缓存）；
 *   2) 在 `/sdt` 前缀注册素材与配置路由（首行过 requestRejection）；
 *   3) 把素材目录准备好（`$DSH_HOME/sdt/assets/`）。
 *
 * 不在 apply 里做任何布局/样式工作 —— 那是 client 半边的事。
 */
import os from 'node:os';
import path from 'node:path';
import { createConfigStore } from './lib/config.js';
import { ensureUserAssetDir } from './lib/assets.js';
import { createHandler } from './lib/routes.js';

export const name = 'dsh-sdt';
/**
 * `connection` 必须声明：cordis 禁止访问未注入的服务属性
 * （否则 `ctx.connection` 直接抛 "cannot get property \"connection\" without inject"）。
 * `webServer` 用来注册 /sdt 路由。
 */
export const inject = ['webServer', 'connection'];

function resolveDshHome(ctx) {
  if (process.env.DSH_HOME) return process.env.DSH_HOME;
  try {
    const home = ctx.get?.('dshHome');
    if (typeof home === 'string' && home) return home;
  } catch {
    // 未声明注入的服务不可访问；退回环境变量/默认目录
  }
  return path.join(os.homedir(), '.dsh');
}

export function apply(ctx) {
  const dshHome = resolveDshHome(ctx);
  const readConfig = createConfigStore(dshHome);
  const userAssetDir = ensureUserAssetDir(dshHome);
  const handler = createHandler({ ctx, readConfig, userAssetDir });

  ctx.effect(() => {
    const dispose = ctx.webServer.register({ kind: 'prefix', path: '/sdt', handler });
    return () => {
      if (typeof dispose === 'function') dispose();
    };
  });
}