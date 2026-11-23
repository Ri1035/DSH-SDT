# HANDOFF.md —— 转手文档（当前状态 → 下一个 Agent / 人）

> **先读这三段就够开工**：§1 现状、§3 环境与命令、§6 已知坑。
> 其余按需查。最后更新：2026-11-23，**v1.5（含文档基线校正）**。

---

## 1. 一句话现状

DSH 主题插件 **DSH-SDT** 已可安装运行：bundle + host/client 两边、`/sdt/*` 三路由、
配置系统、**133/133 个 `--dsw-*` token 全覆盖**、自绘品牌字标、蓝青配色、
L3 间距/几何、设置页只读卡、控制台 `/sdt/console`、M2 输入 dock、M1 覆盖层骨架 + **点击特效**、视频开屏。
**`web` 与 `desktop` 均已安装验证**；桌面首帧 `index-inject` **已验证生效**（v1.9 开屏可走 host 首帧）。

文档基线已于 2026-11-23 校正，v1.6 起 `docs/DENSITY.md` 记录 `--dsh-*` 归属与 M5 负结论；
许可定为 MIT（仅代码），第三方美术不入库（ADR D26）。

| 项 | 值 |
|---|---|
| 版本 | `v1.9`（`VERSION` / manifest `1.9.0`） |
| 阶段标记 | `stage-10-v1.9`（另有 `stage-01-v1.0` … `stage-09-v1.8`） |
| 仓库 | `https://github.com/Ri1035/DSH-SDT`（public） |
| 本地工作区 | `C:\Users\KOKA\Desktop\FGO` |
| 代码量 | `plugin/` 约 960 行（JS + JSON + SVG） |
| 自验证 | `scripts/release_check.py` **8/8**（v1.5 起新增 client 版本一致性检查） |

---

## 2. 这个项目到底要做什么

1. **交付物**：一套「装上就好看」的 DSH 默认主题（**用户主力是桌面端**）。
2. **附带产出**：把 DSH 能改/不能改写成矩阵 → [`docs/MODULARITY.md`](./docs/MODULARITY.md)。
3. **不是**：素材包、wiki 克隆、灵衣玩法（"灵衣缝制"只是命名趣味，**不作产品术语**）。
4. **变现方向**：开屏 / 点击特效 / 壁纸 / 宠物都做"模块"，不重造生态头部产品。

---

## 3. 环境与必跑命令

### 3.1 路径事实（本机，均已实测）

| 用途 | 路径 |
|---|---|
| DSH 安装目录 | `C:\DSH`（`DeepSeek Harness.exe`） |
| DSH 包内容 | `C:\DSH\resources\app.asar`（203 MB，**只读归档**） |
| `$DSH_HOME` | `C:\DSH\.dsh` |
| 当前 profile | `desktop`（Electron 独占；**已装 dsh-sdt**，改代码后需重启应用）；`web`（开发沙盒，`dsh-sdt` 以 `link:` 指向本仓库 `plugin/`，改码即生效，刷新页面重载） |
| 内置 Node / pnpm | `C:\DSH\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe`（v24.21.0）/ 同目录 `pnpm\bin\pnpm.mjs` |
| dsh CLI | `C:\DSH\resources\runtime\cli\bin\dsh.cmd`（`0.2.2-rc.1`） |
| 用户配置 | `C:\DSH\.dsh\sdt\sdt.config.json` |
| 素材目录 | `C:\DSH\.dsh\sdt\assets\` |

### 3.2 三条命令（接手先跑）

```powershell
python scripts\release_check.py                                   # 期望 7/7
cd plugin; dsh plugin --profile web add "link:$PWD"               # 装/更新插件
dsh --profile web --no-open --port 18990                          # 起隔离实例，token 在输出第一行
```

验证路由（把 `$T` 换成 token）：

```powershell
curl.exe -sSL -c c.txt -b c.txt -o NUL "http://127.0.0.1:18990/?token=$T"   # 换 cookie
curl.exe -sS -c c.txt -b c.txt "http://127.0.0.1:18990/sdt/health"          # {"ok":true,...}
curl.exe -sS -o NUL -w "%{http_code}" "http://127.0.0.1:18990/sdt/health"   # 无 cookie → 401
curl.exe -sS -c c.txt -b c.txt -o NUL -w "%{http_code}" "http://127.0.0.1:18990/sdt/console"  # 200 text/html
```

> 控制台：浏览器打开 `http://127.0.0.1:<port>/sdt/console`（需先访问 `/?token=` 换 cookie），
> 加 `?mode=dark` 直接看深色。功能清单在 `plugin/features.json`，改功能只改这一份。

### 3.3 抓图（ego 抓不到时用这条）

```powershell
& msedge --headless=old --disable-gpu --hide-scrollbars --window-size=1423,900 `
  --timeout=14000 "--screenshot=docs\preview\theme-dark.png" "http://127.0.0.1:PORT/?token=$T"
```

### 3.4 桌面端启动（有坑）

```powershell
# 必须清掉 WorkBuddy 终端注入的变量，否则 Electron 以 Node 模式静默退出（exit 0、无窗口）
$env:ELECTRON_RUN_AS_NODE = $null
$env:NODE_OPTIONS = $null
$env:HTTPS_PROXY = $null; $env:https_proxy = $null
& "C:\DSH\DeepSeek Harness.exe"
```

- 到界面约 **20–30 秒**，期间 `HARNESS Loading plugins…` 属正常；页面重载也会卡这么久。
- 需要远程检查时加 `--remote-debugging-port=9222`，用 `tools/cdp_*.mjs` 读 `__sdtDebug` / 截图；检查完重启去掉端口。
- 桌面渲染源是 `dsh-app://app/`，但 `fetch('/sdt/config.json')` **相对路径可用**；
  绝对地址 `http://127.0.0.1:<port>/sdt/*` 会被 CORS/栅栏拒绝。

---

## 4. 代码地图

```
plugin/
├── package.json        dsh.bundle.patch + dsh.client(platform/immediately/inject) + files(含 assets)
├── cordis.patch.yml    insert: [{ id: sdt, name: dsh-sdt }]
├── index.js            host：/sdt 路由 + `webserver/index-inject`（首帧探针 + 视频开屏/CSS 开屏）
├── client.js           client：133 token 映射 + L2 CSS + 字标/名字 + dock/设置卡/控制台按钮 + 点击特效
├── lib/config.js       配置读取/深合并/逐字段校验（含 `motion.click`、`splash.video`）/mtime 缓存
├── lib/assets.js       白名单(含 mp4/webm)/穿越防护/4MB/用户目录→内置回退/符号链接校验
├── lib/routes.js       /health /config.json /features.json /console /asset/*；首行 requestRejection（fail-closed）
├── locale/{en,zh}.json meta.title / meta.description
├── icon.svg            插件图标（金色菱形格矢量）
├── console.html        控制台（/sdt/console，单页零构建）
├── features.json       功能矩阵单一数据源（控制台读取）
└── assets/logo.svg     内置素材（`files` 必须含 assets，否则打包丢失）
```

**数据流**：`sdt.config.json` → `createConfigStore`（mtime 缓存）→ `/sdt/config.json` → client 取配置
→ 语义族映射 → `theme.overrideTokens` → `body` 内联变量 → 组件消费。

---

## 5. 已完成 / 已知能力（都实测过）

| 能力 | 状态 | 证据 |
|---|---|---|
| bundle 安装与挂载 | ✅ | `--dump-config` 出现 `# == dsh-sdt` |
| 三路由 | ✅ | health 200 / config 200 / asset 200 |
| 鉴权与四道安全闸 | ✅ | 未鉴权 401、穿越 404、`.exe` 404、跨源 403、`POST` 405 |
| token 覆盖 | ✅ | `__sdtDebug = { mapped: 133, total: 133, skipped: [] }` |
| 品牌字标（M3） | ✅ | `sidebar.brand.mark` 注册自绘 SVG，侧栏显示「菱形 + SDT」 |
| 深色切换 | ✅ | 必须走 `theme.setTheme('dark')`；写 inline 会被宿主 publish 覆盖 |
| 配置校验 | ✅ | 非法 token 值被丢弃并给 warning（不拖垮整体） |
| L3 间距/几何 | ✅ | clearance 20px、卡片最大宽 +48px；944/980/1423 无溢出（`DENSITY.md`） |
| M4 只读信息卡 | ✅ | 设置 → 通用设置底部：版本 / token / 来源 / 目录 |
| M5 图标替换 | ❌ **负结论** | `ctx.theme` 13 个方法无 icon 接口；无稳定图标锚点 → 降级（D30） |
| 控制台（v1.7） | ✅ | `/sdt/console` 200；未鉴权 401；13 卡矩阵 / 明暗预览 / 自检全 200 |
| M2 输入 dock（v1.8） | ✅ | 桌面 / 宿主 web 均挂载，16px，点击穿透 |
| M1 覆盖层骨架（v1.8） | 🟡 | 配置 `appearance.overlay` 默认关；开启后四角标，`pointer-events:none` |
| 桌面端（v1.8） | ✅ 已安装 | 133/133、菱形字标 + `DSH-SDT`、dock、**首帧注入已验证** |
| M1b 点击特效（v1.9） | ✅ | canvas 菱形爆发，260ms 43k 亮像素 / 900ms 清零；`motion.click.enabled` 可关 |
| 控制台入口（v1.9） | ✅ | 侧栏按钮 + 设置卡「控制台」行 |
| 插件图标（v1.9） | ✅ | 金色菱形格矢量；`fgo.png` 只作参考不入库 |

**已知未做**：L3 的侧栏密度与圆角体系（哈希类，无锚点）、覆盖层（M1/M2）、
开屏（M9）、壁纸/玻璃（M6）、皮肤中心（M7）、安全模式（M8）、对话动画、桌面端验证。

---

## 6. 已知坑（都是本机踩出来的，别再踩）

| # | 坑 | 事实 / 对策 |
|---|---|---|
| K1 | cordis 服务访问 | 未在 `inject` 声明就访问 `ctx.connection` 会**抛错**，而宿主把 handler 异常统一回 **400** → 症状是"所有路由 400" |
| K2 | 自定义路由无鉴权 | 必须首行 `ctx.connection.requestRejection(req)`，且异常时 fail-closed |
| K3 | 用户 SVG 可执行脚本 | 同源下必须给 SVG 响应加 CSP；已内置 |
| K4 | pnpm 版本格式 | manifest 必须三段 semver（`1.5.0`），项目版本仍是两段 `v1.5`（ADR D24） |
| K5 | 深色覆盖顺序 | `overrideTokens` 单值内联会被宿主 publish 覆盖；改偏好要用 `theme.setTheme` |
| K6 | 首轮变量扫描不全 | 样式表按需注入；必须「基线清单 + 延迟补扫」 |
| K7 | ego-browser 截图 | 在本机 DSH 页面 `Page.captureScreenshot` 会超时（无插件时同样），用 headless Edge + `--timeout` |
| K8 | 网络 | `hosts` 被 Steam++ 写死 `127.0.0.1`，schannel 不可用 → 推送走 Git Data API（`tools/gh_push.py`），拉取走 DoH |
| K9 | 打包漏文件 | `package.json` 的 `files` 漏了 `assets` 会把内置素材丢掉（本轮已修） |
| K10 | 双挂载 | client 用 `window.__dshSdtApplied` 挡住第二次；副作用是 HMR 重载不会重新应用，需刷新页面 |
| K11 | 桌面端静默退出 | `ELECTRON_RUN_AS_NODE=1` 或 `NODE_OPTIONS` 存在时，`DeepSeek Harness.exe` 以 Node 模式跑完即退（exit 0、无窗口）；启动前必须清掉 |
| K12 | 桌面端加载慢 | 冷启动与页面重载都可能 20–30 秒停在 `Loading plugins…`，不要误判为崩溃 |
| K13 | single slot 抢位 | 单槽位用 `priority`（越小越优先），`order`/`id` 只对 list slot 有效；官方字标 priority 0，替换用 -10 |

---

## 7. 本轮（v1.5）修掉的 bug

1. **打包漏 `assets/`** → 内置 `logo.svg` 发布后会 404。
2. **HEAD 仍走 body 分支** → 语义不符（Node 兜底掩盖了症状）。
3. **SVG 无 CSP** → 用户上传的 SVG 可在 DSH 源下执行脚本（同源 XSS）。
4. **延迟补扫用默认色重算** → 用户自定义配色会在 1.2s/3.2s 被默认值覆盖。
5. **`ctx.get('dshHome')` 未防护** → 未声明服务时可能抛错导致插件挂载失败。
6. **token 值无注入防护** → 配置里的任意字符串会直接写进 CSS 变量（已限制 `; { } < > url(`）。

---

## 8. 关于"直接改 DSH 本体"

**不建议**，理由是可验证的：

| 项 | 事实 |
|---|---|
| `app.asar` | 只读归档；改它等于改发行包，**每次更新覆盖**，且破坏签名校验 |
| 桌面端 | Electron 进程直接从归档加载，改完需重新打包；用户更新即回退 |
| 前端构建 | 类名是哈希（如 `.mP3x-q_frame`），随构建变化，硬改必碎 |
| 官方扩展位 | **插件 / bundle patch / profile `cordis.patch.yml` / `--patch` overlay** 四条都可用，不需要动归档 |

要做"更深"的定制，正确姿势是：**patch overlay**（`dsh --patch ./x.yml`）或
**profile 的 `cordis.patch.yml`** 覆盖行；要改 UI 结构则只能在 `shell.overlay` / slot 里加，不能重排布局。

---

## 9. 回滚与版本

| 标签 | 对应 |
|---|---|
| `stage-01-v1.0` | 契约基线（4 接缝 / 14 token / 插件契约） |
| `stage-02-v1.1` | 插件骨架（bundle / 路由 / 配置） |
| `stage-03-v1.2` | 默认主题首版 + 模块化矩阵 |
| `stage-04-v1.3` | L1 133/133 + L2 语法 + 字标 |
| `stage-05-v1.4` | 蓝青配色定版 |
| `stage-06-v1.5` | bug 修复 + 转手文档 |
| `stage-07-v1.6` | L3 间距 + M4 只读卡 + M5 负结论 |
| `stage-08-v1.7` | 控制台 + 功能矩阵 |
| **`stage-09-v1.8`** | **M2 dock + M1 覆盖层骨架 + 桌面端首验（当前）** |

```powershell
git reset --hard stage-05-v1.4      # 回退到配色定版
git log --oneline --decorate -10    # 看标签与提交
```

---

## 10. 下一步 backlog（按优先级）

> v1.8 已完成：M2 dock、M1 覆盖层骨架、桌面端安装，**首帧 `index-inject` 已验证生效**。
> 剩余项如下。

1. **开屏打磨**：两段式退场 + boot card 消失看门狗（现仅绝对时长）。
2. **M6 壁纸/玻璃**（默认关 + 性能降级）、**M7 皮肤中心**、**M8 安全模式**。
3. **M4 可交互**：改色 / 切主题。
4. **回归**：三模式 / 980×640 / 卸载残留 / reduced-motion / 长会话性能。
5. **发布清单**：双语 README、演示 GIF、`private:false`、市场元数据（v2.0 首发）。

---

## 11. 文档索引

| 文件 | 作用 |
|---|---|
| [`docs/MODULARITY.md`](./docs/MODULARITY.md) | 能力矩阵与不可改红线（核心结论） |
| [`docs/PLAN-2026-11-23.md`](./docs/PLAN-2026-11-23.md) | 方案书：L1–L5 分层、M1–M10 模块、复用清单 |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | 阶段/版本/验收/回滚规则 |
| [`docs/JOURNAL.md`](./docs/JOURNAL.md) | 每版工作日志（含坑与回滚点） |
| [`docs/TODO.md`](./docs/TODO.md) | 任务状态与 ADR |
| [`docs/compat-0.2.2-rc.1.md`](./docs/compat-0.2.2-rc.1.md) | 本机版本实测（接缝 / token / 契约 / 网络） |
| [`research/RESOURCES-2026-11-23.md`](./research/RESOURCES-2026-11-23.md) | 可复用参考与许可判据 |
| [`research/ECOSYSTEM-2026-11-22.md`](./research/ECOSYSTEM-2026-11-22.md) | 生态调研（170 项目） |

---

## 12. 红线（换人也不能破）

1. 不改 `app.asar` / DSH 安装目录。
2. 不在 `desktop` profile 做实验；要装先取得用户同意。
3. 凭据不落盘：token 只走单次进程环境变量。
4. **第三方美术（含 FGO）不入仓库、不入 npm 包**：只允许用户自放在 `$DSH_HOME/sdt/assets/` 运行时加载。
   MIT 只覆盖自有代码与自绘素材（ADR D26/D27）；把 FGO 素材提交进仓库会同时破坏许可一致性与 npm 分发合规性。
5. 不重定义 `--dsw-*` 语义（用 `overrideTokens` 覆盖值，不新增语义）；未暴露项走 `--bj-*`。
6. 每个版本必须：自验证 → 写 JOURNAL → 打 `stage-NN-vX.Y` → 推送。