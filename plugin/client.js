/**
 * dsh-sdt — browser client bundle (v1.8)
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
    const VERSION = '1.8';
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

    /* ---------------- L2：语法 CSS（只用稳定锚点） ---------------- */
    function buildCss(colors) {
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
          row("目录", "$DSH_HOME/sdt/"));
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
        return h("span", {
          "data-sdt-brand-name": "",
          style: {
            fontSize: 12, fontWeight: 600, letterSpacing: ".14em",
            color: "var(--dsw-alias-brand-primary)", whiteSpace: "nowrap",
          },
        }, "DSH-SDT");
      };
    }

    return {
      inject: ["theme", "slots"],
      apply(ctx) {
        let disposeTokens = null;
        let currentColors = DEFAULTS;
        const initial = buildPairs(currentColors);
        let disposeStyle = injectStyle(buildCss(currentColors));
        ctx.effect(() => () => { if (typeof disposeStyle === "function") disposeStyle(); });
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

        fetch("/sdt/config.json", { credentials: "same-origin" })
          .then((r) => (r.ok ? r.json() : null))
          .then((payload) => {
            if (!payload || !payload.config) return;
            const colors = { ...DEFAULTS, ...(payload.config.colors || {}) };
            currentColors = colors;
            // 配置颜色必须同步进 --bj-* / 底纹 / 选区，否则改色后只有 token 变、装饰仍是默认色
            if (typeof disposeStyle === "function") disposeStyle();
            disposeStyle = injectStyle(buildCss(colors));
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