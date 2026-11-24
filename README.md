# DSH-SDT

<img alt="version" src="https://img.shields.io/badge/version-v1.9-2ea44f?style=flat-square">
<img alt="dsh" src="https://img.shields.io/badge/DSH-0.2.2--rc.1-1f6feb?style=flat-square">

**DeepSeek Harness 主题插件**：提供一套默认 FGO 风格主题，并以此为探针，测量 DSH 的模块化自定义上限。

> `DSH-SDT` / `Spiritron Dress Tailoring` 只是命名趣味，不含任何 FGO 玩法逻辑。
> **代码与 npm 包不含第三方美术**（含 FGO 素材）；美术走用户目录 `$DSH_HOME/sdt/assets/` 运行时加载，
> 详见 [许可与素材政策](#许可与素材政策)。

## 它做什么

| 层 | 内容 |
|---|---|
| 默认主题 | 装插件即生效：明暗两套 token、字体与圆角变量、强调色 |
| 配置 | `$DSH_HOME/sdt/sdt.config.json`，改颜色/动效/素材即可换一套外观 |
| 品牌 | 自绘 SVG 字标替换 `sidebar.brand.mark` |
| 素材 | `/sdt/asset/<name>` 提供 logo、纹理、字体，用户目录优先、内置回退 |
| 开屏 | `motion.splash.video` 指定用户素材名（如 `fgo.mp4`）；缺省纯 CSS；可跳过、每会话一次 |
| 点击特效 | canvas 菱形爆发（默认开）；`motion.click.scale` 0.5–3 调大小；`motion.click.enabled` 可关；reduced-motion 不启动 |
| 结论 | DSH 能改什么、改到什么程度，写进 [`docs/MODULARITY.md`](./docs/MODULARITY.md) |

## 安装

```bash
dsh plugin --profile web add link:<repo>/plugin    # 开发态
dsh plugin --profile web add dsh-sdt               # 发布后
```

装完打开界面即为默认主题；改配色只动 `sdt.config.json`，不用改代码。

> **桌面端**：CLI 会拒绝 `desktop` profile。需在 `$DSH_HOME/profiles/desktop/package.json` 的
> `dependencies` 加 `"dsh-sdt": "link:<repo>/plugin"`、`dsh.profile.bundles` 加 `"dsh-sdt"`，
> 跑一次 pnpm 安装后重启应用。启动前清掉 `ELECTRON_RUN_AS_NODE` / `NODE_OPTIONS`（见 HANDOFF §3.4）。

## 控制台

访问 `http://127.0.0.1:<port>/sdt/console`（先用 `/?token=` 换 cookie；加 `?mode=dark` 看深色）：

- 实时数据：版本、配置来源、路由自检（health / config / features / asset）；
- 主题：6 个基准色与色值、logo 来源；
- **功能矩阵**：13 张卡（M1–M10 / P3 / P5 / P7），已交付 / 部分 / 占位 / 无接缝 / 未验证一目了然；
- 占位块只说明「待 vX.Y 接线」，不含假开关；页面只读，不写配置。

功能清单的单一数据源是 `plugin/features.json`，控制台与文档共用。

## 当前状态

| 版本 | 内容 |
|---|---|
| v1.0 | 合同与实测基线（DSH 0.2.2-rc.1：4 条接缝、14 项 token、插件契约） |
| v1.1 | 插件骨架：bundle / host + client 半边 / 配置与素材路由 / 14 token 生效 |
| v1.3 | L1 133/133 token + L2 视觉语法 + M3 品牌字标 |
| v1.4 | 蓝青定版（深海军蓝 + 青蓝，对齐 FGO 界面语汇） |
| **v1.5** | 稳定化：6 个 bug 修复 + 转手文档 + 文档基线校正 |
| **v1.6** | L3 间距/几何 + M4 只读信息卡 + M5 负结论（无图标接缝） |
| **v1.7** | 插件控制台 `/sdt/console` + 功能矩阵占位 + `features.json` 单一数据源 |
| **v1.8** | M2 输入 dock + M1 覆盖层骨架 + **桌面端安装验证**（字标修复） |
| **v1.9** | **视频开屏（M9 首版）+ M1b 点击特效 + 控制台入口 + 图标重绘** |
| 下一阶段 | v2.0（首发）：M6 壁纸/玻璃 + M7 皮肤中心 + M8 安全模式 + 回归 + 发布清单 |

**验证范围**：`web` 与 `desktop` 均已实测。桌面端为 `dsh-app://` 渲染，
主题 / 133 token / 菱形字标 / 输入 dock / 首帧注入均已验证；
**v1.9 新增（开屏视频 / 点击特效 / 控制台入口）已在 `web` 实测**，桌面端下次启动自然生效。
桌面端启动有环境坑，见 `HANDOFF.md` §3.4 与 §6 K11–K13。

## 文档

| 文件 | 作用 |
|---|---|
| [`docs/PLAN-2026-11-23.md`](./docs/PLAN-2026-11-23.md) | **方案书 v2**：10 类模块矩阵、截图提炼的设计语法、v1.3–v2.0 排期 |
| [`docs/MODULARITY.md`](./docs/MODULARITY.md) | **能力矩阵与不可改红线**（项目核心结论） |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | 阶段计划、版本映射、验收与回滚规则 |
| [`docs/JOURNAL.md`](./docs/JOURNAL.md) | 工作日志（每次交付 / 自验证 / 阶段标记） |
| [`docs/TODO.md`](./docs/TODO.md) | 任务、阻塞、决策记录（ADR） |
| [`docs/compat-0.2.2-rc.1.md`](./docs/compat-0.2.2-rc.1.md) | 本机版本实测：接缝、token、插件契约 |
| [`research/RESOURCES-2026-11-23.md`](./research/RESOURCES-2026-11-23.md) | 先调研：可复用参考与资源、许可判据 |
| [`research/ECOSYSTEM-2026-11-22.md`](./research/ECOSYSTEM-2026-11-22.md) | 生态调研：规模、头部项目、机制、空位 |
| [`HANDOFF.md`](./HANDOFF.md) | **转手文档（换 Agent 先读这份）**：现状 / 环境 / 坑 / 回滚 / backlog |
| [`AGENTS.md`](./AGENTS.md) | AI 协作入口：红线、技术框架 |
| [`VERSION`](./VERSION) ｜ [`CHANGELOG.md`](./CHANGELOG.md) | 版本真相源与变更记录 |

## 版本规则

`vX.Y` 两段、逢 10 进 1（`v1.9 → v2.0`）；禁止三段与两位小数。
npm manifest 因平台要求写三段 semver（`1.2.0`），**对外版本仍是 `v1.2`**（ADR D24）。

## 许可与素材政策

- **代码**：MIT，全文见 [`LICENSE`](./LICENSE)。
- **第三方美术（含 FGO 素材）**：**不入仓库、不入 npm 包**。用户自行放在 `$DSH_HOME/sdt/assets/`
  的素材只在本机运行时加载（`/sdt/asset/*`），不随仓库或发行包分发，**不在 MIT 授权范围内**；
  版权归原权利人（TYPE-MOON / FGO PROJECT）。二创与分享前请自行确认适用法律与权利人政策。
- **仓库内素材**：`plugin/assets/logo.svg`、品牌字标、CSS 菱格/发丝线均为自绘，随 MIT 授权。
- 这样切分的原因：MIT 只能授权我们拥有版权的部分。把第三方美术放进 MIT 仓库会造成授权矛盾，
  也会让 npm 包无法合规分发；而运行时加载既满足自用二创，又保持仓库可开源。

## 致谢

- **DeepSeek Harness** —— 运行基座与 Cordis 插件体系
- 参考实现：[dsh-theme-endfield](https://github.com/ymh0000123/dsh-theme-endfield)（MIT，bundle 结构与幂等保护）、
  [dsh-bloom-theme](https://github.com/webkubor/dsh-bloom-theme)（MIT，OKLCH 与对比度方法）——
  只借结构与方法，视觉与代码自行实现