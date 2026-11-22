# DSH-SDT

> **Deepseekharness-Spiritron Dress Tailoring**
> 中文名：**灵衣缝制** —— 给 DeepSeek Harness 缝一件灵衣

![status](https://img.shields.io/badge/status-v1.0%20%E5%9F%BA%E7%BA%BF-2ea44f)
![DSH](https://img.shields.io/badge/DSH-0.2.2--rc.1-blue)
![license](https://img.shields.io/badge/license-%E5%BE%85%E5%AE%9A-lightgrey)

---

## 这是什么

**DSH-SDT 是一个给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（简称 DSH）用的界面外观插件。**
它不修改 DSH 的安装包，只通过 DSH 官方的 Cordis 插件体系（bundle / slot / theme token / webServer）
给界面换一套完整外观，并允许把外观素材换成你自己的。

### 名字的由来：FGO 的「灵衣缝制」

在《Fate/Grand Order》里，**灵衣（Spiritron Dress）** 是从者的一套新装束，
**灵衣缝制（Spiritron Dress Tailoring）** 则是把这套装束真正做出来、交到从者手上的那道工序。

这个项目把同一套隐喻搬到 DSH 上：

| FGO 里 | DSH-SDT 里 |
|---|---|
| 从者的灵基 | DSH 本体（不动它，只给它换装） |
| 一件灵衣 | 一整套外观（配色 + 字体 + 背景 + 开屏 + 动效） |
| **灵衣缝制** | **把素材缝成一套外观的过程**（由 Agent 完成，用户只丢素材） |
| 衣柜 / 图鉴 | 已缝好的多套灵衣，随时切换 |
| 再临素材 | 用户的 logo / 字体 / 纹理 / 壁纸 |

所以它不是"又一个换色主题"：**主题是缝出来的，不是选出来的。**
你把素材放进收件箱，Agent 按槽位规范缝成一套能穿的灵衣。

> 生态调研（170 个 DSH 外观类项目）显示：配色类 125 个、壁纸 44 个、玻璃 35 个、
> 开屏 10 个，而 **FGO / 灵衣 / 衣柜叙事 0 个**。这个位置目前是空的。
> 详见 [`research/ECOSYSTEM-2026-11-22.md`](./research/ECOSYSTEM-2026-11-22.md)。

---

## 设计三原则

1. **默认灵衣零操作即好看** —— 装上就是完整一套，"可自定义"不是半成品的借口
2. **脏活给 Agent** —— 用户不该知道槽位名、命名规则、格式要求；那是 Agent 的活
3. **引擎与内容分离** —— 代码只负责渲染，外观全在 `$DSH_HOME/boujoy/`；升级引擎不覆盖你的素材

---

## 版本管理

| 规则 | 说明 |
|---|---|
| 版本格式 | **`vX.Y`**，两段，`Y` 只取 `0`–`9` |
| 进位 | **逢 10 进 1**：`v1.9` → `v2.0`，不存在 `v1.10` |
| 禁止 | **三段及以上**（`v1.0.0`）、**两位小数**（`v1.11` / `1.11.0`）、四段 hotfix 号 |
| 单一真相源 | 根目录 [`VERSION`](./VERSION) 文件；`CHANGELOG.md` 与市场页必须与它一致 |
| 与 DSH 版本的关系 | **完全解耦**。DSH 版本用官方号（如 `0.2.2-rc.1`），本项目的 `vX.Y` 不含 DSH 号 |
| 兼容声明 | 只写在 `package.json` 的 `peerDependencies["@deepseek-ai/dsh"]`，**不写自定义字段** |

### 每次交付的自验证门槛（缺一项就不算完成）

1. `dsh --profile web --dump-config` 能看到插件层
2. 装/卸干净：卸载后界面回到原生，控制台无 404 素材请求
3. 素材路由安全四项：路径穿越 / 非法扩展名 / 超大文件 / 跨源请求
4. 明 / 暗 / 跟随系统 三种模式无白底白字、无低对比
5. 窄窗 `980×640` 不遮挡输入框与侧栏
6. `prefers-reduced-motion` 下不动画；刷新不重复注入、不二次开屏
7. 仓库全文扫描无 token / 密钥字面量
8. 版本号格式校验通过（`vX.Y`，`Y ∈ 0..9`）

> 每次完成必须**自验证并报告**，报告包含：改了哪条接缝、跑过哪几项、哪项没跑及原因。
> 不写"看起来合理"的结论——DSH 是 developer preview，行为一律以实测为准。

---

## 当前状态：v1.0（基线）

| 项目 | 状态 |
|---|---|
| 生态调研（272 仓库 / 118 npm 包） | ✅ 完成 |
| DSH 侧能力边界实测（四条接缝 / 14 项 token 白名单 / 129 项实际可覆盖） | ✅ 完成（129 项待探针复核） |
| 文档体系（19 份 + 2 份调研） | ✅ 完成 |
| 隔离 `web` profile + 实例启动 | ✅ 完成（本机 `0.2.2-rc.1`） |
| **工程代码** | ⬜ 0 行 —— 下一阶段 P0 开工 |
| 可安装产物 | ⬜ 暂无 |

**v1.1 起进入实现**：插件骨架 → 素材路由 → 配置系统 → 默认灵衣（颜色）→ 开屏。

---

## 使用（目标形态，尚未发布）

```bash
# 开发态安装（隔离 profile，不要装在 desktop）
dsh plugin --profile web add link:<本仓库绝对路径>
# 或走官方安装器
# plugin_manager → install_bundle → <包绝对路径>
```

装上后：**什么都不用做**，默认灵衣直接生效。
想换自己的外观：把素材丢进 `$DSH_HOME/boujoy/inbox/`，然后对 Agent 说
**「用 inbox 里的素材给我缝一套灵衣」**。

---

## 文档地图

| 文件 | 作用 |
|---|---|
| [`VERSION`](./VERSION) | 当前版本（单一真相源） |
| [`CHANGELOG.md`](./CHANGELOG.md) | 变更记录（按 `vX.Y` 分段） |
| [`AGENTS.md`](./AGENTS.md) | AI 协作入口：红线、环境、技术框架 |
| [`HANDOFF.md`](./HANDOFF.md) | 换设备 / 换会话的转手文档 |
| [`docs/TODO.md`](./docs/TODO.md) | 进度真相源：P0–P7、阻塞项、决策记录 |
| [`docs/compat-0.2.2-rc.1.md`](./docs/compat-0.2.2-rc.1.md) | 本机版本实测：接缝、token、插件契约 |
| [`docs/architecture.md`](./docs/architecture.md) | A/B/C 分层、271ms 时序、数据流 |
| [`docs/asset-library.md`](./docs/asset-library.md) | 素材槽位全量清单 + Agent 适配规范 |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | 视觉规范、选择器分级 |
| [`docs/VERSIONING.md`](./docs/VERSIONING.md) | DSH 版本节奏与兼容策略 |
| [`research/ECOSYSTEM-2026-11-22.md`](./research/ECOSYSTEM-2026-11-22.md) | 生态调研（规模、头部项目、机制、空位） |
| [`research/PLAN.md`](./research/PLAN.md) | 实施计划书 |
| [`research/REPORT.md`](./research/REPORT.md) | 早期生态与技术调研报告 |

---

## 致谢

- **DeepSeek Harness** —— 运行基座与 Cordis 插件体系（本机基线 `0.2.2-rc.1`）
- **dsh-startup-screen**（MIT）、**dsh-client-ui-theme-pack**、**dsh-deep-whale** 等生态项目 ——
  只读参考其**做法与结构**，代码自行实现；许可不明的项目一律不抄
- 《Fate/Grand Order》—— "灵衣 / 灵衣缝制" 的概念出处，本项目为非商业同人性质的命名致敬

## 许可

尚未选定（首次公开发布前补齐）。在此之前：**代码可读、可参考，不构成再分发授权**。