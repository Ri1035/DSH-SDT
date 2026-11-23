# JOURNAL.md —— 工作日志

> 每次交付一条：做了什么、怎么验证的、能不能回滚到哪个标记。
> 阶段标记是**回滚点**，命名 `stage-NN-vX.Y`。

---

## 2026-11-24 · 阶段 9 · v1.8 —— M1 覆盖层骨架 + M2 输入 dock + 桌面端首验

**做了什么**

- **M2**：`conversation.input.dock` 注册 16px 氛围条（左 `DSH-SDT`、右版本），`pointer-events:none`。
- **M1**：`shell.overlay` 骨架，配置 `appearance.overlay`（默认 false）；开启只画四角标 + HUD 文字。
- **桌面端**：`link:` 进 `desktop` profile（dependencies + bundles），pnpm 安装，冷启动验证通过。
- **字标修复**：桌面端字标不生效的根因是 single slot 用 `order`/`id` 无效，必须用 `priority: -10`；
  同时把 `sidebar.brand.name` 换成 `DSH-SDT`，字标简化为菱形。

**验证（实测）**

| 环境 | 结果 |
|---|---|
| Web | dock 768×14、卡片 728、980/1423 无溢出；覆盖层 pointer-events:none、hit-test 穿透 |
| Desktop | `mapped 133/133`、`source:file`、字标/名字各 1、dock 挂载、卡片 729×98、1282 无溢出 |
| 桌面安装 | `dsh-sdt 1.8.0 <- ..\plugin`；启动后插件生效 |

**踩坑**

1. **`ELECTRON_RUN_AS_NODE=1`**：WorkBuddy 终端里直接 Start-Process 会让桌面端以 Node 模式静默退出（exit 0），
   必须清掉 `ELECTRON_RUN_AS_NODE` 与 `NODE_OPTIONS`。已记入 HANDOFF。
2. **Start-Process 被安全策略拦截**（`HTTPS_PROXY` 大小写重复键），清空代理变量后可启动。
3. **桌面端启动慢**：约 20–30 秒，期间 `HARNESS Loading plugins…` 属正常，不是卡死。
4. **single slot 语义**：`priority` 越小越优先；官方默认标 priority 0，替换需 -10。
5. **桌面端页面重载**会长时间停在 Loading（约 20s），排查时勿误判为崩溃。

**没做**

- 桌面首帧 `webserver/index-inject` 未验证（属 M9，v1.9）。
- 覆盖层只验证了 web，桌面未开启。
- M1 的点击特效未做。

**回滚点**：`stage-09-v1.8`（桌面端回滚见 CHANGELOG v1.8 Notes）

---

## 2026-11-24 · 阶段 8 · v1.7 —— 控制台 + 功能占位矩阵

**做了什么**

- `/sdt/console`：单页控制台（零构建、无外部依赖、与插件同源同鉴权）。4 个 KPI、6 色色板、
  **13 张功能卡**（M1–M10 / P3 / P5 / P7）、路线图、阻塞项、四路由自检；明暗预览 + `?mode=dark`。
- `/sdt/features.json`：功能清单单一数据源，控制台与文档共用，避免再出现「文档说 88 个变量」。
- `/sdt/health` 增加 `version`（读 manifest，不再手写）。
- 内置 logo 重绘：蓝青菱形 + SDT，替换 v1.0 遗留的金色钩子占位图；控制台用 HEAD 的
  `x-sdt-source` 显示「内置 / 用户目录」。
- 占位策略：未实现模块只给占位块 + 「待 vX.Y 接线」，**不做假开关**。

**验证（实测）**

| 项 | 结果 |
|---|---|
| `/sdt/console` | 200 `text/html`；未鉴权 401；CSP 生效 |
| `/sdt/features.json` | 200 JSON |
| 渲染 | 4 KPI / 6 色板 / 13 卡（12 占位）/ 6 版本 / 4 自检全 200 |
| 筛选 | 已交付 1、占位 7、全部 13 |
| 明暗 | 深色 `#0a1626` + 浅字；无白色残块 |
| 980 宽 | 无横向溢出 |
| 自验证 | 8/8 |

**发现并修掉**

- `config.json` 是 `{config:{colors}}` 包装，首版直接读 `payload.colors` 导致色板全灰。
- 深色截图出现白底/暗字：body 的 0.18s 过渡被截图截在中途 → 去掉过渡；原生 `button` 在旧 headless
  下忽略背景 → 改成 `.btn` 元素。
- 占位矩阵中 M4 标「已交付」但仍有占位（可交互未做）→ 改为「部分」。

**版本说明**

控制台是独立可交付增量，单独发 `v1.7`；覆盖层 + 桌面首验顺延 `v1.8`，材质/开屏 + 回归 `v1.9`，
发布 `v2.0`（D31：版本 = 树里实际存在的东西，不发 WIP 版本号）。

**回滚点**：`stage-08-v1.7`

---

## 2026-11-24 · 阶段 7 · v1.6 —— L3 间距 + M4 只读卡 + M5 负结论

**做了什么**

- **L3 盘点**：扫描 158 个 `<style>`（约 477 KB），当前主视图 `--dsh-*` 实测 **49 个**（旧文档写 88，无依据）。
  查到三类归属：字号变量由宿主**内联写在 `body`**；侧栏密度在哈希类；只有 `[data-conversation-content]`
  上的间距/宽度可稳定覆盖。结论写进新文档 `docs/DENSITY.md`。
- **L3 落地**：`--dsh-composer-side-clearance` 16→20px、`--dsh-composer-card-max-width` +32→+48px。
- **M4 只读卡**：先试 `settings.section`（不显示，实测它是内容容器）→ 改注册 `settings.general.item`，
  设置 → 通用设置底部出现 `DSH-SDT / 版本 / token / 来源 / 目录`。
- **M5 负结论**：`ctx.theme` 原型 13 个方法**没有 icon 接口**；图标也没有稳定 `data-*` → 不做官方替换（D30）。

**验证（实测）**

| 项 | 结果 |
|---|---|
| 944 / 980 / 1423 三视口 | 无横向溢出；输入卡 728 / 728 / 780 px |
| 宿主字号 | 14px 未被改写（插件不碰字号） |
| M4 卡片 | 设置 → 通用设置可见 |
| 截图 | `docs/preview/v16-light-1423.png`、`v16-light-980.png` |
| 自验证 | 8/8 |

**没做 / 顺延**

- 桌面端仍未安装（需授权，会重启应用）→ 顺延到 v1.7，与 M1/M2 同版。
- M5 图标降级方案（自有元素菱形底板）留到有自有组件后再做。
- 侧栏密度、圆角体系：变量定义在哈希类，无锚点，暂不做。

**回滚点**：`stage-07-v1.6`

---

## 2026-11-23 · v1.5 文档基线校正（未发版）

**原因**：接手审查发现文档与实际状态漂移 —— `TODO.md` 仍写「代码 0 行」，`AGENTS.md` 还是旧机器的
`C:\Users\Administrator` + `D:\soft\DSH`，`ROADMAP` 把 v1.3 写成开屏，`PLAN` 的版本表 `v1.5` 出现两次，
`DESIGN.md` 仍按「14 个 token 是全部」叙述。

**做了什么**：见 `CHANGELOG.md` v1.5「Docs」表。核心是建立**三层真相源**（HANDOFF=现状 / TODO=任务+ADR /
VERSION+CHANGELOG=版本），并把 `client.js` 的 `VERSION` 提到 `1.5`。
新增 `LICENSE`（MIT，仅代码），确立第三方美术不入库、走用户目录运行时加载（ADR D26/D27）。

**验证**：`scripts/release_check.py` 7/7；未改动运行逻辑，仅版本常量与注释。

**回滚点**：`stage-06-v1.5`（同版文档修正，不新打标签）

---

## 2026-11-23 · 方案评审 v2 · 未发版

- 补调研：开屏动画、宠物、Steam 壁纸（Wallpaper Engine）、点击特效四类，共 6 个代表项目（均 MIT/未声明）。
- 产出 `docs/PLAN-2026-11-23.md` v2：补全 10 类模块矩阵（M1 覆盖层 … M10 Skill）、
  从三张 FGO 截图提炼 7 条设计语法（G1 顶栏 / G2 金框 / G3 白玻璃 / G4 菱形图标 / G5 衬线副标 / G6 菱格底 / G7 长条按钮），
  并据此把默认视觉定为深色 + 金 + 白玻璃；截图本身**不入库**（版权属 TYPE-MOON）：能力分 5 层（L1 颜色 / L2 区块 / L3 密度 / L4 覆盖层 / L5 系统级）、复用清单、v1.3–v2.0 计划、明确不做项。
- 待决：桌面端安装授权；默认视觉方向。

---

## 2026-11-23 · 阶段 6 · v1.5 —— 全量审查 + 修复 + 转手

**审查范围**：`plugin/` 全部 6 个文件（client / lib ×3 / index / package.json）。

**修掉 6 个 bug**（详见 CHANGELOG v1.5）：打包漏 assets、HEAD 语义、SVG 无 CSP、
补扫覆盖用户配色、`ctx.get` 未防护、token 值无注入防护。

**验证**：HEAD 只回头 / SVG 带 CSP / 401·404·403·405 全过 / 非法 token 被拒 / 133/133 / 7/7。

**转手**：`HANDOFF.md` 重写，含环境、命令、10 个坑、回滚标签、backlog、
以及"为什么不建议直接改 app.asar"。

**回滚点**：`stage-06-v1.5`

---

## 2026-11-23 · 阶段 5 · v1.4 —— 蓝青配色定版

**做了什么**

- 主色由金改为青蓝（`#37a3d6`），深底改深海军蓝（`#0a1626`），浅色改冰蓝白（`#eef6fb`）。
- 按钮表面（elevated/floating/tool-bar/hover/active）由中性灰改为青蓝浅染。
- 菱格底纹透明度 0.09；金色降级为可选框线。

**验证（Web 端）**

| 项 | 结果 |
|---|---|
| 覆盖 | ✅ 133/133 |
| 深色 | ✅ 深海军蓝底 + 青蓝字标 + 青蓝按钮 |
| 浅色 | ✅ 冰蓝白底 |
| 截图 | ✅ 1423×900 headless Edge |
| 自验证 | ✅ 7/7 |

**回滚点**：`stage-05-v1.4`

---

## 2026-11-23 · 阶段 4 · v1.3 —— L1 全量 + L2 语法 + 字标

**做了什么**

- L1：`client.js` 改为「扫描 + 基线 + 语义族映射」，133 个 token 全部产出明/暗两套值。
- L2：只加 4 条稳定锚点规则（菱格底、侧栏发丝线、会话头下边框、选区色），不动布局。
- M3：向 `sidebar.brand.mark` 注册自绘 SVG 字标（金菱形 + SDT），实测替换生效。
- `appearance.mode`：走 `theme.setTheme`，避免与宿主 publish 抢写顺序。

**验证（仅 Web 端，按你的要求）**

| 项 | 结果 |
|---|---|
| 覆盖率 | ✅ `mapped 133 / total 133 / skipped []` |
| 深色 | ✅ `data-ds-dark-theme` 生效，背景 `#0d1117`、品牌金 `#c8a24a` |
| 浅色 | ✅ 纸白 `#f7f3ea` 系 |
| 字标 | ✅ 侧栏出现金菱形 + SDT |
| 截图 | ✅ 1423×900 实机（headless Edge，因 ego 截图链路卡死） |
| 自验证 | ✅ 7/7 |

**已知问题**

- ego-browser 的 `Page.captureScreenshot` 在本机 DSH 页面会超时（无插件时也一样），改用 headless Edge 抓图。
- composer 的虚线是宿主"工作区拖放态"样式，非本插件所为。

**回滚点**：`stage-04-v1.3`

---

## 2026-11-23 · 阶段 3 · v1.2 —— 默认主题成稿 + 模块化矩阵

**做了什么**

- 主题代码：`plugin/client.js` 由 6 个基准色派生 18 个 token（14 白名单 + 4 非白名单候选），
  并注入 `--bj-*`（圆角/阴影/强调色/字体栈）与 `--dsh-font-family-*`（衬线正文）。
- 配置：`colors` 改为 `brand/accent/bgLight/bgDark/inkLight/inkDark`；
  新增 `examples/sdt.config.json` 作为可复制的内容层样例。
- 文档：新增 `docs/MODULARITY.md`（能力矩阵 + 不可改红线 + 探针结论）、
  `docs/ROADMAP.md`（阶段/版本/验收/回滚）、`docs/JOURNAL.md`（本文件）、
  `research/RESOURCES-2026-11-23.md`（先调研：可复用参考）。README 重写为官方术语简报。
- 退役：`research/ASSETS-2026-11-23.md`（FGO 素材清单）—— 方向错误，已删除，理由见下。

**验证（实测）**

| 项 | 结果 |
|---|---|
| 插件装进 `web` profile | ✅ `--dump-config` 见 `# == dsh-sdt` |
| `/sdt/config.json` | ✅ 200，读到 `source: file`、`tokens: 18`、`warnings: []` |
| 素材路由 | ✅ `logo.svg` 200；穿越 404；`.exe` 404；跨源 403；`POST` 405；未鉴权 401 |
| 浏览器：浅色 | ✅ 背景 `#f7f3ea`、金主按钮 `rgb(200,162,74)`、衬线正文 → `docs/preview/theme-light.png` |
| 浏览器：深色预览 | ✅ 背景 `#0d1117`、品牌 `#cfad60` → `docs/preview/theme-dark.png`（**算法值直应用，非偏好切换**） |
| 非白名单探针 | ✅ `button-primary-fill` 被消费者使用；`bg-layer-3` 写入但无消费点 |
| 自验证脚本 | ✅ `scripts/release_check.py` 7/7 |

**已知缺口**

- 发送/图标按钮的填充色未纳入（读的是别的变量，待 v1.3 定位）。
- 深色需界面偏好切「深色」；截图是算法预览。
- 布局不可换 —— 这是结论，不是缺口。

**运维**

- dev 实例：`dsh --profile web --no-open --port 18981`，token 见交付报告；`desktop` profile 全程未动。
- 退役原因：素材方向把"名字趣味"当成了产品概念，与项目目标（默认主题 + 模块化探测）不符。

**回滚点**：`stage-03-v1.2` → `git reset --hard stage-03-v1.2`

---

## 2026-11-23 · 阶段 2 · v1.1 —— 插件骨架

- bundle（`dsh.bundle.patch` + `dsh.client`）、host/client 半边、`/sdt/*` 路由、配置与素材解析。
- 关键坑：cordis 禁止访问未注入服务 → `ctx.connection` 抛错被宿主统一回 400；补 `inject: ['webServer','connection']`。
- 验收：401/200/404/403/405 全过；14 token 写入 `body`。
- 回滚点：`stage-02-v1.1`

---

## 2026-11-22 · 阶段 1 · v1.0 —— 合同与实测基线

- 四条接缝实测、14 token 白名单、插件契约（bundle/patch/host/client/locale/icon）、生态调研 170 项目。
- 建立版本规则（`vX.Y` 逢 10 进 1）、`VERSION`、`CHANGELOG`、自验证脚本。
- 回滚点：`stage-01-v1.0`