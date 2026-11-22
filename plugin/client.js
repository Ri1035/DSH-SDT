/**
 * dsh-sdt — browser client bundle.
 *
 * 由 dsh-client-modules 以 `/plugins/sdt/client.js` 加载（安装为 bundle 后自动进入名册）。
 *
 * 只做两件事：
 *   1) theme.overrideTokens —— 把配置里的颜色映射成明/暗两套 `--dsw-alias-*`；
 *   2) 注入一段最小 CSS —— 只写自有 `--bj-*` 变量（圆角/阴影/字体/强调色），
 *      不碰布局、不改官方组件几何，避免与宿主样式打架。
 *
 * 双挂载保护：某些启动时序会挂两次，用 window 上的标记挡住第二次。
 */
window.__ModuleLoader__.load({
  id: 'dsh-sdt',
  factory: () => {
    const VERSION = '1.1';
    const SOURCE = 'dsh-sdt';

    if (window.__dshSdtApplied) {
      return { inject: ['theme'], apply() {} };
    }
    window.__dshSdtApplied = true;

    /* ---------- 颜色工具 ---------- */
    function hexToRgb(hex) {
      const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
      if (!m) return { r: 0, g: 0, b: 0 };
      const n = parseInt(m[1], 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    function toHex({ r, g, b }) {
      const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
      return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    }
    function mix(a, b, t) {
      const x = hexToRgb(a);
      const y = hexToRgb(b);
      return toHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
    }
    const lighten = (c, t) => mix(c, '#ffffff', t);
    const darken = (c, t) => mix(c, '#000000', t);
    const alpha = (c, a) => {
      const { r, g, b } = hexToRgb(c);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    /* ---------- 配置 → 明暗两套 token ---------- */
    function buildTokens(colors) {
      const brand = colors.brand || '#3b6ea5';
      const accent = colors.accent || '#d8a94a';
      const surface = colors.surface || '#ffffff';
      const ink = colors.ink || '#1b1f24';

      const light = {
        '--dsw-alias-bg-base': surface,
        '--dsw-alias-bg-layer-1': mix(surface, ink, 0.035),
        '--dsw-alias-bg-layer-2': mix(surface, ink, 0.07),
        '--dsw-alias-bg-overlay': surface,
        '--dsw-alias-border-l1': mix(ink, surface, 0.82),
        '--dsw-alias-border-l2': mix(ink, surface, 0.66),
        '--dsw-alias-brand-primary': brand,
        '--dsw-alias-label-primary': ink,
        '--dsw-alias-label-secondary': mix(ink, surface, 0.45),
        '--dsw-alias-state-error-primary': '#c0392b',
        '--dsw-alias-state-idle-primary': '#8a919a',
        '--dsw-alias-state-success-primary': '#2c7a4b',
        '--dsw-alias-state-warn-primary': '#c78a1c',
        '--dsw-specific-sidebar-fill': mix(surface, brand, 0.06),
      };

      const darkBase = mix('#14161a', brand, 0.05);
      const dark = {
        '--dsw-alias-bg-base': darkBase,
        '--dsw-alias-bg-layer-1': lighten(darkBase, 0.05),
        '--dsw-alias-bg-layer-2': lighten(darkBase, 0.09),
        '--dsw-alias-bg-overlay': lighten(darkBase, 0.07),
        '--dsw-alias-border-l1': lighten(darkBase, 0.16),
        '--dsw-alias-border-l2': lighten(darkBase, 0.26),
        '--dsw-alias-brand-primary': lighten(brand, 0.18),
        '--dsw-alias-label-primary': '#e9ebee',
        '--dsw-alias-label-secondary': '#a2a8b0',
        '--dsw-alias-state-error-primary': '#e06c5f',
        '--dsw-alias-state-idle-primary': '#7c838c',
        '--dsw-alias-state-success-primary': '#4da377',
        '--dsw-alias-state-warn-primary': '#dcaa4a',
        '--dsw-specific-sidebar-fill': mix(darkBase, ink, 0.12),
      };
      return { light, dark, brand, accent };
    }

    function toPairs(palette) {
      const out = {};
      for (const name of Object.keys(palette.light)) {
        out[name] = { light: palette.light[name], dark: palette.dark[name] };
      }
      return out;
    }

    /* ---------- 自有变量（官方没有对应 token 的部分） ---------- */
    function buildCss(colors, accent) {
      return `:root{
  --bj-accent: ${accent};
  --bj-accent-soft: ${alpha(accent, 0.16)};
  --bj-radius-card: 14px;
  --bj-radius-control: 10px;
  --bj-shadow-soft: 0 1px 2px ${alpha(colors.ink || '#1b1f24', 0.06)}, 0 8px 24px ${alpha(colors.ink || '#1b1f24', 0.06)};
  --bj-font-display: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  --bj-duration-fast: 120ms;
  --bj-duration-base: 220ms;
  --bj-ease: cubic-bezier(.2,.7,.3,1);
  --bj-ready: 1;
}`;
    }

    function injectStyle(css) {
      const el = document.createElement('style');
      el.id = 'dsh-sdt-vars';
      el.dataset.sdt = VERSION;
      el.textContent = css;
      document.head.appendChild(el);
      return () => el.remove();
    }

    const DEFAULTS = { brand: '#3b6ea5', accent: '#d8a94a', surface: '#ffffff', ink: '#1b1f24' };

    return {
      inject: ['theme'],
      apply(ctx) {
        let disposeTokens = null;
        const base = buildTokens(DEFAULTS);

        ctx.effect(() => injectStyle(buildCss(DEFAULTS, base.accent)));
        ctx.effect(() => () => {
          if (typeof disposeTokens === 'function') disposeTokens();
        });

        try {
          disposeTokens = ctx.theme.overrideTokens(SOURCE, toPairs(base));
        } catch (error) {
          console.warn('[dsh-sdt] token override rejected:', error && error.message);
        }

        // 配置来自 host 路由；失败就保持默认，不影响界面可用性
        fetch('/sdt/config.json', { credentials: 'same-origin' })
          .then((r) => (r.ok ? r.json() : null))
          .then((payload) => {
            if (!payload || !payload.config || !payload.config.colors) return;
            const colors = { ...DEFAULTS, ...payload.config.colors };
            const palette = buildTokens(colors);
            const pairs = { ...toPairs(palette), ...(payload.config.tokens || {}) };
            if (typeof disposeTokens === 'function') disposeTokens();
            disposeTokens = ctx.theme.overrideTokens(SOURCE, pairs);
            document.documentElement.dataset.sdtSource = payload.exists ? 'file' : 'defaults';
          })
          .catch(() => {});

        document.documentElement.dataset.sdt = VERSION;
      },
    };
  },
});