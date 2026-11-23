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

/**
 * 首帧探针（v1.9）：只推 style + script 两种白名单 kind。
 * 作用：在 React 挂载前给 html 打标记，用来判断 `webserver/index-inject`
 * 在 web / 桌面端是否真的生效（开屏路线的前置结论）。
 * 副作用极小：一个 CSS 变量 + 一个 dataset 标记。
 */
const FIRST_FRAME_STYLE = 'html{--sdt-first-frame:1}';
const FIRST_FRAME_SCRIPT =
  'try{window.__sdtFirstFrame={at:Date.now()};document.documentElement.dataset.sdtFirst="1"}catch(e){}';

export function apply(ctx) {
  const dshHome = resolveDshHome(ctx);
  const readConfig = createConfigStore(dshHome);
  const userAssetDir = ensureUserAssetDir(dshHome);
  const handler = createHandler({ ctx, readConfig, userAssetDir });

  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: FIRST_FRAME_STYLE });
    table.push({ kind: 'script', placement: 'head', text: FIRST_FRAME_SCRIPT });
  });

  ctx.effect(() => {
    const dispose = ctx.webServer.register({ kind: 'prefix', path: '/sdt', handler });
    return () => {
      if (typeof dispose === 'function') dispose();
    };
  });
}