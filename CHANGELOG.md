# Changelog

本项目所有值得记录的变更都写在这里。

**版本规则（与本文件同步）**：版本号格式 **`vX.Y`**（两段），`Y` 只取 `0`–`9`，
**逢 10 进 1**（`v1.9` → `v2.0`）。禁止 `v1.0.0`、`v1.11`、`1.11.0` 这类三段或两位小数写法。
单一真相源是根目录 [`VERSION`](./VERSION)。DSH 自身的版本号（如 `0.2.2-rc.1`）与本项目版本**完全解耦**，
不得混写成本项目版本。

**分类说明**：`Added` 新增 ｜ `Changed` 变更 ｜ `Fixed` 修复 ｜
`Adapted` **适配 DSH 新版本**（本项目特有）｜ `Removed` 移除 ｜ `Security` 安全 ｜
`Researched` 调研结论（未产生代码）

---

## v1.7 — 2026-11-24

**可观测性：插件控制台 + 全功能占位矩阵**（版本调整见 Notes）。

### Added

- **`/sdt/console` 控制台**（单页、零构建、无外部依赖）：
  - KPI：插件版本（实时读 `package.json`）、token 覆盖（标注上次验证版本）、配置来源、桌面端状态；
  - 色板：6 个基准色 + 十六进制；logo 预览（读 `x-sdt-source` 显示内置/用户目录）；
  - **功能矩阵**：13 张卡片（M1–M10 / P3 / P5 / P7），状态分「已交付 / 部分 / 占位 / 无接缝 / 未验证」，占位块明确写「待 vX.Y 接线」，**不放假开关**；
  - 路线图 + 阻塞项 + 路由自检（health / config / features / asset 实际状态码）；
  - 明暗预览切换（只影响本页，不改 DSH 配置），支持 `?mode=dark` 直接打开深色。
- **`/sdt/features.json`**：功能清单的单一数据源，控制台与文档共用；改功能只改这一份。
- `/sdt/health` 增加 `version` 字段。
- 新内置 logo：蓝青菱形 + `SDT`（替换 v1.0 遗留的金色钩子占位图）。
- 截图：`docs/preview/v17-console-{light,dark,980}.png`。

### Changed

- `VERSION` / manifest / `client.js` 同步到 `1.7`。
- `package.json` 的 `files` 增加 `console.html` / `features.json`（否则发布后 404）。

### Security

- 两个新路由与既有路由共用**同一栅栏**：首行 `ctx.connection.requestRejection(req)`，异常 fail-closed；
- 控制台 HTML 返回 CSP：`default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'`；
- 未鉴权访问控制台实测 **401**。

### Verified

| 项 | 结果 |
|---|---|
| `/sdt/console` | 200 `text/html`，未鉴权 401 |
| `/sdt/features.json` | 200 JSON |
| 控制台渲染 | 4 KPI / 6 色板 / 13 模块卡（12 占位）/ 6 版本 / 4 自检全 200 |
| 筛选 | 「已交付」1 张、「占位」7 张、全部 13 张 |
| 明暗 | 深色 `#0a1626` + 浅色文字；无白色残块 |
| 980×760 | 无横向溢出，KPI 四列、卡片两列 |
| 自验证 | 8/8 |

### Notes

- **版本调整**：控制台独立成 `v1.7`；覆盖层 M1/M2 + 桌面首验顺延 `v1.8`，材质/开屏 `v1.9`，首发 `v2.0`。
- 控制台只读：不写配置、不触发宿主 publish，可安全用于观测。

---

## v1.6 — 2026-11-24

**L3 间距/几何 + M4 只读卡 + M5 负结论**（桌面端仍未验证）。

### Added

- **M4 只读信息卡**：注册到 `settings.general.item`，显示 `DSH-SDT / 版本 / token 133·133 / 配置来源 / 目录`。
  - 实测 `settings.section` 是设置页**内容容器**，注册后不显示；必须走 `settings.general.item` + `slots.inject`。
- **`docs/DENSITY.md`**：`--dsh-*` 全量盘点（当前视图 49 个）、归属表、三视口验证、M5 负结论。
- 三视口截图：`docs/preview/v16-light-1423.png`、`v16-light-980.png`。

### Changed

- **L3 间距**：`--dsh-composer-side-clearance` 16px → 20px；
  `--dsh-composer-card-max-width` 由 `+32px` → `+48px`（均通过 `[data-conversation-content]` 语义锚点覆盖）。
- `VERSION` / manifest / `client.js` 同步到 `1.6`。

### Researched（结论写入 DENSITY.md）

| 结论 | 证据 |
|---|---|
| 旧文档「88 个 `--dsh-*`」无实测支撑 | 当前主视图实测 **49 个**，随视图按需加载 |
| 字号变量由宿主**内联写在 `body`**，对应设置页偏好 | `--dsh-content-font-size: 14px` / `--dsh-code-font-size: 11px` 出现在 `body` style |
| 侧栏密度变量定义在哈希类（`.wtg9ga_root`），无稳定锚点 | 祖先覆盖会被内层定义遮蔽 |
| `ctx.theme` **没有图标接口** | 原型 13 个方法无 icon 相关 |

### Verified

| 项 | 结果 |
|---|---|
| 输入卡宽度（944 / 980 / 1423） | 728 / 728 / 780 px |
| 横向溢出 | 无（scrollWidth == innerWidth） |
| 左右间距变量 | 20px |
| 宿主字号 | 14px（未被插件改写） |
| M4 卡片 | 设置 → 通用设置底部可见 |
| 自验证 | 8/8 |

### Notes

- **桌面端仍是 0 验证**：本版未装 `desktop` profile，首帧结论留待 v1.7（需授权）。
- M5 官方图标替换判定为**无接缝**，降级为「只装饰自有元素」，不引入哈希选择器。

---

## v1.5 — 2026-11-23

**全面 bug 审查 + 修复 + 转手文档**（换人接手前的稳定化版本）。

### Fixed

1. **打包漏 `assets/`**：`files` 未含 `assets` → 发布后内置 `logo.svg` 会 404。
2. **HEAD 仍走 body 分支**：语义不符（Node 会兜底抑制 body，掩盖了症状）；现只回头。
3. **SVG 无 CSP**：用户素材可放 SVG，同源下脚本会执行（同源 XSS）→ 现回 `default-src 'none'` + `content-disposition`。
4. **延迟补扫覆盖用户配色**：1.2s/3.2s 的补扫用默认色重算，会把自定义颜色冲掉 → 改为记住 `currentColors`。
5. **`ctx.get('dshHome')` 未防护**：未声明服务时可能抛错导致挂载失败 → 加 try/catch 回退。
6. **token 值无注入防护**：配置里的任意字符串会写进 CSS 变量 → 限制 `; { } < > url(` 与长度。

### Added

- **`HANDOFF.md` 重写为完整转手文档**：现状、环境、代码地图、验收命令、10 个已知坑、
  回滚标签、backlog、"为什么不建议直接改 app.asar"、红线。
- **`LICENSE`（MIT，仅代码）**：第三方美术不入库、不入包，只走 `$DSH_HOME/sdt/assets/` 运行时加载（ADR D26/D27）。

### Docs（接手校正，2026-11-23）

| 文件 | 修了什么 |
|---|---|
| `docs/TODO.md` | 全文重写：原停留在「代码 0 行、P1 未开始」，现对齐 v1.5；补 D26–D28 |
| `AGENTS.md` | 速览阶段、环境路径/版本（旧机器 `Administrator` + `D:\soft\DSH` → 本机 `C:\DSH`）、阅读顺序、R9 表述、阻塞项 |
| `docs/ROADMAP.md` | S3–S11 与实际版本对齐；验收口径改为按版本；桌面首验提前到 v1.6 |
| `docs/PLAN-2026-11-23.md` | 版本表去重（原 `v1.5` 出现两次、`stage` 标签错位）；金色主色标注为 v1.4 已修正 |
| `docs/DESIGN.md` | 明确 14 项只是 inspect 白名单、133 项才是实测覆盖；已定色值/待定项拆分为「已定与待定」；三级选择器路径校正 |
| `plugin/client.js` | `VERSION` 常量 `1.3 → 1.5`（此前 `__sdtDebug.version` 会误报）；清理「金色」残留注释 |
| `plugin/package.json` | `license: UNLICENSED → MIT`（`private` 保留，防止误发布；首发前再改） |

### Verified（Web 端）

| 项 | 结果 |
|---|---|
| HEAD `/sdt/health` | ✅ 200，仅头无 body |
| SVG 响应 | ✅ 含 `content-security-policy` 与 `content-disposition` |
| 未鉴权 / 穿越 / `.exe` / 跨源 / POST | ✅ 401 / 404 / 404 / 403 / 405 |
| 非法 token 值 | ✅ 被丢弃并给 warning |
| token 覆盖 | ✅ 133/133 |
| 自验证 | ✅ 7/7（文档校正后为 8/8：新增 client.js 版本一致性检查） |

---

## v1.4 — 2026-11-23

**配色修正：金色主色 → 蓝青主色（对齐 FGO 界面语汇）**。

### Changed

- 默认色板改为深海军蓝 + 青蓝：
  `brand #37a3d6` / `accent #1f6fa8` / `bgDark #0a1626` / `bgLight #eef6fb` / `inkDark #dbeaf5` / `inkLight #0f1b26`
- 按钮表面（elevated / floating / tool-bar / hover / active）改为青蓝浅染，不再是中性灰
- 菱格底纹透明度 0.06 → 0.09；金色仅保留为字标与极细框线可选项

### Verified（Web 端）

- 深色截图 `docs/preview/theme-dark.png`：背景深海军蓝、侧栏青蓝字标 `SDT`、新会话按钮青蓝染
- 浅色截图 `docs/preview/theme-light.png`：冰蓝白底
- 覆盖仍为 133/133；自验证 7/7

### Notes

- 依据你提供的 FGO 终端截图：主色是青蓝、金只作细框与点缀 —— 前一版把金当主色是我判断错了
- 后续版本号顺延：L3 密度/图标/设置卡 → v1.5；覆盖层 → v1.6；开屏/壁纸/皮肤中心/安全 → v1.7

---

## v1.3 — 2026-11-23

**L1 全覆盖 + L2 视觉语法 + 品牌字标（M3）**。

### Added

- **L1 133/133 token 覆盖**：不再手写清单，改为「运行时扫描 + 实测基线 + 语义族映射」
  - 133 个 `--dsw-alias-*` / `--dsw-specific-*` 全部映射到明/暗两套值（`__sdtDebug.mapped = 133`）
  - 族规则覆盖 bg / border / brand / label / state / button / code-diff / illustration /
    interactive / sidebar / markdown / menu / toast / tooltip / bubble / input 等
- **L2 视觉语法**（只用稳定锚点，不动布局）：深色菱格底纹（G6）、侧栏金色发丝线与内阴影、
  会话头金色下边框、`::selection` 金色高亮
- **M3 品牌字标**：向 `sidebar.brand.mark` 注册自绘 SVG（金色菱形 + `SDT`），实测替换成功
- `appearance.mode`（`auto|light|dark`）：经 `theme.setTheme` 走正规路径，避免与宿主 publish 抢顺序
- 演示截图 `docs/preview/theme-{light,dark}.png` 改为**实机 headless 抓取**（1423×900）

### Fixed

- 首轮运行时只扫到 37 个变量 → 改为「基线 133 + 延迟补扫」，覆盖稳定在 133
- 移除会与宿主 drop 态虚线叠加的 composer 描边规则（观感问题）

### Verified（Web 端）

- `__sdtDebug`: `{ version: "1.3", mapped: 133, total: 133, skipped: [] }`
- 深色：`data-ds-dark-theme` 生效，背景 `#0d1117`，字标为品牌金 `#c8a24a`
- 自验证脚本 7/7

### Notes

- 按约定**只做 Web 端验证**；桌面端（Electron）本轮未安装、未测试
- 深色截图通过 `theme.setTheme('dark')` 得到，属真实偏好切换路径

---

## v1.2 — 2026-11-23

**默认主题成稿 + 模块化能力矩阵首版**。

### Added

- 主题派生：由 `colors.{brand,accent,bgLight,bgDark,inkLight,inkDark}` 派生 **18 个 token**
  （14 白名单 + 4 非白名单候选），并注入 `--bj-*`（圆角/阴影/强调色）与 `--dsh-font-family-*`（衬线正文）
- `examples/sdt.config.json` —— 内容层样例（可直接复制到 `$DSH_HOME/sdt/`）
- `docs/MODULARITY.md` —— **能力矩阵**：可改项 / 接缝 / 稳定性 / 实测证据 / 不可改红线
- `docs/ROADMAP.md` —— 阶段 S1–S8、版本映射、验收口径、**阶段标记与回滚规则**
- `docs/JOURNAL.md` —— 工作日志（每版一条，含回滚点）
- `research/RESOURCES-2026-11-23.md` —— 先调研：可复用参考与许可判据
- `docs/preview/theme-light.png` / `theme-dark.png` —— 实机截图（深色为算法值预览，已在文档标注）

### Changed

- README 重写为官方术语简报（主题插件 / token / slot / bundle / 路由 / 配置），删去隐喻式叙事
- `colors` 配置键改为 6 个基准色，旧 `surface/ink` 停用

### Researched

- 非白名单 token 探针：`--dsw-alias-button-primary-fill` **确实被主按钮消费**；
  `--dsw-alias-bg-layer-3` 写入但默认视图无消费点 → "写进去 ≠ 生效"

### Removed

- `research/ASSETS-2026-11-23.md`（FGO 素材清单）—— 方向错误：把项目名的趣味当成了产品概念

### Adapted

- 仍以 DSH `0.2.2-rc.1` 为验证基线；本版未新增接缝

---

## v1.1 — 2026-11-23

**插件骨架落地**：`plugin/` 可安装进 `web` profile，配置路由与素材路由带完整安全闸，client 半部把 14 个
`--dsw-alias-*` 真正写进界面。

### Added

- 🆕 `plugin/` —— 可安装的 Cordis bundle
  - `package.json`：`dsh.bundle.patch` + `dsh.client`（`platform: web`，`inject: ["@deepseek-ai/dsh-client-ui-theme"]`）
    + `peerDependencies["@deepseek-ai/dsh"] = ">=0.2.0-rc.2 <0.3.0-0"`（optional，避免 link 安装时强解）
  - `cordis.patch.yml`：插入 `id: sdt` 行
  - `index.js`：host 半边，`inject: ['webServer', 'connection']`，注册 `/sdt` 前缀路由
  - `client.js`：browser 半边，`theme.overrideTokens` + 注入 `--bj-*` 变量，含双挂载保护
  - `lib/config.js`：`$DSH_HOME/sdt/sdt.config.json` 读取、深合并、逐字段校验、JSON 语法错带行列号
  - `lib/assets.js`：素材白名单（8 种扩展名）、路径穿越防护、4 MB 上限、用户目录 → 内置回退
  - `lib/routes.js`：`/sdt/health`、`/sdt/config.json`、`/sdt/asset/<name>`，首行过栅栏
  - `locale/{en,zh}.json` + `icon.svg` + 内置 `assets/logo.svg`
- 🆕 14 个 token 的明暗双套推导（由 `colors.brand/accent/surface/ink` 计算，含混色工具）

### Fixed

- ⚠️ **`inject` 必须声明 `connection`**：cordis 禁止访问未注入的服务属性，否则
  `ctx.connection` 直接抛 `cannot get property "connection" without inject`，
  宿主把所有 handler 异常统一回 **400**，表现为「所有路由 400」。
- 栅栏改成 fail-closed：`requestRejection` 抛错或服务缺失时按 403 处理，绝不放行。

### Verified

- 装进 `web` profile：`dsh plugin --profile web add link:<repo>/plugin`；`--dump-config` 出现 `# == dsh-sdt`
- 路由：未鉴权 `401` / 带 cookie `200` / `config.json` 返回默认配置 / `logo.svg` `200 image/svg+xml`
- 安全：路径穿越 `404`、非法扩展名 `404`、跨源 `403`、`POST` `405`
- 浏览器端到端：`body` 上出现我们的 14 个 token（`--dsw-alias-bg-base: #ffffff`、
  `--dsw-specific-sidebar-fill: #f3f6fa`、`--dsw-alias-brand-primary: #3b6ea5`）

### Notes

- npm/pnpm 要求 manifest 里是三段 semver，故 `plugin/package.json` 写 `1.1.0`；
  **项目版本仍是 `v1.1`**（`VERSION` / `CHANGELOG` / 发布标签一律两段）。校验器已做映射。

---

## v1.0 — 2026-11-22

**首次建立可交接基线**：文档体系 + 本机契约实测 + 生态调研 + 版本管理启用。
工程代码仍为 **0 行**，没有可安装产物。

### Changed

- **项目更名为 `DSH-SDT`**，全称 `Deepseekharness-Spiritron Dress Tailoring`，
  中文名 **灵衣缝制**（FGO 灵衣概念）。仓库名保持不变，更名先落在 README 与文档叙事上。
- **版本管理启用**：版本格式改为 `vX.Y`、逢 10 进 1（见文件头），
  与 DSH 官方版本号解耦；新增 `VERSION` 文件作为单一真相源。
- 读者入口从"DSH-SDT"叙事改为"灵衣缝制"叙事：主题是**缝**出来的，不是**选**出来的。

### Added

- 🆕 `VERSION` —— 版本单一真相源（当前 `v1.0`）
- 🆕 `research/ECOSYSTEM-2026-11-22.md` —— **生态调研**（GitHub + npm 实抓）
  - 12 条查询去重 **272 仓库**（DSH 相关 250，DSH + 外观 **170**），npm 去重 118 包
  - 规模分布：★≥500 有 6 个、100–499 有 13 个、10–99 有 65 个
  - 功能分布：配色 125 ／ 壁纸 44 ／ 玻璃 35 ／ **开屏仅 10** ／ 字体 4
  - 许可分布：MIT 114 ／ NOASSERTION 29 ／ 无 15 ／ AGPL-3.0 6
  - **机制实测**：`dsh-client-ui-theme-pack` 实际覆盖 **129 个 `--dsw-*`**（117 alias + 11 specific），
    并非旧结论的 14 个；`dsh-startup-screen` 用 host index 注入 + 三条自定义路由（含 `requestRejection`）+ 本地 JSON 配置，
    与我们的双半边设计同路
  - **空位**：FGO / 灵衣 / 衣柜叙事 0 个命中（仅 1 个 Saber 壁纸皮肤，0★）
- 🆕 `docs/compat-0.2.2-rc.1.md` —— 换机后的本机实测（版本、路径、四接缝、14 token 白名单、官方插件契约、P0 落地形态）
- 🆕 本机环境打通：隔离 `web` profile 建成；`dsh --profile web --no-open --port 18950` 可起，
  无 token 访问 `401`、带 token `303→200`，`__DSH_BOOT__` 引导表 73 条客户端模块
- 🆕 网络绕行工具（本地、不进仓库）：`tools/ghnet.py`（DoH + 真 IP + SNI）、
  `tools/ghproxy.py`（本地 CONNECT 代理，git 走 `-c http.sslBackend=openssl`）

### Fixed

- 旧结论 `D17`「token 只有 14 个」**降级为"inspect 白名单 14 个"**：
  `overrideTokens` 实际接受 129 个有效变量（待本机探针复核后写入 `DESIGN.md`）
- `HANDOFF.md` §3 环境事实按本机重写（DSH `0.2.2-rc.1`、`$DSH_HOME=C:\DSH\.dsh`、只有 desktop profile）

### Security

- 仓库全文扫描：**无 `ghp_` token 字面量**。外部凭据只在单次进程环境变量中传递，不落盘、不进 git。
- 明确：`tools/` 本地工具目录经 `.git/info/exclude` 排除，不会误提交。

### Adapted

- 验证基线更新为 **DSH `0.2.2-rc.1`**（commit `c59d10a`）。
  四条接缝（`webserver/index-inject` / `overrideTokens` / `shell.overlay` / `webServer.register`）已复核存在。
  兼容矩阵仍是"只声明验证过的版本"。

---

## 更早的规划期记录（v1.0 之前，同日整理）

### Added

- 🆕 `HANDOFF.md` —— **转手文档**（换设备 / 换会话继续用）
- 🆕 `skills/sdt-theme-setup/SKILL.md` —— **Agent 适配能力**（随插件分发，自动触发）
- 🆕 **槽位全量清单**（`docs/asset-library.md` §3）：内容级 34 项 / 样式级 13 项 / 结构级 30 项 / 明确不可自定义 5 类
- 🆕 槽位规格单一数据源 `plugin/lib/slots.js`（Agent 依据 / doctor 校验器 / 文档共用）
- 文档体系：`AGENTS.md`、`docs/TODO.md`、`docs/DESIGN.md`、`docs/project-overview.md`、
  `docs/architecture.md`、`docs/development.md`、`docs/component-api.md`、`docs/user-guide.md`、
  `docs/asset-library.md`、`docs/features-customization.md`、`docs/VERSIONING.md`

### Changed

- 用户侧接口从"同名覆盖"改为"素材收件箱 + Agent 适配"
- 产品定位澄清：默认主题是主产品，自定义框架是留给别人的空间（三档体验）

### 调研发现（2026-09-30）

- 官方**不维护 `CHANGELOG.md`**，变更记录只在 **GitHub Releases**（tag 形如 `dsh-v0.2.0-rc.2`），
  机器可读入口 `releases.atom`
- `v0.2.0-rc.1` / `rc.2` 两条 release notes 直接压在本项目作业面：
  「优化**对话进行中和完成状态的实时动画**」「优化**字号和深色主题样式**，优化动画运行开销」
  → C 层 CSS 覆盖与对话动效是官方正在主动演进的区域，需按最高警戒级别对待

---

## 版本历史

| 版本 | 日期 | 内容 |
|---|---|---|
| **v1.7** | 2026-11-24 | 插件控制台 + 全功能占位矩阵 + features.json 单一数据源 |
| **v1.6** | 2026-11-24 | L3 间距/几何 + M4 只读信息卡 + M5 负结论（无图标接缝） |
| **v1.5** | 2026-11-23 | 全面 bug 审查与修复（6 项）+ 转手文档重写 |
| **v1.4** | 2026-11-23 | 配色修正：蓝青主色 + 青蓝按钮表面（对齐 FGO 语汇） |
| **v1.3** | 2026-11-23 | L1 133/133 全量 + L2 视觉语法 + M3 字标 + 实机截图 |
| **v1.2** | 2026-11-23 | 默认主题成稿 + 模块化矩阵 + 阶段标记 |
| **v1.1** | 2026-11-23 | 插件骨架落地：bundle + host/client 半边 + 配置与素材路由 + 14 token 实测生效 |
| **v1.0** | 2026-11-22 | 更名 DSH-SDT（灵衣缝制）；版本管理启用；本机契约实测；生态调研；文档基线可交接 |

> 下一次发版为 `v1.8`（M1 覆盖层 + M2 输入 dock + 桌面端首验），之后 `v1.9` 开屏/壁纸/皮肤中心/安全模式与回归，`v2.0` 首发。