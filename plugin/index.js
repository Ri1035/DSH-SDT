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
import fs from 'node:fs';
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

/** 开屏首帧 CSS：纯 CSS 动画，不依赖 JS DOM，失败也只是不显示。
 *  两段式退场：::after 文字先淡（55%→78%），::before 底幕后淡（80%→100%）。
 *  `data-sdt-splash="out"` 供看门狗/跳过提前退场（0.26s 淡出后由脚本移除属性）。 */
function splashCss(colors, duration) {
  const bg = colors.bgDark || '#0a1626';
  const ink = colors.inkDark || '#dbeaf5';
  const brand = colors.brand || '#37a3d6';
  return `html[data-sdt-splash]::before{
  content:"";position:fixed;inset:0;z-index:2147483646;pointer-events:none;
  background:radial-gradient(120% 90% at 50% 0%, ${brand}22 0%, transparent 60%), ${bg};
}
html[data-sdt-splash]::after{
  content:"◇  DSH-SDT";position:fixed;inset:0;z-index:2147483647;pointer-events:none;
  display:flex;align-items:center;justify-content:center;
  color:${ink};font:600 15px/1 Georgia,"Noto Serif SC",serif;letter-spacing:.32em;
}
html[data-sdt-splash="1"]::before{animation:sdtSplashBack ${duration}ms ease forwards}
html[data-sdt-splash="1"]::after{animation:sdtSplashMark ${duration}ms ease forwards}
html[data-sdt-splash="out"]::before,
html[data-sdt-splash="out"]::after{animation:sdtSplashBye .26s ease forwards}
@keyframes sdtSplashBack{0%,80%{opacity:1}100%{opacity:0}}
@keyframes sdtSplashMark{0%,55%{opacity:1}78%,100%{opacity:0}}
@keyframes sdtSplashBye{from{opacity:1}to{opacity:0}}
@media (prefers-reduced-motion: reduce){
  html[data-sdt-splash]::before,html[data-sdt-splash]::after{animation-duration:1ms}
}`;
}

/** CSS 版开屏脚本：打标记、快速启动看门狗、可跳过；bye() 两段式退场后移除属性。 */
function splashScript(duration, skippable, oncePerSession) {
  return `(function(){try{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root=document.documentElement;
  ${oncePerSession ? "if(sessionStorage.getItem('sdt-splash')) return;sessionStorage.setItem('sdt-splash','1');" : ''}
  root.dataset.sdtSplash='1';
  window.__sdtSplash={at:Date.now(),duration:${duration},skippable:${skippable ? 'true' : 'false'},mode:'css'};
  var done=false; var t0=Date.now(); var seen=false;
  function bye(){
    if(done) return; done=true;
    try{ root.dataset.sdtSplash='out'; }catch(e){}
    setTimeout(function(){ try{ delete root.dataset.sdtSplash; }catch(e){} },300);
  }
  var iv=setInterval(function(){
    try{
      var boot=document.querySelector('[data-dsh-boot]');
      if(boot) seen=true;
      if((seen && !boot) || (!seen && Date.now()-t0>350)){ clearInterval(iv); bye(); }
    }catch(e){ clearInterval(iv); bye(); }
  },100);
  var hard=setTimeout(function(){ clearInterval(iv); bye(); },${duration});
  if(${skippable ? 'true' : 'false'}){
    var skip=function(){ clearInterval(iv); clearTimeout(hard); bye(); };
    addEventListener('keydown',skip,{once:true});
    addEventListener('pointerdown',skip,{once:true,capture:true});
  }
}catch(e){}})();`;
}

/** 视频开屏：head 脚本自建 DOM，播完/到点/点击即淡出，不留残留。 */
function splashVideoScript(video, duration, skippable, oncePerSession) {
  const src = JSON.stringify('/sdt/asset/' + encodeURIComponent(video));
  return `(function(){try{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root=document.documentElement;
  ${oncePerSession ? "if(sessionStorage.getItem('sdt-splash')) return;sessionStorage.setItem('sdt-splash','1');" : ''}
  var D=${duration};
  function play(){
    var old=document.getElementById('sdt-splash'); if(old) old.remove();
    var box=document.createElement('div');
    box.id='sdt-splash';
    box.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0a1626;overflow:hidden;pointer-events:none;opacity:1;transition:opacity .38s ease';
    var v=document.createElement('video');
    v.muted=true;v.autoplay=true;v.playsInline=true;
    v.setAttribute('muted','');v.setAttribute('playsinline','');
    v.src=${src};
    v.style.cssText='width:100%;height:100%;object-fit:cover;display:block';
    box.appendChild(v);root.appendChild(box);
    var done=false;
    function finish(){
      if(done) return; done=true;
      /* 两段式：内容（视频）先淡 → 底幕再淡 → 移除 */
      try{ v.style.transition='opacity .3s ease'; v.style.opacity='0'; }catch(e){}
      setTimeout(function(){ try{ box.style.transition='opacity .25s ease'; box.style.opacity='0'; }catch(e){} },300);
      setTimeout(function(){ try{ box.remove(); }catch(e){} },580);
    }
    v.addEventListener('ended',finish);
    v.addEventListener('error',finish);
    var timer=setTimeout(finish,D);
    if(${skippable ? 'true' : 'false'}){
      var skip=function(){try{clearTimeout(timer);finish()}catch(e){}};
      addEventListener('keydown',skip,{once:true});
      addEventListener('pointerdown',skip,{once:true,capture:true});
    }
  }
  window.__sdtSplash={at:Date.now(),duration:D,mode:'video',video:${JSON.stringify(video)}};
  window.__sdtSplashPlay=play;
  play();
}catch(e){}})();`;
}

export function apply(ctx) {
  const dshHome = resolveDshHome(ctx);
  const readConfig = createConfigStore(dshHome);
  const userAssetDir = ensureUserAssetDir(dshHome);
  const handler = createHandler({ ctx, readConfig, userAssetDir, dshHome });

  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: FIRST_FRAME_STYLE });
    table.push({ kind: 'script', placement: 'head', text: FIRST_FRAME_SCRIPT });

    // M8 安全模式：标记文件存在时，client 直接不接管主题（刷新页面即生效）
    try {
      if (fs.existsSync(path.join(dshHome, 'sdt', 'disabled'))) {
        table.push({ kind: 'script', placement: 'head', text: 'window.__sdtSafeMode=true;' });
      }
    } catch {
      // 读不到标记按正常模式处理
    }

    try {
      const snapshot = readConfig();
      const splash = snapshot.config.motion.splash;
      if (splash && splash.enabled) {
        const duration = Number.isInteger(splash.duration) ? splash.duration : 2200;
        if (splash.video) {
          table.push({ kind: 'script', placement: 'head', text: splashVideoScript(splash.video, duration, splash.skippable !== false, splash.oncePerSession !== false) });
        } else {
          table.push({ kind: 'style', text: splashCss(snapshot.config.colors, duration) });
          table.push({ kind: 'script', placement: 'head', text: splashScript(duration, splash.skippable !== false, splash.oncePerSession !== false) });
        }
      }
    } catch {
      // 配置异常时宁可不放动画，也不阻塞启动
    }
  });

  ctx.effect(() => {
    const dispose = ctx.webServer.register({ kind: 'prefix', path: '/sdt', handler });
    return () => {
      if (typeof dispose === 'function') dispose();
    };
  });
}