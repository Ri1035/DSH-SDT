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

## v1.0 — 2026-11-22

**首次建立可交接基线**：文档体系 + 本机契约实测 + 生态调研 + 版本管理启用。
工程代码仍为 **0 行**，没有可安装产物。

### Changed

- **项目更名为 `DSH-SDT`**，全称 `Deepseekharness-Spiritron Dress Tailoring`，
  中文名 **灵衣缝制**（FGO 灵衣概念）。仓库名保持不变，更名先落在 README 与文档叙事上。
- **版本管理启用**：版本格式改为 `vX.Y`、逢 10 进 1（见文件头），
  与 DSH 官方版本号解耦；新增 `VERSION` 文件作为单一真相源。
- 读者入口从"Boujoy Harness"叙事改为"灵衣缝制"叙事：主题是**缝**出来的，不是**选**出来的。

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
- 🆕 `skills/boujoy-theme-setup/SKILL.md` —— **Agent 适配能力**（随插件分发，自动触发）
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
| **v1.0** | 2026-11-22 | 更名 DSH-SDT（灵衣缝制）；版本管理启用；本机契约实测；生态调研；文档基线可交接 |

> 下一次发版为 `v1.1`（插件骨架 + 素材路由 + 配置系统），之后 `v1.2` … `v1.9`，再进 `v2.0`。