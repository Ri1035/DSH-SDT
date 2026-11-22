/**
 * dsh-sdt — browser client bundle.
 *
 * 职责（保持窄）：
 *   1) theme.overrideTokens —— 把配置里的颜色派生为明/暗两套 `--dsw-alias-*`；
 *   2) 注入自有变量 —— `--bj-*`（圆角/阴影/强调色/字体栈），
 *      只在变量层面生效，不改任何组件的几何与布局。
 *
 * 双挂载保护：某些启动时序会挂两次，用 window 标记挡住第二次（参考 dsh-theme-endfield 的做法）。
 */
window.__ModuleLoader__.load({
  id: 'dsh-sdt',
  factory: () => {
    const VERSION = '1.2';
    const SOURCE = 'dsh-sdt';

    if (window.__dshSdtApplied) {
      return { inject: ['theme'], apply() {} };
    }
    window.__dshSdtApplied = true;

    /* ---------- 颜色工具 ---------- */
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

    function hexToRgb(hex) {
      const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
      if (!m) return { r: 0, g: 0, b: 0 };
      const n = parseInt(m[1], 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    function toHex({ r, g, b }) {
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

    /* ---------- 默认值（与 lib/config.js 的 DEFAULT_CONFIG.colors 对齐） ---------- */
    const DEFAULTS = {
      brand: '#c8a24a',
      accent: '#a3262f',
      bgLight: '#f7f3ea',
      bgDark: '#0d1117',
      inkLight: '#231f19',
      inkDark: '#e9e6df',
    };

    /**
     * 由 6 个基准色派生明/暗两套 token。
     * 注意：只产出 `Theme.listTokens` 白名单里的 14 个名字 + 用户显式配置的额外 token。
     */
    function buildTokens(colors) {
      const { brand, accent, bgLight, bgDark, inkLight, inkDark } = colors;

      const light = {
        '--dsw-alias-bg-base': bgLight,
        '--dsw-alias-bg-layer-1': mix(bgLight, inkLight, 0.04),
        '--dsw-alias-bg-layer-2': mix(bgLight, inkLight, 0.08),
        '--dsw-alias-bg-overlay': mix(bgLight, '#ffffff', 0.6),
        '--dsw-alias-border-l1': mix(inkLight, bgLight, 0.82),
        '--dsw-alias-border-l2': mix(inkLight, bgLight, 0.64),
        '--dsw-alias-brand-primary': brand,
        '--dsw-alias-label-primary': inkLight,
        '--dsw-alias-label-secondary': mix(inkLight, bgLight, 0.42),
        '--dsw-alias-state-error-primary': accent,
        '--dsw-alias-state-idle-primary': mix(inkLight, bgLight, 0.5),
        '--dsw-alias-state-success-primary': '#3f6b4f',
        '--dsw-alias-state-warn-primary': '#b47b22',
        '--dsw-specific-sidebar-fill': mix(bgLight, brand, 0.08),
        // 以下为非白名单但被界面实际消费的变量（探针结论见 docs/MODULARITY.md §2）
        '--dsw-alias-button-primary-fill': brand,
        '--dsw-alias-button-primary-hover': darken(brand, 0.08),
        '--dsw-alias-border-l3': mix(inkLight, bgLight, 0.76),
        '--dsw-alias-bg-layer-3': mix(bgLight, inkLight, 0.11),
      };

      const dark = {
        '--dsw-alias-bg-base': bgDark,
        '--dsw-alias-bg-layer-1': lighten(bgDark, 0.05),
        '--dsw-alias-bg-layer-2': lighten(bgDark, 0.09),
        '--dsw-alias-bg-overlay': lighten(bgDark, 0.08),
        '--dsw-alias-border-l1': lighten(bgDark, 0.16),
        '--dsw-alias-border-l2': lighten(bgDark, 0.26),
        '--dsw-alias-brand-primary': lighten(brand, 0.12),
        '--dsw-alias-label-primary': inkDark,
        '--dsw-alias-label-secondary': mix(inkDark, bgDark, 0.42),
        '--dsw-alias-state-error-primary': lighten(accent, 0.24),
        '--dsw-alias-state-idle-primary': mix(inkDark, bgDark, 0.55),
        '--dsw-alias-state-success-primary': '#5f9e79',
        '--dsw-alias-state-warn-primary': '#d2a34a',
        '--dsw-specific-sidebar-fill': darken(mix(bgDark, brand, 0.06), 0.18),
        '--dsw-alias-button-primary-fill': lighten(brand, 0.12),
        '--dsw-alias-button-primary-hover': lighten(brand, 0.24),
        '--dsw-alias-border-l3': lighten(bgDark, 0.12),
        '--dsw-alias-bg-layer-3': lighten(bgDark, 0.13),
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

    /** 自有变量：官方没有对应 token 的项（圆角/阴影/字体/强调色）。 */
    function buildCss(colors) {
      const ink = colors.inkDark;
      return `:root{
  --bj-accent: ${colors.accent};
  --bj-accent-soft: ${alpha(colors.accent, 0.18)};
  --bj-brand: ${colors.brand};
  --bj-brand-soft: ${alpha(colors.brand, 0.16)};
  --bj-radius-card: 12px;
  --bj-radius-control: 8px;
  --bj-shadow-soft: 0 1px 2px ${alpha(ink, 0.08)}, 0 10px 28px ${alpha(ink, 0.10)};
  --bj-font-display: "Noto Serif SC", "Source Han Serif SC", "Songti SC", Georgia, serif;
  --bj-duration-fast: 120ms;
  --bj-duration-base: 220ms;
  --bj-ease: cubic-bezier(.2,.7,.3,1);
  --dsh-font-family-text: "Noto Serif SC", "Source Han Serif SC", "Songti SC", Georgia, serif;
  --dsh-font-family-code: "JetBrains Mono", ui-monospace, "Cascadia Code", Consolas, monospace;
  --dsh-font-family-terminal: "JetBrains Mono", ui-monospace, Consolas, monospace;
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

    return {
      inject: ['theme'],
      apply(ctx) {
        let disposeTokens = null;
        const base = buildTokens(DEFAULTS);

        ctx.effect(() => injectStyle(buildCss(DEFAULTS)));
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
            if (!payload || !payload.config) return;
            const colors = { ...DEFAULTS, ...(payload.config.colors || {}) };
            const palette = buildTokens(colors);
            const extra = payload.config.tokens || {};
            const pairs = { ...toPairs(palette), ...extra };
            if (typeof disposeTokens === 'function') disposeTokens();
            disposeTokens = ctx.theme.overrideTokens(SOURCE, pairs);
            document.documentElement.dataset.sdtSource = payload.exists ? 'file' : 'defaults';
            window.__sdtDebug = {
              version: VERSION,
              tokens: Object.keys(pairs).length,
              extra: Object.keys(extra).length,
              source: payload.exists ? 'file' : 'defaults',
              warnings: payload.warnings || [],
            };
          })
          .catch(() => {});

        document.documentElement.dataset.sdt = VERSION;
      },
    };
  },
});