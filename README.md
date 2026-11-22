# DSH-SDT

**Deepseekharness-Spiritron Dress Tailoring** ｜ 灵衣缝制

![version](https://img.shields.io/badge/version-v1.0-2ea44f)
![DSH](https://img.shields.io/badge/DSH-0.2.2--rc.1-blue)
![license](https://img.shields.io/badge/license-pending-lightgrey)

<p align="center">
  <img src="docs/assets/readme-hero.png" alt="灵衣缝制：蕾丝、纽扣与成衣" width="640">
</p>

<p align="center"><sub>一套外观由素材缝制而成 —— 不是从色板里挑出来的。</sub></p>

---

## 这是什么

DSH-SDT 是 **DeepSeek Harness（DSH）的主题插件**。它不修改 DSH 安装包，只使用官方 Cordis 插件接缝
改造界面外观：**theme token 覆盖、素材路由、首帧注入、slot 覆盖层**。

名称取自《Fate/Grand Order》的「灵衣缝制」，取的是"同一具身体、可替换的整套装束"这层意思；
工程上它就是一个标准外观插件——**外观（dress）可整件替换，缝制（tailoring）由 Agent 完成**。
用户只提供素材，不需要了解槽位名、命名规则或格式要求。

```
DSH 本体（不动）  ←  主题 token / 素材路由 / 首帧注入 / 覆盖层  ←  DSH-SDT
                                              ↑
                              $DSH_HOME/sdt/  素材与配置（内容层）
```

**引擎与内容分离**：代码只负责渲染，外观素材与配置全部落在用户数据目录；插件升级不覆盖内容。

---

## 能力

| 层 | 能力 | 接缝 |
|---|---|---|
| 外观 | 明暗双套主题 token 覆盖，含对比度自检 | `ctx.theme.overrideTokens(source, { light, dark })` |
| 素材 | `/sdt/asset/*` 提供 logo、字体、纹理、开屏素材；白名单 + 扩展名校验 + 体积上限 | host `webServer.register({ kind: 'prefix' })` |
| 首帧 | 在 React 挂载前接管首屏，规避 DSH 自带开机卡片的 271 ms 空窗 | `webserver/index-inject`（仅 `style` / `script`） |
| 覆盖层 | 开屏正片、HUD、常驻动画 | client `shell.overlay` + `slots.register` |
| 配置 | `$DSH_HOME/sdt/sdt.config.json`，深度合并默认值，错误带行列号 | 插件自有配置层（不写 profile patch） |
| 适配 | 从 `inbox/` 读取素材，生成整套配置与素材映射 | Agent Skill，`ctx.skills.registerProvider` |
| 逃生舱 | 任意 CSS 覆盖，优先级最高 | `$DSH_HOME/sdt/overrides.css` |

---

## 架构

| 层 | 手段 | 官方支持 |
|---|---|---|
| **A** | theme token 覆盖（`--dsw-alias-*` / `--dsw-specific-*`） | ✅ 完全官方 |
| **B** | 素材路由 + 首帧注入 + `shell.overlay` | ✅ 官方接缝 |
| **C** | 自有 CSS 覆盖既有组件外观（选择器分级，集中在 `overrides.tier3.css`） | ⚠️ 官方未承诺，按版本验证 |

四项约束（写进协作红线）：不碰 `app.asar`；不在 `desktop` profile 做实验；素材路由必须自行调用
`ctx.connection.requestRejection(req)`；不重定义 `--dsw-*` token，未暴露项走自有 `--bj-*` 变量。

---

## 版本管理

| 规则 | 说明 |
|---|---|
| 格式 | **`vX.Y`** 两段，`Y ∈ 0–9` |
| 进位 | **逢 10 进 1**：`v1.9 → v2.0`；不存在 `v1.10` |
| 禁止 | 三段及以上（`v1.0.0`）、两位小数（`v1.11` / `1.11.0`） |
| 单一真相源 | [`VERSION`](./VERSION)，`CHANGELOG.md` 与市场页必须一致 |
| 与 DSH 的关系 | 版本**解耦**；DSH 用官方号（`0.2.2-rc.1`），兼容范围只写 `peerDependencies["@deepseek-ai/dsh"]` |

**发版判定**：代码完成 → 自验证 → 写 CHANGELOG → `VERSION` +0.1 → 提交推送 → 贴验证报告。
缺任一项不进位。

### 自验证清单

1. `dsh --profile web --dump-config` 可见插件层
2. 卸载后界面恢复原生，控制台无 404 素材请求
3. 素材路由四用例：路径穿越 / 非法扩展名 / 超大文件 / 跨源请求
4. 明 / 暗 / 跟随系统：无白底白字，正文对比度 ≥ 4.5:1
5. 窄窗 `980×640` 不遮挡输入框与侧栏
6. `prefers-reduced-motion` 下无动画；刷新不重复注入、不二次开屏
7. 仓库全文扫描无 token / 密钥字面量
8. 版本号格式校验（`scripts/release_check.py`）

---

## 状态

当前 **v1.0**：接口与契约基线，工程代码尚未开始。

| 项 | 状态 |
|---|---|
| 生态调研（272 仓库 / 118 npm 包） | ✅ |
| DSH 接缝实测（4 条）+ token 白名单（14 项）+ 可覆盖线索（129 项） | ✅ |
| 文档体系（22 文件） | ✅ |
| 隔离 `web` profile 与实例验证 | ✅ |
| 插件代码 | ⬜ 下一阶段 v1.1 |

| 版本 | 里程碑 |
|---|---|
| v1.1 | 插件骨架 + 素材路由 + 配置系统 |
| v1.2 | 默认灵衣（token 全覆盖） |
| v1.3 | 开屏动画（首帧注入 + 看门狗） |
| v1.4 | 氛围层（材质 / HUD / 常驻动效） |
| v1.5 | 框架化：inbox 适配、doctor 校验、Skill 分发 |
| v1.6 | C 层视觉语言 |
| v1.7 | 对话动画 |
| v1.8 | 回归与降级验证 |
| v1.9 | 发布准备（双语 / 演示 / 市场元数据） |
| v2.0 | 首次公开发布 |

---

## 安装（目标形态，尚未发布）

```bash
# 开发态：装进隔离 profile，不要装在 desktop
dsh plugin --profile web add link:<本仓库 plugin 目录绝对路径>

# 或走官方安装器
# plugin_manager → install_bundle → <包绝对路径>
```

装上后默认外观直接生效。要换成自己的素材：放进 `$DSH_HOME/sdt/inbox/`，然后对 Agent 说
**「用 inbox 里的素材缝一套灵衣」**。

<details>
<summary>包结构（v1.1 起）</summary>

```
plugin/
├── package.json          # dsh.bundle.patch + dsh.client + exports + files
├── cordis.patch.yml      # - insert: [{ id: dsh-sdt, name: dsh-sdt }]
├── index.js              # host：apply(ctx, config)，inject: ['webServer']
├── client.js             # client：__ModuleLoader__.load({ id, factory })
├── icon.svg
├── locale/{en,zh}.json   # meta.title / meta.description
└── lib/
    ├── config.js         # 配置加载、默认值深合并、行列号报错
    ├── routes.js         # /sdt/config.json、/sdt/asset/*
    ├── assets.js         # 白名单、扩展名、体积、路径穿越防护
    └── slots.js          # 槽位规格单一数据源
```

</details>

---

## 文档

| 文件 | 作用 |
|---|---|
| [`VERSION`](./VERSION) ｜ [`CHANGELOG.md`](./CHANGELOG.md) | 版本单一真相源与变更记录 |
| [`AGENTS.md`](./AGENTS.md) | AI 协作入口：红线、环境、技术框架 |
| [`HANDOFF.md`](./HANDOFF.md) | 换设备 / 换会话的转手文档 |
| [`docs/TODO.md`](./docs/TODO.md) | 进度、阻塞项、决策记录（ADR） |
| [`docs/compat-0.2.2-rc.1.md`](./docs/compat-0.2.2-rc.1.md) | 本机版本实测：接缝、token、插件契约 |
| [`docs/architecture.md`](./docs/architecture.md) | A/B/C 分层、271 ms 时序、数据流 |
| [`docs/asset-library.md`](./docs/asset-library.md) | 素材槽位清单与适配规范 |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | 视觉规范、选择器分级 |
| [`docs/VERSIONING.md`](./docs/VERSIONING.md) | DSH 版本节奏与兼容策略 |
| [`research/ECOSYSTEM-2026-11-22.md`](./research/ECOSYSTEM-2026-11-22.md) | 生态调研：规模、头部项目、机制、空位 |
| [`scripts/release_check.py`](./scripts/release_check.py) | 每版自验证脚本 |

---

## 致谢

- **DeepSeek Harness** —— 运行基座与 Cordis 插件体系（本机基线 `0.2.2-rc.1`）
- 生态项目 `dsh-startup-screen`（MIT）、`dsh-client-ui-theme-pack`、`dsh-deep-whale` ——
  仅参考结构与做法，代码自行实现；许可不明的项目一律不抄
- 《Fate/Grand Order》—— 名称与视觉意象出处

## 许可

尚未选定（首次公开发布前补齐）。在此之前：代码可读、可参考，不构成再分发授权。