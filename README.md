# DSH-SDT

<img alt="version" src="https://img.shields.io/badge/version-v1.5-2ea44f?style=flat-square">
<img alt="dsh" src="https://img.shields.io/badge/DSH-0.2.2--rc.1-1f6feb?style=flat-square">

**DeepSeek Harness 主题插件**：提供一套默认 FGO 风格主题，并以此为探针，测量 DSH 的模块化自定义上限。

> `DSH-SDT` / `Spiritron Dress Tailoring` 只是命名趣味，**不含也不依赖任何 FGO 素材或玩法**。

## 它做什么

| 层 | 内容 |
|---|---|
| 默认主题 | 装插件即生效：明暗两套 token、字体与圆角变量、强调色 |
| 配置 | `$DSH_HOME/sdt/sdt.config.json`，改颜色/动效/素材即可换一套外观 |
| 品牌 | 自绘 SVG 字标替换 `sidebar.brand.mark` |
| 素材 | `/sdt/asset/<name>` 提供 logo、纹理、字体，用户目录优先、内置回退 |
| 结论 | DSH 能改什么、改到什么程度，写进 [`docs/MODULARITY.md`](./docs/MODULARITY.md) |

## 安装

```bash
dsh plugin --profile web add link:<repo>/plugin    # 开发态
dsh plugin --profile web add dsh-sdt               # 发布后
```

装完打开界面即为默认主题；改配色只动 `sdt.config.json`，不用改代码。

## 当前状态

| 版本 | 内容 |
|---|---|
| v1.0 | 合同与实测基线（DSH 0.2.2-rc.1：4 条接缝、14 项 token、插件契约） |
| v1.1 | 插件骨架：bundle / host + client 半边 / 配置与素材路由 / 14 token 生效 |
| **v1.5** | 蓝青定版 + 133/133 token + 字标；**全面 bug 修复 + 转手文档** |
| 下一阶段 | v1.6：L3 密度 + 图标替换（M5）+ 设置只读卡（M4） |

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

## 致谢

- **DeepSeek Harness** —— 运行基座与 Cordis 插件体系
- 参考实现：[dsh-theme-endfield](https://github.com/ymh0000123/dsh-theme-endfield)（MIT，bundle 结构与幂等保护）、
  [dsh-bloom-theme](https://github.com/webkubor/dsh-bloom-theme)（MIT，OKLCH 与对比度方法）——
  只借结构与方法，视觉与代码自行实现
- 许可：尚未选定（首次公开发布前补齐）