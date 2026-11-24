/**
 * dsh-sdt — browser client bundle (v1.9)
 *
 * 三件事：
 *   1) L1 全量：把界面里实际存在的 `--dsw-alias-*` / `--dsw-specific-*` 变量（实测 133 个）
 *      按语义族映射成明/暗两套值，一次性通过 `theme.overrideTokens` 覆盖；
 *   2) L2 语法：只用稳定锚点（`data-slot` / `data-ds-dark-theme`）写少量 CSS，
 *      实现"品牌色细框 + 白玻璃 + 菱格底纹"的视觉语言，不动布局与尺寸；
 *   3) M3 字标：向 `sidebar.brand.mark` 注册自绘 SVG 字标。
 *
 * 纪律：未知族一律不覆盖（宁缺勿乱）；任何一步失败都不影响界面可用。
 */
window.__ModuleLoader__.load({
  id: 'dsh-sdt',
  factory: (require) => {
    const VERSION = '1.9';
    const SOURCE = 'dsh-sdt';
    if (window.__dshSdtApplied) return { inject: ['theme', 'slots'], apply() {} };
    window.__dshSdtApplied = true;

    /* ---------------- 颜色工具 ---------------- */
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    const hexToRgb = (hex) => {
      const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
      if (!m) return { r: 0, g: 0, b: 0 };
      const n = parseInt(m[1], 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    };
    const toHex = ({ r, g, b }) => `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    const mix = (a, b, t) => {
      const x = hexToRgb(a), y = hexToRgb(b);
      return toHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
    };
    const lighten = (c, t) => mix(c, "#ffffff", t);
    const darken = (c, t) => mix(c, "#000000", t);
    const rgba = (c, a) => { const { r, g, b } = hexToRgb(c); return `rgba(${r},${g},${b},${a})`; };

    /** 本机实测的 133 个 token 名（运行时扫描之外的兜底基线） */
    const BASELINE_TOKENS = ["--dsw-alias-bg-base", "--dsw-alias-bg-document-preview", "--dsw-alias-bg-document-selection", "--dsw-alias-bg-l1", "--dsw-alias-bg-layer-1", "--dsw-alias-bg-layer-2", "--dsw-alias-bg-layer-3", "--dsw-alias-bg-layer-4", "--dsw-alias-bg-mask-1", "--dsw-alias-bg-mask-2", "--dsw-alias-bg-mask-3", "--dsw-alias-bg-mask-drop", "--dsw-alias-bg-mask-photo", "--dsw-alias-bg-module-platform", "--dsw-alias-bg-multi-select", "--dsw-alias-bg-overlay", "--dsw-alias-bg-skeleton", "--dsw-alias-border-inverted", "--dsw-alias-border-inverted2", "--dsw-alias-border-l1", "--dsw-alias-border-l2", "--dsw-alias-border-l2-darkmode-thin", "--dsw-alias-border-l3", "--dsw-alias-border-l4", "--dsw-alias-brand-primary", "--dsw-alias-brand-primary-invert", "--dsw-alias-brand-primary-new-colorprimary-new-color", "--dsw-alias-brand-text", "--dsw-alias-button-contrast-fill", "--dsw-alias-button-elevated-fill", "--dsw-alias-button-floating-fill", "--dsw-alias-button-floating-hover", "--dsw-alias-button-ghost-active-border", "--dsw-alias-button-ghost-active-fill", "--dsw-alias-button-ghost-active-hover", "--dsw-alias-button-info-fill", "--dsw-alias-button-info-hover", "--dsw-alias-button-primary-dimmed", "--dsw-alias-button-primary-fill", "--dsw-alias-button-primary-hover", "--dsw-alias-button-tool-bar-fill", "--dsw-alias-button-tool-bar-fill-invisible", "--dsw-alias-button-tool-bar-hover", "--dsw-alias-code-diff-added", "--dsw-alias-code-diff-deleted", "--dsw-alias-file-diff-added-bg", "--dsw-alias-file-diff-added-gutter", "--dsw-alias-file-diff-added-marker", "--dsw-alias-file-diff-deleted-bg", "--dsw-alias-file-diff-deleted-gutter", "--dsw-alias-file-diff-deleted-marker", "--dsw-alias-fill-l1", "--dsw-alias-fill-l2", "--dsw-alias-fill-tertiary", "--dsw-alias-fill-tsp-secondary", "--dsw-alias-illustration-background", "--dsw-alias-illustration-backing", "--dsw-alias-illustration-detail", "--dsw-alias-illustration-inset", "--dsw-alias-illustration-shadow", "--dsw-alias-illustration-surface", "--dsw-alias-interactive-bg-active", "--dsw-alias-interactive-bg-hover", "--dsw-alias-interactive-bg-hover-accent", "--dsw-alias-interactive-bg-hover-danger", "--dsw-alias-interactive-bg-hover-solid", "--dsw-alias-label-caption", "--dsw-alias-label-deep-diving", "--dsw-alias-label-deep-diving-shimmer", "--dsw-alias-label-dimmed", "--dsw-alias-label-document-preview", "--dsw-alias-label-error", "--dsw-alias-label-primary", "--dsw-alias-label-primary-bluish", "--dsw-alias-label-primary-dimmed", "--dsw-alias-label-primary-foreground", "--dsw-alias-label-primary-inverted", "--dsw-alias-label-quaternary", "--dsw-alias-label-secondary", "--dsw-alias-label-shimmer", "--dsw-alias-label-tertiary", "--dsw-alias-link", "--dsw-alias-markdown-citation", "--dsw-alias-markdown-code-block", "--dsw-alias-markdown-code-block-banner", "--dsw-alias-markdown-code-segment-selected", "--dsw-alias-markdown-code-segment-unselected", "--dsw-alias-markdown-inline-code", "--dsw-alias-markdown-placeholder", "--dsw-alias-markdown-tag", "--dsw-alias-menu-group-header-fill", "--dsw-alias-menu-icon", "--dsw-alias-onboarding-accent", "--dsw-alias-onboarding-card-fill", "--dsw-alias-onboarding-checkbox-border", "--dsw-alias-onboarding-secondary-fill", "--dsw-alias-scrollbar-bg-l1", "--dsw-alias-scrollbar-bg-l2", "--dsw-alias-scrollbar-hover-l1", "--dsw-alias-scrollbar-hover-l2", "--dsw-alias-separator-primary", "--dsw-alias-settings-card-fill", "--dsw-alias-settings-card-stroke", "--dsw-alias-state-business-primary", "--dsw-alias-state-business-tertiary", "--dsw-alias-state-done-primary", "--dsw-alias-state-error-primary", "--dsw-alias-state-error-secondary", "--dsw-alias-state-idle-primary", "--dsw-alias-state-success-primary", "--dsw-alias-state-success-secondary", "--dsw-alias-state-success-tertiary", "--dsw-alias-state-warn-label", "--dsw-alias-state-warn-primary", "--dsw-alias-state-warn-secondary", "--dsw-alias-state-warn-tertiary", "--dsw-alias-switch-thumb", "--dsw-alias-toast-bg", "--dsw-alias-toast-label", "--dsw-alias-tooltip-bg", "--dsw-alias-tooltip-key-bg", "--dsw-alias-turn-trigger-bg", "--dsw-alias-turn-trigger-bg-hover", "--dsw-specific-bubble", "--dsw-specific-bubble-highlight", "--dsw-specific-input-major", "--dsw-specific-login-input", "--dsw-specific-menu", "--dsw-specific-selector", "--dsw-specific-sidebar-fill", "--dsw-specific-sidebar-nav-item-active", "--dsw-specific-sidebar-nav-item-active-accent", "--dsw-specific-tip"];

    const DEFAULTS = {
      brand: "#37a3d6",        // 青蓝主色（截图里的按钮描边 / 高亮）
      accent: "#1f6fa8",       // 深蓝（悬停 / 次级强调）
      bgLight: "#eef6fb",      // 冰蓝白
      bgDark: "#0a1626",       // 深海军蓝
      inkLight: "#0f1b26",
      inkDark: "#dbeaf5",
    };

    /* ---------------- 语义调色板（明/暗各一份） ---------------- */
    function palette(colors, mode) {
      const dark = mode === "dark";
      const base = dark ? colors.bgDark : colors.bgLight;
      const ink = dark ? colors.inkDark : colors.inkLight;
      const up = (t) => (dark ? lighten(base, t) : mix(base, ink, t));
      const down = (t) => (dark ? darken(base, t) : mix(base, ink, t));
      return {
        base, ink, up, down,
        layer1: up(0.05), layer2: up(0.09), layer3: up(0.14), overlay: up(0.11),
        border1: dark ? lighten(base, 0.16) : mix(ink, base, 0.82),
        border2: dark ? lighten(base, 0.24) : mix(ink, base, 0.66),
        border3: dark ? lighten(base, 0.32) : mix(ink, base, 0.52),
        border4: dark ? lighten(base, 0.42) : mix(ink, base, 0.38),
        muted: mix(ink, base, dark ? 0.42 : 0.52),
        brand: dark ? lighten(colors.brand, 0.12) : colors.brand,
        brandDim: rgba(colors.brand, dark ? 0.4 : 0.35),
        brandSoft: rgba(colors.brand, dark ? 0.16 : 0.1),
        accent: dark ? lighten(colors.accent, 0.22) : colors.accent,
        accentSoft: rgba(colors.accent, 0.14),
        error: dark ? lighten(colors.accent, 0.24) : colors.accent,
        success: dark ? "#5f9e79" : "#3f6b4f",
        warn: dark ? "#d2a34a" : "#b47b22",
        idle: mix(ink, base, 0.55),
        sidebar: dark ? darken(mix(base, colors.brand, 0.06), 0.18) : mix(base, colors.brand, 0.08),
        gold: colors.brand, // 历史命名；v1.4 起此值为品牌青蓝，不是金色
      };
    }

    /** 变量名 → 语义键。返回 null 表示"不认识，不覆盖"。 */
    function classify(name) {
      const n = name.replace(/^--dsw-(alias|specific)-/, "");
      const has = (...keys) => keys.some((k) => n.includes(k));
      if (has("bg-document-selection", "multi-select")) return "brandSoft";
      if (has("bg-document-preview", "module-platform")) return "layer2";
      if (has("bg-skeleton")) return "layer2";
      if (has("bg-mask")) return "down15";
      if (n === "bg-base") return "base";
      if (/^bg-layer-[123]$/.test(n) || /^bg-l[123]$/.test(n)) return "layer" + n.slice(-1);
      if (n === "bg-overlay") return "overlay";
      if (n.startsWith("border")) {
        if (has("inverted2")) return "border4";
        if (has("inverted")) return "ink";
        if (has("l3")) return "border3";
        if (has("l4")) return "border4";
        if (has("l2")) return "border2";
        return "border1";
      }
      if (n === "brand-primary") return "brand";
      if (n === "brand-primary-invert" || n === "brand-text") return "base";
      if (n === "brand-primary-new-colorprimary-new-color") return "brand";
      if (n.startsWith("label-")) {
        if (n === "label-primary") return "ink";
        if (has("inverted")) return "base";
        return n.includes("secondary") ? "muted" : "muted";
      }
      if (n.startsWith("state-")) {
        if (has("error")) return "error";
        if (has("success")) return "success";
        if (has("warn")) return "warn";
        return "idle";
      }
      if (n.startsWith("button-primary")) {
        if (has("hover")) return "brandHover";
        if (has("dimmed")) return "brandDim";
        return "brand";
      }
      if (n.startsWith("button-")) {
        if (has("contrast")) return "ink";
        if (has("invisible", "ghost")) return "overlay";
        if (has("hover", "active")) return "brandSoft";
        return "brandSoft";
      }
      if (n.startsWith("code-diff") || n.startsWith("file-diff")) {
        if (has("added")) return "success";
        if (has("deleted")) return "error";
        return "layer2";
      }
      if (n.startsWith("illustration-")) {
        if (has("detail", "inset")) return "brand";
        if (has("shadow")) return "down15";
        return "layer1";
      }
      if (n.startsWith("interactive-bg")) {
        if (has("danger")) return "accentSoft";
        if (has("accent")) return "brandSoft";
        if (has("active")) return "layer3";
        return "layer2";
      }
      if (n.startsWith("sidebar-nav-item")) {
        if (has("active-accent")) return "brand";
        if (has("active")) return "brandSoft";
        if (has("hover")) return "layer2";
        return "overlay";
      }
      if (n === "sidebar-fill") return "sidebar";
      if (n === "tip") return "overlay";
      if (n === "link") return "brand";
      if (n.startsWith("markdown-code-block") || n.startsWith("markdown-code-segment")) return "layer2";
      if (n.startsWith("markdown-inline-code")) return "layer2";
      if (n.startsWith("markdown-")) return "muted";
      if (n === "separator-primary") return "border1";
      if (n === "settings-card-fill") return "layer1";
      if (n === "settings-card-stroke") return "border1";
      if (n === "switch-thumb") return "ink";
      if (n === "toast-bg") return "overlay";
      if (n.startsWith("tooltip")) return "overlay";
      if (n === "turn-trigger-bg") return "layer2";
      if (n === "bubble-highlight") return "brandSoft";
      if (n === "bubble") return "layer1";
      if (n === "input-major" || n === "login-input") return "layer1";
      if (n === "menu" || n === "menu-icon") return "layer2";
      if (n === "selector") return "layer2";
      if (n === "menu-group-header-fill") return "layer3";
      if (n.startsWith("scrollbar")) return "border2";
      if (n.startsWith("fill") || has("onboarding")) return "layer2";
      if (has("brand")) return "brand";
      if (has("bg-")) return "layer1";
      if (has("border")) return "border1";
      if (has("label", "text")) return "ink";
      return null;
    }

    function valueFor(key, pal) {
      switch (key) {
        case "layer1": case "layer2": case "layer3": case "overlay": return pal[key];
        case "brandHover": return lighten(pal.brand, 0.12);
        case "down15": return rgba(pal.ink, 0.06);
        default: return pal[key] ?? null;
      }
    }

    /* ---------------- L1：收集 + 映射 ---------------- */
    function collectNames() {
      const names = new Set(BASELINE_TOKENS);
      const scan = (rules) => {
        for (const rule of rules) {
          const css = rule.cssText || "";
          if (!css.includes("--dsw-")) continue;
          for (const m of css.matchAll(/--dsw-(?:alias|specific)-[a-z0-9-]+/gi)) names.add(m[0]);
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        let rules = [];
        try { rules = Array.from(sheet.cssRules || []); } catch { continue; }
        for (const rule of rules) {
          if (rule.cssRules) { try { scan(Array.from(rule.cssRules)); } catch {} }
          else scan([rule]);
        }
      }
      return Array.from(names);
    }

    function buildPairs(colors) {
      const names = collectNames();
      const light = palette(colors, "light");
      const dark = palette(colors, "dark");
      const pairs = {};
      const stats = { total: names.length, mapped: 0, skipped: [] };
      for (const name of names) {
        const key = classify(name);
        if (!key) { stats.skipped.push(name); continue; }
        const l = valueFor(key, light);
        const d = valueFor(key, dark);
        if (!l || !d) { stats.skipped.push(name); continue; }
        pairs[name] = { light: l, dark: d };
        stats.mapped += 1;
      }
      return { pairs, stats };
    }

    /* ---------------- M6：壁纸 / 玻璃（配置驱动，默认关） ---------------- */
    const WALL_ATTR = "data-sdt-wall";
    const WALL_CLEAR = "data-sdt-wall-clear";
    /** 壁纸开时：挑一个「全屏、非 fixed」的宿主容器挂壁纸，其余全屏层清底。
     *  避免依赖 body/伪元素（实测宿主自己的全屏 frame 才是实际绘制面）。 */
    let wallVideo = null;
    function clearWallVideo() {
      if (wallVideo) { wallVideo.remove(); wallVideo = null; }
    }
    function ensureWallVideo(url) {
      if (wallVideo) return;
      const wrap = document.createElement("div");
      wrap.id = "dsh-sdt-wall";
      wrap.style.cssText = "position:fixed;inset:0;z-index:0;pointer-events:none;background:#0a1626;overflow:hidden";
      const video = document.createElement("video");
      video.src = url; video.muted = true; video.loop = true; video.autoplay = true; video.playsInline = true;
      video.setAttribute("muted", ""); video.setAttribute("playsinline", "");
      video.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
      const scrim = document.createElement("div");
      scrim.style.cssText = "position:absolute;inset:0;background:rgba(4,8,14,.62)";
      wrap.appendChild(video); wrap.appendChild(scrim);
      document.body.prepend(wrap);
      wallVideo = wrap;
      video.play().catch(() => {});
    }
    function syncWallpaperDom(enabled, wallpaper) {
      const isVideo = !!wallpaper && /\.(mp4|webm)$/i.test(wallpaper);
      if (!enabled) {
        clearWallVideo();
        for (const el of document.querySelectorAll(`[${WALL_ATTR}],[${WALL_CLEAR}]`)) {
          el.style.removeProperty("background-color");
          el.style.removeProperty("background-image");
          el.style.removeProperty("z-index");
          el.removeAttribute(WALL_ATTR);
          el.removeAttribute(WALL_CLEAR);
        }
        return;
      }
      if (isVideo) ensureWallVideo(`/sdt/asset/${encodeURIComponent(wallpaper)}`);
      else clearWallVideo();
      const vw = window.innerWidth, vh = window.innerHeight;
      let walled = false;
      try {
      for (const el of document.querySelectorAll("div,main")) {

        if (el.id === "sdt-splash") continue;
        const cs = getComputedStyle(el);
        if (cs.position === "fixed") continue;
        const r = el.getBoundingClientRect();
        if (r.width < vw * 0.8 || r.height < vh * 0.8) continue;
        if (cs.backgroundColor === "rgba(0, 0, 0, 0)" && cs.backgroundImage === "none" && walled) continue;

        el.style.setProperty("background-color", "transparent", "important");
        if (isVideo) el.style.setProperty("z-index", "1", "important");
        if (!walled && !isVideo) {
          el.removeAttribute(WALL_CLEAR);
          el.setAttribute(WALL_ATTR, "1");
          walled = true;
        } else {
          el.style.setProperty("background-image", "none", "important");
          el.setAttribute(WALL_CLEAR, "1");
        }
      }
      } catch (error) { window.__sdtWallErr = String((error && error.message) || error); }

      // 语义锚点：聊天区/侧栏内所有不透明 div 一律清底（不依赖尺寸猜测）
      try {
        for (const anchor of ['[data-slot="main.conversation"]']) {
          const root = document.querySelector(anchor);
          if (!root) continue;
          for (const el of [root, ...root.querySelectorAll('div')]) {
            if (el.id === 'sdt-splash' || el.id === 'dsh-sdt-wall') continue;
            const cs = getComputedStyle(el);
            if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' && cs.backgroundImage === 'none') continue;
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('background-image', 'none', 'important');
            if (isVideo) el.style.setProperty('z-index', '1', 'important');
            el.setAttribute(WALL_CLEAR, '1');
          }
        }
      } catch (error) { window.__sdtWallErr2 = String((error && error.message) || error); }

      // 锚点祖先链：main / sidebar 的父级包装层（centerCol、frame 等）也在其中
      try {
        for (const anchor of ['[data-slot="main"]']) {
          let node = document.querySelector(anchor);
          node = node && node.parentElement;
          while (node && node !== document.body) {
            const cs = getComputedStyle(node);
            if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none') {
              node.style.setProperty('background-color', 'transparent', 'important');
              node.style.setProperty('background-image', 'none', 'important');
              if (isVideo) node.style.setProperty('z-index', '1', 'important');
              node.setAttribute(WALL_CLEAR, '1');
            }
            node = node.parentElement;
          }
        }
      } catch (error) { window.__sdtWallErr3 = String((error && error.message) || error); }
    }

    function surfaceCss(colors, surface) {
      if (!surface) return "";
      const rules = [];
      if (surface.wallpaper) {
        const url = `/sdt/asset/${encodeURIComponent(surface.wallpaper)}`;
        rules.push(`:root{--sdt-wall:url("${url}")}`);
        rules.push(`[data-sdt-wall]{background-image:linear-gradient(${rgba(colors.bgLight, 0.55)},${rgba(colors.bgLight, 0.55)}),var(--sdt-wall)!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;}`);
        rules.push(`body[data-ds-dark-theme] [data-sdt-wall]{background-image:linear-gradient(${rgba(colors.bgDark, 0.50)},${rgba(colors.bgDark, 0.50)}),var(--sdt-wall)!important;}`);
        // 双保险：body 也铺一份（部分构建里 body 才是画布层）
        rules.push(`html body{background-image:linear-gradient(${rgba(colors.bgLight, 0.55)},${rgba(colors.bgLight, 0.55)}),var(--sdt-wall)!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;}`);
        rules.push(`html body[data-ds-dark-theme]{background-image:linear-gradient(${rgba(colors.bgDark, 0.50)},${rgba(colors.bgDark, 0.50)}),var(--sdt-wall)!important;}`);
      }
      if (surface.glass) {
        rules.push(`[data-sdt-glass]{background:color-mix(in srgb,var(--dsw-alias-bg-l1) 86%,transparent)!important;background-image:none!important;backdrop-filter:blur(16px) saturate(1.1);-webkit-backdrop-filter:blur(16px) saturate(1.1);}`);
        rules.push(`[data-slot="conversation.session.header"],[data-slot="conversation.header"]{background:color-mix(in srgb,var(--dsw-alias-bg-l1) 82%,transparent)!important;backdrop-filter:blur(14px) saturate(1.1);-webkit-backdrop-filter:blur(14px) saturate(1.1);}`);
        rules.push(`[data-slot="sidebar"]{background:color-mix(in srgb,var(--dsw-alias-bg-l1) 85%,transparent)!important;backdrop-filter:blur(16px) saturate(1.15);-webkit-backdrop-filter:blur(16px) saturate(1.15);}`);
        rules.push(`[data-composer-card]{background:color-mix(in srgb,var(--dsw-alias-bg-l1) 88%,transparent)!important;backdrop-filter:blur(18px) saturate(1.1);-webkit-backdrop-filter:blur(18px) saturate(1.1);}`);
        rules.push(`@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){[data-slot="sidebar"],[data-composer-card]{background:var(--dsw-alias-bg-l1)!important;}}`);
      }
      return rules.join("\n");
    }

    /* ---------------- L2：语法 CSS（只用稳定锚点） ---------------- */
    function buildCss(colors, surface) {
      return `:root{
  --bj-gold: ${colors.brand};
  --bj-gold-line: ${rgba(colors.brand, 0.45)};
  --bj-gold-glow: ${rgba(colors.brand, 0.16)};
  --bj-frame-line: ${rgba(colors.accent, 0.35)};
  --bj-accent: ${colors.accent};
  --bj-radius-card: 10px;
  --bj-radius-control: 6px;
  --bj-shadow-soft: 0 1px 2px ${rgba(colors.inkLight, 0.08)}, 0 10px 28px ${rgba(colors.inkLight, 0.12)};
  --bj-font-display: "Noto Serif SC", "Source Han Serif SC", "Songti SC", Georgia, serif;
  --dsh-font-family-text: "Noto Serif SC", "Source Han Serif SC", "Songti SC", Georgia, serif;
  --dsh-font-family-code: "JetBrains Mono", ui-monospace, Consolas, monospace;
  --dsh-font-family-terminal: "JetBrains Mono", ui-monospace, Consolas, monospace;
}
/* L3 密度：只改「间距 / 几何」，不改字号。
   实测（v1.6）：宿主在 body 内联写了 --dsh-content-font-size / --dsh-code-font-size，
   那是用户字号偏好的落点，插件覆盖会与之抢写并造成闪烁 → 字号交还宿主。
   下面两个变量定义在 [data-conversation-content] 的哈希类上，用语义属性锚点以更高优先级覆盖。 */
html body [data-conversation-content]{
  --dsh-composer-side-clearance: 20px;
  --dsh-composer-card-max-width: calc(var(--dsh-chat-content-width) + 48px);
}
/* G6 菱格底纹（仅深色） */
body[data-ds-dark-theme]{
  background-image:
    repeating-linear-gradient(45deg, ${rgba(colors.brand, 0.09)} 0 1px, transparent 1px 22px),
    repeating-linear-gradient(-45deg, ${rgba(colors.brand, 0.09)} 0 1px, transparent 1px 22px);
  background-attachment: fixed;
}
/* G2 品牌色发丝线：只在稳定锚点上加边框，不动尺寸 */
[data-slot="sidebar"]{ border-right: 1px solid var(--bj-gold-line); }
[data-slot="conversation.session"] header{ border-bottom: 1px solid var(--bj-gold-line); }
[data-slot="sidebar"]{ box-shadow: inset -1px 0 0 var(--bj-gold-line); }
[data-slot="shell.overlay"] > *{ --bj-in-overlay: 1; }
::selection{ background: var(--bj-gold-glow); color: inherit; }
${surfaceCss(colors, surface)}
[data-sdt-wall-clear]{background-color:transparent!important;background-image:none!important;z-index:1!important}
[data-slot="main"]{text-shadow:0 1px 10px rgba(0,0,0,.55)}
`;
    }

    function injectStyle(css) {
      // 幂等：同 id 的旧样式先移除，避免配置重载后叠加两份
      for (const old of Array.from(document.querySelectorAll("#dsh-sdt-vars"))) old.remove();
      const el = document.createElement("style");
      el.id = "dsh-sdt-vars";
      el.dataset.sdt = VERSION;
      el.textContent = css;
      document.head.appendChild(el);
      return () => el.remove();
    }

    /* ---------------- M4：只读信息卡 ---------------- */
    function makeSettingsCard() {
      let React = null;
      try { React = require("react"); } catch { return null; }
      if (!React) return null;
      const h = React.createElement;
      const row = (label, value) => h("div", {
        style: { display: "flex", gap: "12px", fontSize: 13, lineHeight: 1.8 },
      },
        h("span", { style: { minWidth: 64, color: "var(--dsw-alias-label-secondary)" } }, label),
        h("span", { style: { color: "var(--dsw-alias-label-primary)" } }, value));

      return function SdtSettingsSection() {
        const debug = window.__sdtDebug || {};
        const source = debug.source === "file" ? "sdt.config.json" : "内置默认值";
        return h("section", {
          style: {
            padding: "14px 0 10px",
            borderTop: "1px solid var(--dsw-alias-border-l1)",
            fontFamily: "var(--dsh-font-family-text)",
          },
        },
          h("div", { style: { fontSize: 13, fontWeight: 600, letterSpacing: ".08em", color: "var(--dsw-alias-brand-primary)" } }, "DSH-SDT"),
          row("版本", `v${debug.version || VERSION}`),
          row("token", `${debug.mapped ?? "?"} / ${debug.total ?? "?"}`),
          row("配置", source),
          row("控制台", "/sdt/console"),
          row("目录", "$DSH_HOME/sdt/"),
          h("div", { style: { marginTop: 10 } },
            h("button", {
              type: "button",
              onClick: () => {
                fetch("/sdt/safe-mode", {
                  method: "POST",
                  credentials: "same-origin",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ enabled: true }),
                }).then(() => location.reload()).catch(() => {});
              },
              style: {
                fontSize: 12, padding: "5px 10px", borderRadius: 6, cursor: "pointer",
                border: "1px solid var(--dsw-alias-border-l1)", background: "transparent",
                color: "var(--dsw-alias-label-secondary)",
              },
            }, "进入安全模式（停用主题）")));
      };
    }

    /* ---------------- M2：输入 dock 氛围条 ---------------- */
    function makeDock() {
      let React = null;
      try { React = require("react"); } catch { return null; }
      if (!React) return null;
      const h = React.createElement;
      return function SdtDock() {
        return h("div", {
          "data-sdt-dock": "",
          style: {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: 16, padding: "0 2px", fontSize: 10, letterSpacing: ".14em",
            color: "var(--dsw-alias-label-secondary)", opacity: 0.72,
            pointerEvents: "none", userSelect: "none",
          },
        },
          h("span", null, "DSH-SDT"),
          h("span", null, "v" + VERSION));
      };
    }

    /* ---------------- M1：覆盖层骨架（默认关闭） ---------------- */
    function makeOverlay() {
      let React = null;
      try { React = require("react"); } catch { return null; }
      if (!React) return null;
      const h = React.createElement;
      const corner = (style, key) => h("div", {
        key,
        style: Object.assign({
          position: "absolute", width: 12, height: 12,
          borderColor: "var(--dsw-alias-brand-primary)", borderStyle: "solid",
          opacity: 0.35,
        }, style),
      });
      return function SdtHud() {
        return h("div", {
          "data-sdt-overlay": "",
          style: {
            position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
            fontFamily: "var(--dsh-font-family-text)",
          },
        },
          h("div", {
            style: {
              position: "absolute", top: 10, right: 16, fontSize: 9, letterSpacing: ".18em",
              color: "var(--dsw-alias-brand-primary)", opacity: 0.55,
            },
          }, "SDT HUD"),
          corner({ top: 8, left: 8, borderWidth: "1px 0 0 1px" }, "tl"),
          corner({ top: 8, right: 8, borderWidth: "1px 1px 0 0" }, "tr"),
          corner({ bottom: 8, left: 8, borderWidth: "0 0 1px 1px" }, "bl"),
          corner({ bottom: 8, right: 8, borderWidth: "0 1px 1px 0" }, "br"));
      };
    }

    /* ---------------- M1b：点击特效（移植自用户提供的 FGO点击特效.html） ----------------
       改动：canvas 透明叠层、clearRect 而非填底、pointer-events:none、无自动演示、
       只在有爆发时跑 rAF，闲时停帧。 */
    function makeClickEffect() {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
      const HUES = [
        { h: 151, s: 92, l: 49 }, { h: 164, s: 94, l: 51 }, { h: 185, s: 96, l: 54 },
        { h: 207, s: 96, l: 58 }, { h: 230, s: 94, l: 62 }, { h: 273, s: 88, l: 66 },
      ];
      const LIFE = 900;
      let scale = 1; // 1 = 原始大小；由 motion.click.scale 驱动（0.5–3）
      const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
      const now = () => performance.now();
      const mulberry32 = (a) => () => {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      const hsl = (c, a, dl, ds) =>
        `hsla(${c.h},${clamp(c.s + (ds || 0), 0, 100)}%,${clamp(c.l + (dl || 0), 0, 96)}%,${a})`;
      const R = Math.random;

      const canvas = document.createElement("canvas");
      canvas.id = "dsh-sdt-fx";
      canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483000";
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      let W = 0, H = 0, DPR = 1;
      function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      }
      resize();

      function dmdG(cx, cy, radius, rot, col, alpha, ratio) {
        const w = ratio || 1;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.fillStyle = hsl(col, 1, 0);
        ctx.beginPath();
        ctx.moveTo(0, -radius); ctx.lineTo(radius * w, 0); ctx.lineTo(0, radius); ctx.lineTo(-radius * w, 0);
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
      function edgePoint(e, t, radius, rot, w) {
        const hw = radius * (w || 1);
        let bx, by;
        if (e === 0) { bx = hw * t; by = -radius + radius * t; }
        else if (e === 1) { bx = hw - hw * t; by = radius * t; }
        else if (e === 2) { bx = -hw * t; by = radius - radius * t; }
        else { bx = -hw + hw * t; by = -radius * t; }
        return { x: bx * Math.cos(rot) - by * Math.sin(rot), y: bx * Math.sin(rot) + by * Math.cos(rot) };
      }
      function makeBurst(x, y, seed) {
        const R = seed === undefined ? Math.random : mulberry32(seed);
        const pi = R() < 0.55 ? 0 : R() < 0.62 ? 1 : R() < 0.55 ? 2 : R() < 0.6 ? 3 : R() < 0.6 ? 4 : 5;
        const ci = R() < 0.5 ? clamp(pi + 1 + Math.floor(R() * 3), 0, 5) : Math.floor(R() * 6);
        const hues = [HUES[pi], HUES[ci]];
        if (R() < 0.45) hues.push(HUES[(ci + 2) % 6]);
        const maxR = (72 + R() * 50) * scale;
        const ratioA = 0.68 + R() * 0.12;
        const bStart = 132 + R() * 42;
        const bDur = 118 + R() * 52;
        const bR = maxR * (0.50 + R() * 0.14);
        const explodeAt = bStart + bDur;
        const ratioB = 0.63 + R() * 0.13;
        const n = 14 + Math.floor(R() * 4);
        const counts = [3, 3, 3, 3];
        for (let q = 12; q < n; q += 1) counts[Math.floor(R() * 4)] += 1;
        const shards = [];
        for (let e = 0; e < 4; e += 1) {
          const cnt = counts[e];
          for (let j = 0; j < cnt; j += 1) {
            let t = (j + 0.06 + R() * 0.88) / cnt;
            t = clamp(t, 0.02, 0.98);
            const p = edgePoint(e, t, bR, 0, ratioB);
            const ang = Math.atan2(p.y, p.x);
            const rad = (R() - 0.5) * 0.3 * bR;
            p.x += Math.cos(ang) * rad; p.y += Math.sin(ang) * rad;
            const big = R() < 0.45;
            const sz = big ? (0.58 + R() * 0.34) * bR : (0.28 + R() * 0.24) * bR;
            shards.push({
              px: p.x, py: p.y, sz, ang,
              drift: (3 + R() * 26) * (0.5 + sz / bR),
              col: hues[Math.floor(R() * hues.length)],
              w: 0.52 + R() * 0.34,
              sway: (R() - 0.5) * 16,
              delay: R() * 115, life: 280 + R() * 300,
              echo: R() < 0.6,
            });
          }
        }
        const sparks = [];
        const ns = 3 + Math.floor(R() * 3);
        for (let j = 0; j < ns; j += 1) {
          const ea = R() * Math.PI * 2;
          const er = bR * (0.98 + R() * 0.62);
          sparks.push({
            x: Math.cos(ea) * er, y: Math.sin(ea) * er,
            sz: (4 + R() * 8) * scale, delay: R() * 150, life: 150 + R() * 230,
            col: hues[Math.floor(R() * hues.length)],
          });
        }
        return {
          x, y, born: now(), maxR, ratioA, bStart, explodeAt, bR, ratioB,
          colA: HUES[pi], colB: R() < 0.42 ? HUES[pi] : HUES[ci], shards, sparks,
        };
      }

      const bursts = [];
      let raf = 0, running = false;
      function drawA(b, age) {
        if (age > 300) return;
        const grow = clamp(age / 125, 0, 1);
        const rr = b.maxR * easeOutCubic(grow);
        const fade = age > 152 ? clamp(1 - (age - 152) / 130, 0, 1) : 1;
        dmdG(b.x, b.y, rr, 0, b.colA, 0.4 * Math.min(grow * 1.6, 1) * fade, b.ratioA);
      }
      function drawB(b, age) {
        if (age < b.bStart || age >= b.explodeAt) return;
        const k = (age - b.bStart) / (b.explodeAt - b.bStart);
        dmdG(b.x, b.y, b.bR * easeOutQuad(k), 0, b.colB,
          0.34 * Math.min(1, (age - b.bStart) / 35), b.ratioB);
      }
      function drawDebris(b, age) {
        const t = age - b.explodeAt;
        if (t < 0) return;
        for (const s of b.shards) {
          const at = t - s.delay;
          if (at < 0 || at > s.life) continue;
          const q = at / s.life;
          const inK = clamp(at / 42, 0, 1);
          const outA = q > 0.55 ? 1 - (q - 0.55) / 0.45 : 1;
          const dist = s.drift * easeOutCubic(clamp(at / (s.life * 0.72), 0, 1));
          const px = b.x + s.px + Math.cos(s.ang) * dist + s.sway * q;
          const py = b.y + s.py + Math.sin(s.ang) * dist * 0.9;
          if (s.echo) {
            dmdG(px + Math.cos(s.ang) * (s.sz * 0.6), py + Math.sin(s.ang) * (s.sz * 0.6),
              s.sz * 0.44, 0, HUES[2], 0.26 * inK * outA, s.w * 0.9);
          }
          dmdG(px, py, s.sz * 0.62, 0,
            { h: s.col.h + q * 22, s: s.col.s, l: s.col.l + q * 4 },
            0.84 * inK * outA, s.w);
        }
        for (const k of b.sparks) {
          const aj = t - k.delay;
          if (aj < 0 || aj > k.life) continue;
          const pj = aj / k.life;
          const a2 = clamp(aj / 30, 0, 1) * (1 - pj);
          dmdG(b.x + k.x * (1 + pj * 0.7), b.y + k.y * (1 + pj * 0.7), k.sz * 0.9, 0, k.col, 0.66 * a2, 0.72);
        }
      }
      function frame() {
        const t = now();
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.clearRect(0, 0, W, H);
        for (let i = bursts.length - 1; i >= 0; i -= 1) {
          const b = bursts[i];
          const age = t - b.born;
          if (age > LIFE) { bursts.splice(i, 1); continue; }
          drawA(b, age); drawB(b, age); drawDebris(b, age);
        }
        canvas.dataset.bursts = String(bursts.length);
        canvas.dataset.running = running ? "1" : "0";
        if (bursts.length) raf = requestAnimationFrame(frame);
        else { running = false; }
      }
      function spawn(x, y) {
        if (bursts.length > 12) bursts.shift();
        bursts.push(makeBurst(x, y));
        if (!running) { running = true; raf = requestAnimationFrame(frame); }
      }
      const onDown = (e) => { if (e.button === 0) spawn(e.clientX, e.clientY); };
      window.addEventListener("pointerdown", onDown, true);
      window.addEventListener("resize", resize);
      document.documentElement.appendChild(canvas);
      return {
        dispose: () => {
          window.removeEventListener("pointerdown", onDown, true);
          window.removeEventListener("resize", resize);
          cancelAnimationFrame(raf);
          canvas.remove();
        },
        setScale: (value) => {
          if (typeof value === "number" && value >= 0.5 && value <= 3) scale = value;
        },
        /* 确定性静帧：同一 (seed, age) 在任何 scale 下可复现、可对比（rAF 节流环境下也能验证） */
        preview: (opts = {}) => {
          const { x, y, seed = 21, age = 430 } = opts;
          ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
          ctx.clearRect(0, 0, W, H);
          const b = makeBurst(x === undefined ? W * 0.5 : x, y === undefined ? H * 0.46 : y, seed);
          const a = Math.max(0, Math.min(age, LIFE));
          drawA(b, a); drawB(b, a); drawDebris(b, a);
          canvas.dataset.preview = "1";
        },
      };
    }

    /* ---------------- M14：大面板毛玻璃 ---------------- */
    function syncGlassDom(enabled) {
      const marked = document.querySelectorAll('[data-sdt-glass]');
      if (!enabled) {
        for (const el of marked) el.removeAttribute('data-sdt-glass');
        return;
      }
      const vw = window.innerWidth, vh = window.innerHeight;
      for (const el of document.querySelectorAll('[data-slot="main"] div, [data-slot="main"] section, [data-slot="main"] header')) {
        if (el.hasAttribute('data-sdt-glass')) continue;
        const cs = getComputedStyle(el);
        if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' && cs.backgroundImage === 'none') continue;
        const r = el.getBoundingClientRect();
        if (r.width * r.height < vw * vh * 0.18) continue;
        el.setAttribute('data-sdt-glass', '1');
      }
    }

    /* ---------------- M13：静态桌宠 ---------------- */
    function makePet(pet) {
      let React = null;
      try { React = require("react"); } catch { return null; }
      if (!React || !React.useState) return null;
      const h = React.createElement;
      const useState = React.useState;
      const useEffect = React.useEffect;
      const useRef = React.useRef;
      const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

      return function SdtPet() {
        const [idx, setIdx] = useState(0);
        const [pos, setPos] = useState(() => {
          try {
            const saved = JSON.parse(localStorage.getItem("sdt-pet-pos") || "null");
            if (saved && typeof saved.x === "number" && typeof saved.y === "number") return saved;
          } catch { /* ignore */ }
          return { x: window.innerWidth - pet.size - 24, y: window.innerHeight - pet.size - 24 };
        });
        const posRef = useRef(pos);
        posRef.current = pos;

        useEffect(() => {
          const onResize = () => setPos((p) => ({
            x: clamp(p.x, 0, window.innerWidth - pet.size),
            y: clamp(p.y, 0, window.innerHeight - pet.size),
          }));
          window.addEventListener("resize", onResize);
          return () => window.removeEventListener("resize", onResize);
        }, []);

        const onPointerDown = (e) => {
          e.preventDefault();
          const start = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false };
          const onMove = (ev) => {
            const dx = ev.clientX - start.sx, dy = ev.clientY - start.sy;
            if (Math.hypot(dx, dy) > 4) start.moved = true;
            setPos({
              x: clamp(start.ox + dx, 0, window.innerWidth - pet.size),
              y: clamp(start.oy + dy, 0, window.innerHeight - pet.size),
            });
          };
          const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            if (start.moved) {
              try { localStorage.setItem("sdt-pet-pos", JSON.stringify(posRef.current)); } catch { /* ignore */ }
            } else if (pet.images.length > 1) {
              setIdx((i) => (i + 1) % pet.images.length);
            }
          };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        };

        const src = `/sdt/asset/${encodeURIComponent(pet.images[idx % pet.images.length])}`;
        return h("div", {
          "data-sdt-pet": "",
          title: pet.images.length > 1 ? "拖动移动 · 点击换装" : "拖动移动",
          onPointerDown,
          style: {
            position: "fixed", left: pos.x, top: pos.y, width: pet.size,
            zIndex: 2147482000, pointerEvents: "auto", cursor: "grab",
            userSelect: "none", touchAction: "none",
            filter: "drop-shadow(0 10px 24px rgba(0,0,0,.35))",
          },
        }, h("img", {
          src, draggable: false, alt: "",
          style: { width: "100%", display: "block", pointerEvents: "none" },
        }));
      };
    }

    /* ---------------- M12：英雄区改写（标题 / 图标） ---------------- */
    function applyHeroTitle(text) {
      const set = () => {
        let changed = 0;
        for (const el of document.querySelectorAll("span")) {
          if (el.children.length === 0 && (el.textContent || "").trim() === "探索未至之境") {
            el.textContent = text;
            el.style.color = "#f7e7c2";
            el.style.fontWeight = "600";
            el.style.textShadow = "0 2px 16px rgba(0,0,0,.85)";
            changed += 1;
          }
        }
        return changed;
      };
      set();
      let timer = 0;
      const mo = new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(set, 60);
      });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
      return () => { mo.disconnect(); clearTimeout(timer); };
    }

    function makeHeroMark(mark) {
      let React = null;
      try { React = require("react"); } catch { return null; }
      if (!React) return null;
      const h = React.createElement;
      return function SdtHeroMark() {
        return h("img", {
          src: `/sdt/asset/${encodeURIComponent(mark)}`,
          alt: "", "data-sdt-hero-mark": "",
          style: { width: 34, height: 34, objectFit: "contain", display: "block", borderRadius: 8 },
        });
      };
    }

    /* ---------------- M10：应用内面板（占位矩阵 / 皮肤 / 状态） ---------------- */
    const panelState = {
      open: false, tab: "features", loading: false, error: null,
      features: null, skins: null, config: null, health: null,
    };
    const panelSubs = new Set();
    function pushPanel(patch) {
      Object.assign(panelState, patch);
      const snapshot = { ...panelState };
      for (const fn of panelSubs) { try { fn(snapshot); } catch { /* 单个订阅者失败不影响其他 */ } }
    }
    function loadPanel() {
      if (panelState.loading) return;
      pushPanel({ loading: true, error: null });
      const get = (url) => fetch(url, { credentials: "same-origin" })
        .then((r) => (r.ok ? r.json() : null)).catch(() => null);
      Promise.all([
        get("/sdt/features.json"), get("/sdt/skins.json"),
        get("/sdt/config.json"), get("/sdt/health"),
      ]).then(([features, skins, config, health]) => {
        pushPanel({ loading: false, features, skins, config, health });
      }).catch((error) => pushPanel({ loading: false, error: String((error && error.message) || error) }));
    }
    function openPanel(tab) {
      pushPanel({ open: true, tab: tab || panelState.tab });
      loadPanel();
    }
    function closePanel() { pushPanel({ open: false }); }

    function makePanel() {
      let React = null;
      try { React = require("react"); } catch { return null; }
      if (!React || !React.useState) return null;
      const h = React.createElement;
      const useState = React.useState;
      const useEffect = React.useEffect;

      const STATUS = {
        done: ["已实现", "#2f9e6f"], partial: ["部分", "#b8862b"],
        planned: ["计划", "#7a8699"], "no-seam": ["无接缝", "#a05a5a"],
        placeholder: ["占位", "#7a8699"],
      };
      const chip = (status) => {
        const [label, color] = STATUS[status] || ["未知", "#7a8699"];
        return h("span", {
          style: {
            fontSize: 10, padding: "1px 6px", borderRadius: 999, color,
            border: "1px solid " + color, whiteSpace: "nowrap",
          },
        }, label);
      };
      const row = (k, v) => h("div", { style: { display: "flex", gap: 10, fontSize: 12, lineHeight: 1.9 } },
        h("span", { style: { minWidth: 88, color: "var(--dsw-alias-label-secondary)" } }, k),
        h("span", { style: { color: "var(--dsw-alias-label-primary)", wordBreak: "break-all" } }, v));
      const tabBtn = (id, label, active) => h("button", {
        type: "button",
        onClick: () => pushPanel({ tab: id }),
        style: {
          fontSize: 12, padding: "4px 10px", borderRadius: 999, cursor: "pointer",
          border: "1px solid " + (active ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-border-l1)"),
          background: active ? "color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent)" : "transparent",
          color: active ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-label-secondary)",
        },
      }, label);

      return function SdtPanel() {
        const [st, setSt] = useState({ ...panelState });
        useEffect(() => {
          panelSubs.add(setSt);
          return () => panelSubs.delete(setSt);
        }, []);
        useEffect(() => {
          if (!st.open) return undefined;
          const onKey = (e) => { if (e.key === "Escape") closePanel(); };
          window.addEventListener("keydown", onKey);
          return () => window.removeEventListener("keydown", onKey);
        }, [st.open]);
        if (!st.open) return null;

        const features = st.features || (st.config && st.config.features) || null;
        const modules = (features && features.modules) || [];
        const skins = (st.skins && st.skins.skins) || [];
        const cfg = st.config || {};
        const activeSkin = (cfg.skin && cfg.skin.id) || null;
        const health = st.health || {};

        let body = null;
        if (st.tab === "features") {
          body = modules.length ? modules.map((m) => h("div", {
            key: m.id,
            style: {
              padding: "8px 10px", marginBottom: 6, borderRadius: 8,
              border: "1px solid var(--dsw-alias-border-l1)",
              background: "color-mix(in srgb, var(--dsw-alias-bg-l2) 60%, transparent)",
            },
          },
            h("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
              h("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-primary)" } }, m.name),
              chip(m.status),
              h("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-secondary)" } }, m.since || "")),
            h("div", { style: { fontSize: 11, color: "var(--dsw-alias-label-secondary)", marginTop: 3, lineHeight: 1.7 } }, m.detail || "")))
            : h("div", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" } }, "功能清单读取失败");
        } else if (st.tab === "skins") {
          body = [
            h("div", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)", marginBottom: 8 } },
              "把 <id>.json 放进 $DSH_HOME/sdt/skins/，再改 appearance.skin 并刷新。"),
            ...(skins.length ? skins.map((s) => h("div", {
              key: s.id,
              style: {
                display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", marginBottom: 6,
                borderRadius: 8, border: "1px solid var(--dsw-alias-border-l1)",
              },
            },
              h("span", { style: { flex: 1, fontSize: 12, color: "var(--dsw-alias-label-primary)" } }, s.name || s.id),
              s.id === activeSkin ? chip("done") : (s.ok ? null : chip("no-seam")),
              s.ok ? h("button", {
                type: "button",
                onClick: () => {
                  fetch("/sdt/skin", {
                    method: "POST", credentials: "same-origin",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ id: s.id }),
                  }).then((r) => { if (!r.ok) throw new Error("切换失败"); location.reload(); })
                    .catch((e) => pushPanel({ error: String((e && e.message) || e) }));
                },
                style: { fontSize: 10, padding: "2px 7px", borderRadius: 6, cursor: "pointer", border: "1px solid var(--dsw-alias-border-l1)", background: "transparent", color: "var(--dsw-alias-brand-primary)" },
              }, "应用") : null,
              h("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-secondary)" } }, s.id))) : []),
            activeSkin ? h("button", {
              type: "button",
              onClick: () => {
                fetch("/sdt/skin", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: null }) })
                  .then(() => location.reload()).catch(() => {});
              },
              style: { marginTop: 8, fontSize: 11, padding: "4px 9px", borderRadius: 6, cursor: "pointer", border: "1px solid var(--dsw-alias-border-l1)", background: "transparent", color: "var(--dsw-alias-label-secondary)" },
            }, "恢复默认皮肤") : null,
          ];
        } else {
          body = [
            row("插件", "v" + ((health && health.version) || VERSION)),
            row("token", (window.__sdtDebug && window.__sdtDebug.mapped) + " / " + (window.__sdtDebug && window.__sdtDebug.total)),
            row("配置", st.config && st.config.exists ? "sdt.config.json" : "内置默认"),
            row("模式", (cfg.config && cfg.config.appearance && cfg.config.appearance.mode) || "—"),
            row("安全模式", health.safeMode ? "已开启" : "关闭"),
            row("皮肤", activeSkin || "默认"),
            row("控制台", "/sdt/console"),
          ];
        }

        return h("div", {
          style: { position: "fixed", inset: 0, zIndex: 2147483001, pointerEvents: "auto" },
        },
          h("div", {
            onClick: closePanel,
            style: { position: "absolute", inset: 0, background: "rgba(4, 10, 18, .38)" },
          }),
          h("aside", {
            style: {
              position: "absolute", top: 0, right: 0, bottom: 0,
              width: "min(440px, 94vw)", display: "flex", flexDirection: "column",
              background: "var(--dsw-alias-bg-l1)",
              borderLeft: "1px solid var(--dsw-alias-border-l1)",
              boxShadow: "-18px 0 48px rgba(0,0,0,.18)",
              fontFamily: "var(--dsh-font-family-text)",
            },
          },
            h("header", {
              style: {
                display: "flex", alignItems: "center", gap: 8, padding: "12px 14px",
                borderBottom: "1px solid var(--dsw-alias-border-l1)",
              },
            },
              h("span", { style: { fontSize: 13, fontWeight: 600, letterSpacing: ".1em", color: "var(--dsw-alias-brand-primary)" } }, "DSH-SDT"),
              h("span", { style: { flex: 1, fontSize: 10, color: "var(--dsw-alias-label-secondary)" } }, "v" + VERSION),
              h("button", {
                type: "button", onClick: closePanel, "aria-label": "关闭",
                style: { width: 24, height: 24, borderRadius: 6, cursor: "pointer", border: "1px solid var(--dsw-alias-border-l1)", background: "transparent", color: "var(--dsw-alias-label-secondary)" },
              }, "×")),
            h("div", { style: { display: "flex", gap: 6, padding: "10px 14px 6px" } },
              tabBtn("features", "功能矩阵", st.tab === "features"),
              tabBtn("skins", "皮肤", st.tab === "skins"),
              tabBtn("status", "状态", st.tab === "status")),
            h("div", { style: { flex: 1, overflow: "auto", padding: "6px 14px 14px" } },
              st.loading ? h("div", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" } }, "读取中…") : null,
              st.error ? h("div", { style: { fontSize: 12, color: "#c0504d" } }, st.error) : null,
              body),
            h("footer", {
              style: { padding: "10px 14px", borderTop: "1px solid var(--dsw-alias-border-l1)", display: "flex", justifyContent: "space-between", alignItems: "center" },
            },
              h("span", { style: { fontSize: 10, color: "var(--dsw-alias-label-secondary)" } }, "Esc 关闭"),
              h("button", {
                type: "button",
                onClick: () => window.open("/sdt/console", "_blank", "noopener"),
                style: { fontSize: 11, padding: "4px 9px", borderRadius: 6, cursor: "pointer", border: "1px solid var(--dsw-alias-border-l1)", background: "transparent", color: "var(--dsw-alias-label-secondary)" },
              }, "浏览器打开完整控制台"))));
      };
    }

    /* ---------------- M4b：侧栏面板入口（列表项） ---------------- */
    function makeMenuEntry() {
      let React = null;
      try { React = require("react"); } catch { return null; }
      if (!React) return null;
      const h = React.createElement;
      return function SdtMenuEntry() {
        return h("button", {
          type: "button",
          "data-sdt-menu": "",
          title: "打开 DSH-SDT 面板",
          onClick: () => openPanel("features"),
          style: {
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "7px 10px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "transparent", color: "var(--dsw-alias-label-primary)",
            fontSize: 13, textAlign: "left",
          },
        },
          h("svg", { viewBox: "0 0 20 20", width: 16, height: 16, style: { width: 16, height: 16, flex: "0 0 16px" }, "aria-hidden": true },
            h("path", { d: "M10 2 L18 10 L10 18 L2 10 Z", fill: "var(--dsw-alias-brand-primary)" })));
      };
    }

    /* ---------------- M4b：侧栏控制台入口 ---------------- */
    function makeConsoleButton() {
      let React = null;
      try { React = require("react"); } catch { return null; }
      if (!React) return null;
      const h = React.createElement;
      return function SdtConsoleButton() {
        const open = () => {
          if (panelState.open) closePanel();
          else openPanel("features");
        };
        return h("button", {
          type: "button",
          title: "打开 DSH-SDT 面板（功能 / 皮肤 / 状态）",
          "aria-label": "打开 DSH-SDT 面板",
          "data-sdt-console": "",
          onClick: open,
          style: {
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 26, height: 26, padding: 0, borderRadius: 8, cursor: "pointer",
            border: "1px solid var(--dsw-alias-border-l1)",
            background: "transparent", color: "var(--dsw-alias-brand-primary)",
          },
        }, h("svg", { viewBox: "0 0 20 20", width: 13, height: 13, "aria-hidden": true },
          h("path", { d: "M10 2 L18 10 L10 18 L2 10 Z", fill: "currentColor" })));
      };
    }

    /* ---------------- M3：自绘字标 ---------------- */
    function makeBrandMark() {
      let React = null;
      try { React = require("react"); } catch { return null; }
      if (!React) return null;
      const h = React.createElement;
      return function SdtBrandMark() {
        return h("svg", {
          viewBox: "0 0 20 20", width: 20, height: 20, "aria-hidden": true,
          "data-sdt-brand": "",
          style: { display: "block", pointerEvents: "none" },
        }, h("path", {
          d: "M10 2 L17.5 10 L10 18 L2.5 10 Z",
          fill: "var(--bj-gold, #37a3d6)",
        }));
      };
    }

    /* ---------------- M3b：品牌名 ---------------- */
    function makeBrandName() {
      let React = null;
      try { React = require("react"); } catch { return null; }
      if (!React) return null;
      const h = React.createElement;
      return function SdtBrandName() {
        return h("button", {
          type: "button",
          "data-sdt-brand-name": "",
          title: "打开 DSH-SDT 面板",
          onClick: () => openPanel("features"),
          style: {
            fontSize: 12, fontWeight: 600, letterSpacing: ".14em", padding: 0,
            border: "none", background: "transparent", cursor: "pointer",
            color: "var(--dsw-alias-brand-primary)", whiteSpace: "nowrap",
          },
        }, "DSH-SDT");
      };
    }

    return {
      inject: ["theme", "slots"],
      apply(ctx) {
        // M8 安全模式：首帧注入的标记，存在即完全不接管（卸载/排障用）
        if (window.__sdtSafeMode) return;
        let disposeTokens = null;
        let currentColors = DEFAULTS;
        const initial = buildPairs(currentColors);
        let disposeStyle = injectStyle(buildCss(currentColors, { wallpaper: null, glass: false }));
        ctx.effect(() => () => { if (typeof disposeStyle === "function") disposeStyle(); });

        // 点击特效：默认开，配置可关；失败/减动效时静默不启用
        let fxHandle = null; // { dispose, setScale }
        let wallpaperOn = false;
        let currentWallpaper = null;
        let heroMarkRegistered = false;
        let wallTimer = 0;
        let wallInterval = 0;
        window.addEventListener("resize", () => {
          if (!wallpaperOn) return;
          clearTimeout(wallTimer);
          wallTimer = setTimeout(() => syncWallpaperDom(true, currentWallpaper), 200);
        });        const syncClickEffect = (enabled, scale) => {
          if (enabled && !fxHandle) {
            try {
              fxHandle = makeClickEffect();
              window.__sdtFx = { preview: fxHandle.preview, setScale: fxHandle.setScale };
            } catch (error) { console.warn("[dsh-sdt] click effect unavailable:", error && error.message); }
          } else if (!enabled && fxHandle) {
            fxHandle.dispose();
            fxHandle = null;
            if (window.__sdtFx) delete window.__sdtFx;
          }
          if (fxHandle && typeof scale === "number") fxHandle.setScale(scale);
        };
        syncClickEffect(true);
        ctx.effect(() => () => { if (fxHandle) fxHandle.dispose(); });
        syncClickEffect(true);
        ctx.effect(() => () => { if (typeof disposeClick === "function") disposeClick(); });
        ctx.effect(() => () => { if (typeof disposeTokens === "function") disposeTokens(); });

        try {
          disposeTokens = ctx.theme.overrideTokens(SOURCE, initial.pairs);
          window.__sdtDebug = { version: VERSION, mapped: initial.stats.mapped, total: initial.stats.total, skipped: initial.stats.skipped };
        } catch (error) {
          console.warn("[dsh-sdt] token override rejected:", error && error.message);
        }

        // 字标：桌面端宿主会在插件之后注册默认标，故加延迟重挂（DOM 里已有我们的标记即跳过）
        const brandTimers = [];
        const mountBrand = () => {
          try {
            const BrandMark = makeBrandMark();
            const BrandName = makeBrandName();
            if (!ctx.slots?.inject) return;
            if (!document.querySelector("[data-sdt-brand]") && BrandMark) {
              // single slot：用 priority 抢在官方默认标（priority 0）之前，order/id 对 single 无效
              ctx.slots.inject("sidebar.brand.mark", () =>
                ctx.slots.register({ name: "sidebar.brand.mark", priority: -10 }, BrandMark));
            }
            if (!document.querySelector("[data-sdt-brand-name]") && BrandName) {
              ctx.slots.inject("sidebar.brand.name", () =>
                ctx.slots.register({ name: "sidebar.brand.name", priority: -10 }, BrandName));
            }
          } catch (error) {
            console.warn("[dsh-sdt] brand mark unavailable:", error && error.message);
          }
        };
        mountBrand();
        [600, 1500, 3000].forEach((ms) => brandTimers.push(setTimeout(mountBrand, ms)));
        ctx.effect(() => () => brandTimers.forEach((id) => clearTimeout(id)));

        // M2 输入 dock：失败不影响主题
        try {
          const Dock = makeDock();
          if (Dock && ctx.slots?.inject) {
            ctx.slots.inject("conversation.input.dock", () =>
              ctx.slots.register({ name: "conversation.input.dock", id: "sdt-dock", order: 10 }, Dock));
          }
        } catch (error) {
          console.warn("[dsh-sdt] input dock unavailable:", error && error.message);
        }

        // M4 只读信息卡：失败不影响主题
        try {
          const SettingsCard = makeSettingsCard();
          if (SettingsCard && ctx.slots?.inject) {
            ctx.slots.inject("settings.general.item", () =>
              ctx.slots.register({ name: "settings.general.item", id: "sdt-about", order: 90 }, SettingsCard));
          }
        } catch (error) {
          console.warn("[dsh-sdt] settings card unavailable:", error && error.message);
        }

        // 应用内面板：失败不影响主题
        try {
          const Panel = makePanel();
          if (Panel && ctx.slots?.inject) {
            ctx.slots.inject("shell.overlay", () =>
              ctx.slots.register({ name: "shell.overlay", id: "sdt-panel", order: 30 }, Panel));
          }
        } catch (error) {
          console.warn("[dsh-sdt] panel unavailable:", error && error.message);
        }

        // 侧栏列表入口：失败不影响主题；延迟重试（桌面端槽位挂载较晚）
        try {
          const MenuEntry = makeMenuEntry();
          const mountMenu = () => {
            if (!MenuEntry || !ctx.slots?.inject || document.querySelector('[data-sdt-menu]')) return;
            ctx.slots.inject("sidebar.panellist", () =>
              ctx.slots.register({ name: "sidebar.panellist", id: "sdt-menu", label: () => "DSH-SDT", order: 100 }, MenuEntry));
          };
          mountMenu();
          [700, 1600, 3200].forEach((ms) => setTimeout(mountMenu, ms));
        } catch (error) {
          console.warn("[dsh-sdt] menu entry unavailable:", error && error.message);
        }

        fetch("/sdt/config.json", { credentials: "same-origin" })
          .then((r) => (r.ok ? r.json() : null))
          .then((payload) => {
            if (!payload || !payload.config) return;
            const colors = { ...DEFAULTS, ...(payload.config.colors || {}) };
            currentColors = colors;
            // 配置颜色必须同步进 --bj-* / 底纹 / 选区，否则改色后只有 token 变、装饰仍是默认色
            if (typeof disposeStyle === "function") disposeStyle();
            disposeStyle = injectStyle(buildCss(colors, payload.config.appearance || {}));
            const built = buildPairs(colors);
            const mode = (payload.config.appearance && payload.config.appearance.mode) || 'auto';
            if (mode === 'dark' || mode === 'light') {
              // 走主题服务：宿主会按偏好重新发布整份调色板（写入 inline 会与 publish 抢顺序）
              try {
                if (typeof ctx.theme.setTheme === 'function') ctx.theme.setTheme(mode);
                else {
                  if (mode === 'dark') document.body.setAttribute('data-ds-dark-theme', '');
                  else document.body.removeAttribute('data-ds-dark-theme');
                  for (const [name, pair] of Object.entries(built.pairs)) {
                    document.body.style.setProperty(name, pair[mode]);
                  }
                }
              } catch (error) {
                console.warn('[dsh-sdt] setTheme failed:', error && error.message);
              }
            }
            const pairs = { ...built.pairs, ...(payload.config.tokens || {}) };
            if (typeof disposeTokens === "function") disposeTokens();
            disposeTokens = ctx.theme.overrideTokens(SOURCE, pairs);
            window.__sdtDebug = {
              version: VERSION, mapped: built.stats.mapped, total: built.stats.total,
              skipped: built.stats.skipped, source: payload.exists ? "file" : "defaults",
            };
            document.documentElement.dataset.sdtSource = payload.exists ? "file" : "defaults";

            // 点击特效：配置显式关闭时停掉；scale 热更新
            const clickCfg = payload.config.motion && payload.config.motion.click;
            syncClickEffect(
              !(clickCfg && clickCfg.enabled === false),
              clickCfg && typeof clickCfg.scale === "number" ? clickCfg.scale : undefined,
            );

            // 壁纸：清全屏容器底色（晚挂载再补一次）
            const appearance = payload.config.appearance || {};
            wallpaperOn = Boolean(appearance.wallpaper);
            currentWallpaper = appearance.wallpaper;
            syncWallpaperDom(wallpaperOn, currentWallpaper);
            if (wallpaperOn) setTimeout(() => syncWallpaperDom(true, currentWallpaper), 800);
            clearInterval(wallInterval);
            if (wallpaperOn) {
              wallInterval = setInterval(() => {
                if (document.hidden) return;
                syncWallpaperDom(true, currentWallpaper);
                syncGlassDom(Boolean(appearance.glass));
              }, 3000);
            }

            // 桌宠：配置开启且有素材时挂到 overlay
            if (payload.config.pet && payload.config.pet.enabled && payload.config.pet.images.length) {
              const Pet = makePet(payload.config.pet);
              if (Pet && ctx.slots?.inject) {
                ctx.slots.inject("shell.overlay", () =>
                  ctx.slots.register({ name: "shell.overlay", id: "sdt-pet", order: 20 }, Pet));
              }
            }

            // 玻璃：大面板 + 顶栏
            syncGlassDom(Boolean(appearance.glass));

            // 英雄区：标题改写 + 图标替换（均配置驱动，缺省不动宿主）
            if (appearance.heroTitle) applyHeroTitle(appearance.heroTitle);
            if (appearance.heroMark && !heroMarkRegistered) {
              const HeroMark = makeHeroMark(appearance.heroMark);
              if (HeroMark) {
                ctx.slots.inject("conversation.hero.brand.mark", () =>
                  ctx.slots.register({ name: "conversation.hero.brand.mark", priority: -10 }, HeroMark));
                heroMarkRegistered = true;
              }
            }

            // M1 覆盖层骨架：仅在配置显式开启时注册，默认零影响
            if (payload.config.appearance && payload.config.appearance.overlay === true) {
              try {
                const Hud = makeOverlay();
                if (Hud && ctx.slots?.inject) {
                  ctx.slots.inject("shell.overlay", () =>
                    ctx.slots.register({ name: "shell.overlay", id: "sdt-hud", order: 5 }, Hud));
                }
              } catch (error) {
                console.warn("[dsh-sdt] overlay unavailable:", error && error.message);
              }
            }
          })
          .catch(() => {});

        document.documentElement.dataset.sdt = VERSION;

        // 样式表按需注入：稍后再扫几次，发现新变量就重算
        let lastCount = initial.stats.total;
        const timers = [];
        const rescan = (delay) => timers.push(setTimeout(() => {
          const built = buildPairs(currentColors);
          if (built.stats.total > lastCount) {
            lastCount = built.stats.total;
            try {
              if (typeof disposeTokens === "function") disposeTokens();
              disposeTokens = ctx.theme.overrideTokens(SOURCE, built.pairs);
              window.__sdtDebug = { version: VERSION, mapped: built.stats.mapped, total: built.stats.total, skipped: built.stats.skipped };
            } catch {}
          }
        }, delay));
        rescan(1200);
        rescan(3200);
        ctx.effect(() => () => timers.forEach((id) => clearTimeout(id)));
      },
    };
  },
});