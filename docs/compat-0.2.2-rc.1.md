# compat-0.2.2-rc.1.md —— 本机环境与版本实测对齐

> **用途**：`HANDOFF.md` 记录的是 2026-09-30 那台机器 + DSH `0.2.0-rc.2` 的事实。
> 本文记录 **2026-11-22 换机后**（`C:\Users\KOKA\Desktop\FGO`）重新实测的结果。
> **凡与旧文档冲突，以本文为准**（旧文档仍是设计依据，但事实层要按本文更新）。
>
> 证据等级：【实测】= 本机命令或解包源码读出；【引用】= 官方随包文档原文；未确认 = 仅推测。

---

## 1. 本机环境【实测】

| 项 | 值 |
|---|---|
| 工作目录（本地项目根） | `C:\Users\KOKA\Desktop\FGO` |
| DSH 安装目录 | `C:\DSH`（`DeepSeek Harness.exe` 在此） |
| DSH 包内容 | `C:\DSH\resources\app.asar`（**203.3 MB / 22102 个文件**，比旧机的 115.7 MB 大得多） |
| DSH 用户数据 `$DSH_HOME` | `C:\DSH\.dsh` |
| 当前 profile | `desktop`（`$DSH_PROFILE=desktop`，`$DSH_PROFILE_DIR=C:\DSH\.dsh\profiles\desktop`） |
| **已存在的 profile** | **只有 `desktop`**；`web` 不存在 |
| 内置 Node | `C:\DSH\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe` → **v24.21.0** |
| 内置 pnpm | 同上目录 `…\pnpm\bin\pnpm.mjs` → **11.28.5** |
| dsh CLI | `C:\DSH\resources\runtime\cli\bin\dsh.cmd` → **0.2.2-rc.1** |
| Electron | `44.7.0`（`C:\DSH\version` 是 Electron 版本，**不是** DSH 版本） |
| PATH 上的 node | `C:\Program Files\nodejs\node.exe`（与内置 Node 并存，本项目仍按纪律用内置那套） |

### 1.1 版本差异（重要）

| 项 | 旧文档记录 | 本机实测 |
|---|---|---|
| DSH 版本 | `0.2.0-rc.2` | **`0.2.2-rc.1`** |
| pnpm | `11.7.0` | `11.28.5` |
| `$DSH_HOME` | `C:\Users\Administrator\.dsh` | `C:\DSH\.dsh` |
| 安装目录 | `D:\soft\DSH` | `C:\DSH` |
| app.asar 规模 | 115.7 MB / 12967 文件 | 203.3 MB / 22102 文件 |

> **结论**：项目当前状态是"代码 0 行"，还没被版本变更咬到。但 `VERSIONING.md` 的兼容矩阵
> 需要新增一行：**`0.2.2-rc.1` 已复核四条接缝（见 §3），但尚未跑起插件**。

### 1.2 这台机器的网络陷阱（会坑到 `git clone` / `pnpm add`）【实测】

| 现象 | 原因 |
|---|---|
| `github.com` / `api.github.com` / `raw.githubusercontent.com` 解析成 `127.0.0.1` | `hosts` 被 **Steam++ 加速器**写入大段 `127.0.0.1` 条目（`# Steam++ End` 段落） |
| `curl` / `.NET` / `git`（默认 schannel）TLS 失败：`SEC_E_NO_CREDENTIALS` | Windows schannel 在本沙箱内取不到凭据 |
| 真实网络其实是通的 | TCP 到 `140.82.113.6:443`、`223.5.5.5:443` 均连通 |
| **`github.com` 的 TCP 连接很不稳定** | 同一 IP 时而 264ms 连上、时而 6s 超时；连上后也可能 TLS 完成却不返回 HTTP 响应 |

**可行的通道（已跑通）**：

| 用途 | 通道 | 状态 |
|---|---|---|
| 读 API / 查仓库 | `tools/ghnet.py`（DoH 取真 IP + 正确 SNI 的 HTTPS） | ✅ 稳定 |
| 下载仓库快照 | `tools/ghnet.py` → `codeload.github.com/.../zip/refs/heads/main` | ✅ 已用 |
| **推送提交** | **`tools/gh_push.py`（GitHub Git Data API）** | ✅ **已验证：远端 SHA 与本地一致** |
| 直连 git 传输 | `tools/ghproxy2.py`（CONNECT 代理）+ `-c http.sslBackend=openssl` | ⚠️ 不稳定，仅作备份 |

**为什么推送走 API**：`github.com` 的 git 智能 HTTP 端点在这台机器上频繁卡住
（CONNECT 成功、TLS 成功、请求无响应），而 `api.github.com` 每次都正常。
`gh_push.py` 用 Git Data API 逐个上传 blob → 建 tree → 建 commit → 更新 ref，
并**逐字段对齐作者/提交者/时间/消息**，因此服务端生成的 commit SHA 与本地完全相同（已实测相等），
本地历史不需要改写。

```powershell
# 当前环境下的同步流程
git add -A; git commit -m "..."
$env:GH_PUSH_TOKEN = '<token>'      # 只放在单次进程环境变量里
python tools\gh_push.py             # 推上去并核对 SHA
git update-ref refs/remotes/origin/main $(git rev-parse HEAD)   # 手动对齐跟踪引用
```

> ⚠️ `tools/` 全部被 `.git/info/exclude` 排除，脚本与 token 都不入库。

---

## 2. 仓库与本地状态【实测】

| 项 | 值 |
|---|---|
| 仓库 | `https://github.com/Ri1035/DSH-SDT`（public，账号 `Ri1035`） |
| 本地 | `C:\Users\KOKA\Desktop\FGO`，**已带完整历史克隆**（`git clone` 而非 zip 解包） |
| HEAD | `324e3f2` `docs: ... README ...` |
| 分支 | `main` ↔ `origin/main`，工作区仅 `tools/`（未跟踪本地工具） |
| 工程代码 | **仍然 0 行**（18 个文档文件） |
| License | 未添加 |

---

## 3. 四条接缝在 `0.2.2-rc.1` 的复核【实测：解包 `app.asar` 字符串 + 源码】

| 接缝 | 结论 | 证据 |
|---|---|---|
| `webserver/index-inject` | ✅ 存在，签名未变 | 官方 `dsh-client-ui-theme/lib/index.js` 里就是 `ctx.on("webserver/index-inject", table => table.push({kind:"style"},{kind:"script",placement:"body"}))` |
| `theme.overrideTokens(source, {…})` | ✅ 存在，**必须 `{light, dark}` 成对**，裸字符串抛教学错误 | `validateOverrides` 源码逐字确认 |
| `shell.overlay` | ✅ 存在 | asar 内多处以 slot 文档形式出现 |
| `webServer.register({kind:'prefix', …})` | ✅ 存在 | 官方 `open-in-app` 插件用法 |
| `connection.requestRejection(req)` | ✅ 存在 | 源码注释：`Apply the Host/Origin fence and require an authenticated live Peer` |

### 3.1 ⚠️ 与旧文档冲突的两处

1. **`ctx.skills.register()` → 本版本是 `ctx.skills.registerProvider(fn)`**【实测】
   - asar 内实际用法：`ctx.skills.registerProvider(() => ({ name, list: () => Promise.resolve([...]) }))`
   - 影响 `TODO.md` 的 **T3.5.3**（原写"通过 `ctx.skills.register()` 注册"）
2. **`dsh.client.inject` 的语义是"客户端包激活顺序"而非"服务依赖"**【实测+引用】
   - asar 原文：`dsh.client.inject entries only order activation and stay allowed`
   - 但**官方模板自己**在 client 模块里写了 `inject: ['slots']`（模块级服务注入）
   - 影响 `AGENTS.md` R9：**不是"填了就炸"，而是"只用来排序"**；红线应改为
     「不填**无关**包，只在确实要按序等某 UI 包时填它」，并保留"先空数组上线"的保守起步。

### 3.2 14 个可覆盖 token（本版本 `Theme.listTokens` 白名单，全部 `requiresLightAndDark: true`）【实测】

```
--dsw-alias-bg-base              Application base background.
--dsw-alias-bg-layer-1           Primary raised surface background.
--dsw-alias-bg-layer-2           Secondary nested surface background.
--dsw-alias-bg-overlay           Overlay and popover background.
--dsw-alias-border-l1            Primary subtle border.
--dsw-alias-border-l2            Secondary stronger border.
--dsw-alias-brand-primary        Primary brand accent.
--dsw-alias-label-primary        Primary text color.
--dsw-alias-label-secondary      Secondary text color.
--dsw-alias-state-error-primary  Primary error state color.
--dsw-alias-state-idle-primary   Primary inactive state color.
--dsw-alias-state-success-primary Primary success state color.
--dsw-alias-state-warn-primary   Primary warning state color.
--dsw-specific-sidebar-fill      Sidebar column and title-row background.
```

- 结论与旧文档一致：**`D17` 成立**（只有颜色，14 个）。`DESIGN.md` §2.2 的 15 个需按此表订正为 14。

> 🆕 **2026-11-22 补注（生态实测，尚未在本机验证）**：这 14 项是 `Theme.listTokens` 的
> **inspect 白名单**；`overrideTokens` 的实现只校验 `{light, dark}` 成对，**不校验名字**。
> 生态项目 `dsh-client-ui-theme-pack` 直接覆盖 **129 个 `--dsw-*`**（117 alias + 11 specific），
> 说明"能覆盖"的集合远大于"被列举"的集合。
> → 见 ADR `D21`；P1 开工第一件事是写探针验证非白名单变量（如 `--dsw-specific-sidebar-fill`）
> 是否真的被界面消费，再把结论写进 `DESIGN.md`。
- 补充实测：`validateOverrides` **不校验 token 名是否在白名单内**（写别的名字也接受，只是没有元素消费它）。
  仍按 `D17` 纪律：只用这 14 个，其余走 `--bj-*`。
- 另有 124 个 `--dsw-alias-*` CSS 变量在主题产物中存在（可被 C 层选择器读/改），
  **但它们不是 token 接口的一部分**，不写进 `overrideTokens`。

---

## 4. 该版本官方插件契约（写 P0 的直接依据）【引用：随包 `cordis-plugin-development` 技能 + `host-plugin.md` / `ui-plugin.md`】

### 4.1 包骨架（bundle）

```
package.json          # dsh.bundle.patch + 导出 + files
cordis.patch.yml      # - insert: [{ id, name, config? }]
index.js              # host 半边
client.js             # browser 半边（可选）
locale/en.json …      # meta.title / meta.description（Plugin Manager 读）
icon.svg              # 插件图标
```

`package.json` 关键字段（官方模板原文）：

```json
{
  "type": "module",
  "exports": { ".": "./index.js", "./client": "./client.js",
               "./locale/*.json": "./locale/*.json", "./icon": "./icon.svg" },
  "files": ["index.js", "client.js", "cordis.patch.yml", "locale/*.json", "icon.svg"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "platform": "web", "immediately": true, "inject": ["@deepseek-ai/dsh-client-ui-conversation"] }
  }
}
```

- Host 半边：`export function apply(ctx, config) {}`，可选 `export const inject = [...]` / `export const Config`。
- Client 半边：`window.__ModuleLoader__.load({ id: '<包名>', factory(require) { … } })`，
  在 `apply(ctx)` 里用 `ctx.slots.inject(...)` + `ctx.slots.register({ name, id, order }, Component)` 注册。
- **所有副作用必须建在 `ctx.effect` / `ctx.on` 里并返回清理函数**。
- 图标：SVG/PNG/JPEG/WebP，≤256 KiB，不得越出包目录。

### 4.2 安装方式（与旧文档不同）

| 旧文档假设 | 本版本正解 |
|---|---|
| 手改 profile 的 `package.json` / `cordis.patch.yml`，或 `dsh plugin add` | **`plugin_manager install_bundle`**（`target` = 包的绝对目录），由它做安装与 bundle 选择 |
| 首版靠 `--dump-config` 看层 | 安装结果看返回的 `application` / `warnings`；确认行用 `cordis_inspect_query` |

> ⚠️ `install_bundle` 作用于**当前 profile**。本机当前是 `desktop`（用户生产环境），
> 与红线 **R2** 冲突 → **P0 必须先建 `web` profile 再装**。
> `dsh web`（= `dsh --profile web`）会从出厂模板初始化该 profile；首次创建需要写
> `C:\DSH\.dsh\profiles\web`，**当前会话沙箱是 workspace-write，会 EPERM**，需一次批准。

### 4.3 配置持久化（影响 B8）

官方明确：**插件不得自己读改写 profile 的 `cordis.patch.yml`**；
要改自己的配置走 `configEditor`：

```js
const entry = ctx.fiber.entry
const editor = ctx.get('configEditor')
await editor.edit(entry, current => ({ ...current, field: value }))
```

- `.volatile()` 字段原地更新，其余字段改动会**重启插件**。
- 密钥类走 `ctx.credentials.modifyRecord()`，**不进配置**。
- → 本项目 `sdt.config.json`（`D8`/`B8`）仍然成立：它是**用户外观配置**，
  不是插件行配置；但**不要**去写 profile patch，也不要和 `configEditor` 抢同一个文件。

---

## 5. 由此产生的 P0 具体落地形态（替代 `TODO.md` 里的泛化描述）

| 任务 | 本版本落地 |
|---|---|
| T0.1 | `dsh --profile web --dump-config`（首次创建 profile，需批准）→ 再 `dsh web --port 0` 起隔离实例 |
| T0.2 | 骨架按 §4.1 生成，包名 `dsh-sdt`，`dsh.bundle.patch` 指向 `cordis.patch.yml` |
| T0.3 | host `apply` 内 `ctx.webServer.register({kind:'prefix', path:'/sdt', handler})`，首行 `ctx.connection.requestRejection(req)` |
| T0.3b | 4 个安全用例：`..` 穿越 / 非法扩展名 / 超大文件 / 跨源 |
| T0.3c | `peerDependencies["@deepseek-ai/dsh"]` = `>=0.2.0-rc.2 <0.3.0-0`（本机 `0.2.2-rc.1` 落在区间内）；`dsh.client.inject` 起步空数组 |
| T0.4 | `plugin_manager install_bundle` 装到 **web** profile，读 `application: applied` |
| T0.5–T0.8 | 配置读取/校验/深合并/素材逐项覆盖，纯 Node ESM，**不引第三方依赖**（JSON 无需 yaml 包） |
| T0.9 | `GET /sdt/config.json` 给 client 读 |

---

## 7. 隔离实例实测（P0 T0.1 已通过）【实测】

```powershell
dsh --profile web --dump-config          # 首次创建 profile（出厂模板 = dsh-base + dsh-web-app）
dsh --profile web --no-open --port 18950 # 起隔离实例
```

| 验收点 | 结果 |
|---|---|
| profile 创建 | ✅ `C:\DSH\.dsh\profiles\web`（`package.json` / `cordis.yml` / `cordis.patch.yml` 全为出厂内容） |
| 端口监听 | ✅ `127.0.0.1:18950` |
| 无 token 访问 `/` | ✅ **401**（Host/Origin 栅栏生效，与旧文档 §5.3 一致） |
| 带 token + cookie 跳转 | ✅ `303 → 200`，index **40038 字节** |
| `__DSH_BOOT__` 引导表 | ✅ 存在，`rev=fd80fb5ff416`，`release=0.2.2-rc.1` `commit=c59d10a` |

### 7.1 引导表结构（写 client 模块的直接依据）【实测：抓取 index 里的 `__DSH_BOOT__`】

```
{ rev, release: {version, commit}, entries: [ …73 条… ], batches: [ …3 批… ] }
```

单条 entry 的形状：

```json
{ "id": "@deepseek-ai/dsh-client-ui-theme",
  "url": "plugins/??@deepseek-ai/dsh-client-ui-theme/client.js&rev=482e4c2d5db5",
  "rev": "482e4c2d5db5",
  "inject": ["@deepseek-ai/dsh-client-modules", "…"],
  "immediately": true }
```

| 事实 | 含义 |
|---|---|
| `entries[].id` = 包名 | `dsh.client.inject` 里填的是**包名**，与 §3.1 的结论吻合 |
| `batches` 分 `bootstrap` / `application` | client 插件默认进 `application` 批 |
| 73 条 entry 就是当前**全部客户端模块** | 想用 `theme` 服务 → `inject: ["@deepseek-ai/dsh-client-ui-theme"]`；想用 `slots` → 观察 `dsh-client-locale`/`ui-layout` 那条的 inject |
| 完整引导表已存档 | `tools/_dsh_boot_payload.json`（本地参考，已被 git 排除） |

> **未确认**：第三方 bundle 的 `client.js` 如何映射进 `plugins/??…` 路由（由 `install_bundle` 生成），
> 需装一次自己的插件再抓一次引导表比对。

---

## 8. 下一步（本机可直接执行的顺序）

1. **P0 T0.2** 生成 bundle 骨架（§4.1 形状），包名 `dsh-sdt`，locale 出 `en` + `zh`，自带 icon。
2. **P0 T0.3** host `apply`：素材路由 `kind:'prefix'` + `requestRejection` 首行；4 个安全用例。
3. **P0 T0.5–T0.9** 配置系统（JSON，零依赖）+ `/sdt/config.json`。
4. **P0 T0.4** `plugin_manager install_bundle`（目标 = 包绝对目录）装进 `web` profile，读 `application` 字段。
5. 装完再抓一次引导表，确认本插件 client 那一行的 `id/url/inject`——这是 §7 的未确认项。

**需要用户给的只有两件**（可先做占位再替换）：

- **B2** 主色 / 强调色（给两个 hex 即可，不给就先按中性深色占位）
- **B1** 品牌素材目录（logo / 字体 / 纹理，不给则先用内置占位素材把链路跑通）

---

## 9. 待确认 / 未确认

| # | 项 | 状态 |
|---|---|---|
| 1 | `plugin_manager install_bundle` 在 `web` profile（非当前 profile）能否直装 | **未确认**，需实测；若不能，退回 `dsh plugin --profile web add <绝对目录>` |
| 2 | client 模块拿 `theme` 服务的注入名（`inject: ['theme']`？） | **未确认**，需 `Slots`/`Service` 查询或模板实证 |
| 3 | `shell.overlay` 的 slot 注册选项（`kind:'list'` 是否仍存在） | **未确认**，需 `cordis_inspect_query` `Slots.listSubTree` |
| 4 | 官方 locale/icon 校验是否会因缺 `zh.json` 报诊断 | **未确认** |
| 5 | `skills.registerProvider` 的 provider 契约细节 | **未确认**，读 `dsh-client-ui-skill` / host skills README 后再定 |