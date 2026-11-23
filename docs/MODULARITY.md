# MODULARITY.md —— DSH 模块化自定义能力矩阵

> 这是本项目的**核心产出之一**：用一套默认主题当探针，把 DSH 能改到什么程度写成可复核的结论。
> 证据等级：`【实测】` 本机跑过 / `【引用】` 官方文档或参考项目 / **未确认**。

## 0. 一句话结论

DSH 的可自定义面**集中在"外观数据"**：颜色 token、素材字节、首帧注入、覆盖层与 slot。
**布局结构、路由、状态管理不可替换**。所以"模块化"的正确形态是
**引擎（渲染）+ 内容（配置/素材）+ 接缝（4 条）**，而不是"把 DSH 改成另一个应用"。

---

## 1. 能力矩阵

| 能力 | 接缝 | 可改程度 | 稳定性 | 状态 |
|---|---|---|---|---|
| 颜色主题 | `ctx.theme.overrideTokens` | 官方白名单 14 项；实测可写入更多 `--dsw-*`（见 §2） | 高（全走廊零改名） | 【实测】 |
| 圆角 / 阴影 / 字体 / 动效时长 | 自有 CSS 变量 + `<style>` 注入 | 完全可控（但只能作用于既有元素） | 中（依赖选择器） | 【实测】 |
| 视觉素材（logo/纹理/字体） | `webServer.register({kind:'prefix'})` | 完全可控，需自建鉴权 | 高 | 【实测】 |
| 首屏 / 开屏 | `webserver/index-inject`（`style`/`script`） | 可在 React 挂载前接管首帧 | 高 | 【引用】+ 待 v1.3 实测 |
| 覆盖层 / 浮层 | client `shell.overlay` + `slots.register` | 可加整块 UI | 高 | 【引用】 |
| 局部插入（如输入框下方） | `slots.register('conversation.composer.dock')` | 可插入组件 | 中（slot 名曾变过） | 【引用】 |
| 布局结构（三栏、侧栏顺序） | — | **不可改**（没有布局接缝） | — | 【实测】 |
| 路由 / 页面 | — | **不可加页面**（只可加 HTTP 路由，不改前端路由） | — | 【实测】 |
| 设置项 | 官方 settings / `configForms` | 可加，但 API 换过代 | 低 | 未确认（本版本未接） |
| Agent 能力（Skill） | `ctx.skills.registerProvider` | 可注册技能提供者 | 中 | 【实测】API 存在，未接线 |
| 对话渲染（消息节点） | `conversation.chat.node` | 可替换渲染 | 低（无先例） | 未确认 |

---

## 2. Token 覆盖面（v1.2 实测）

| 项 | 结论 | 证据 |
|---|---|---|
| `Theme.listTokens` 白名单 | **14 项，全部 `requiresLightAndDark: true`** | 【实测】源码 `BUILTIN_INSPECT_TOKENS` |
| `overrideTokens` 是否校验名字 | **不校验**：任意 `--dsw-*` 名都会被接受并写入 `body` 内联样式 | 【实测】v1.3 写入 **133 项**，`__sdtDebug.mapped = 133 / 133` |
| 非白名单变量是否被消费 | **取决于组件是否读它**：同一批里有被消费的，也有写了没人用的 | 【实测】见下表 |
| 结论 | 色面足够做完整主题；**布局仍不可替换** | — |

### 2.1 非白名单 token 探针结果【实测】

| 变量 | 是否写入 | 是否被消费 | 证据 |
|---|---|---|---|
| `--dsw-alias-bg-layer-3` | ✅ | ❌ 默认视图内 0 个元素使用 | 设成品红 `#ff00ff` 后全页扫描无消费点 |
| `--dsw-alias-button-primary-fill` | ✅ | ✅ **主按钮** | 页面内 `button._primary_` 计算背景 = `rgb(200,162,74)`（我们的品牌金） |
| `--dsw-alias-button-primary-hover` | ✅ | 未单独验证 | — |
| `--dsw-alias-border-l3` | ✅ | 未单独验证（官方 CSS 有引用） | — |
| 发送按钮（图标按钮） | — | ❌ 未覆盖：仍用默认蓝，说明它读的是另一个变量 | 截图 `docs/preview/theme-light.png` |

> 方法可复用：配置里加一个标记色 → 重启 → 遍历元素查 computedStyle 是否出现该色。
> **不要假设"写进去就生效"** —— 必须找到消费点才算数。

### 2.2 已知缺口

- 发送/图标按钮的填充色未纳入（待逐一定位变量名）。
- 深色模式需在界面里把偏好切到「深色」才会由主题服务下发明色值；
  `docs/preview/theme-dark.png` 是**用同一算法算出的暗色值直接应用**得到的预览，不是偏好切换的结果。

---


## 2.3 v1.3 实测结论补充

| 结论 | 证据 |
|---|---|
| 133 个变量可全部覆盖 | `__sdtDebug = { mapped: 133, total: 133, skipped: [] }` |
| 品牌字标可替换 | `sidebar.brand.mark` 注册自绘 SVG 后，侧栏出现「金菱形 + SDT」 |
| 深色必须走偏好切换 | 直接写 inline 会被宿主 publish 覆盖；`theme.setTheme('dark')` 才生效 |
| 宿主 drop 态自带虚线 | composer 的虚线不是插件产生，改描边前需先确认宿主默认态 |

## 3. 不可自定义（红线）

| 项 | 原因 |
|---|---|
| 布局与三栏结构 | 无布局接缝；`root` slot 被官方标注 DO NOT register |
| 前端路由 / 页面 | 只能加 HTTP 路由（如 `/sdt/*`），不能加前端页面 |
| DSH 安装包（`app.asar`） | 只读归档，更新即覆盖，破坏签名 |
| 宿主鉴权 | 自定义路由**不继承**，必须自行 `requestRejection` |

---

## 4. 由此得到的模块划分（代码即按此组织）

```
plugin/
├── index.js        host：只做路由注册（引擎）
├── client.js       client：token 映射 + 自有变量（引擎）
├── lib/config.js   内容：配置读取与校验
├── lib/assets.js   内容：素材解析
└── lib/routes.js   接缝：/sdt/*
```

**内容与引擎分离**：新增一套主题 = 换 `sdt.config.json` + 素材，不改上述任何 JS。

---

## 5. 桌面端实测（v1.8，DSH `0.2.2-rc.1` / Electron 44.7.0）

| 能力 | 桌面端结果 | 证据 |
|---|---|---|
| 安装 | ✅ `link:` 进 `desktop` 的 dependencies + bundles，pnpm 安装，冷启动加载 | `__sdtDebug` 存在 |
| 主题 token | ✅ 133/133 | `mapped:133, total:133, source:file` |
| 自定义路由 | ✅ **相对路径可用**：`dsh-app://app/sdt/*` 直接命中插件路由 | `fetch('/sdt/config.json')` → 200 |
| 跨源绝对地址 | ❌ `http://127.0.0.1:<port>/sdt/*` 被拒 | `Failed to fetch`（CORS/栅栏） |
| 品牌字标 | ✅ `priority:-10` 替换官方默认标 + `sidebar.brand.name` = `DSH-SDT` | DOM 有 `[data-sdt-brand]` |
| 输入 dock | ✅ 挂载并渲染 | `[data-sdt-dock]` 高 16px |
| 覆盖层 | ⏸ 默认关闭，未在桌面开启验证 | — |
| 首帧 `index-inject` | ✅ **已验证生效**（`__sdtFirstFrame` / `data-sdt-first` / `--sdt-first-frame`） | v1.8 补丁探针 |
| 启动耗时 | 约 20–30 秒（插件多），`Loading plugins…` 属正常 | 冷启动观测 |

**桌面端特有坑**

1. `ELECTRON_RUN_AS_NODE=1` 会让 `DeepSeek Harness.exe` 以 Node 模式**静默退出**（exit 0，无窗口）。
   从 WorkBuddy 终端启动必须先清掉它和 `NODE_OPTIONS`。
2. 桌面端页面**重载**会长时间停在 `Loading plugins…`（约 20s），排查时不要误判为崩溃。
3. single slot 的替换用 `priority`（越小越优先），`order` / `id` 只对 list slot 有效。
