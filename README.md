<p align="center">
  <img src="docs/assets/readme-hero.webp" width="360" alt="灵衣缝制：蕾丝、纽扣与成衣">
</p>
<h3 align="center">DSH-SDT ｜ 灵衣缝制</h3>
<p align="center">
  <sub>Deepseekharness-Spiritron Dress Tailoring</sub>
</p>
<p align="center">
  <img alt="version" src="https://img.shields.io/badge/version-v1.1-2ea44f?style=flat-square">
  <img alt="dsh" src="https://img.shields.io/badge/DSH-0.2.2--rc.1-1f6feb?style=flat-square">
  <img alt="license" src="https://img.shields.io/badge/license-pending-lightgrey?style=flat-square">
</p>
<p align="center"><i>默认即成品 · 素材可替换 · 缝制交给 Agent</i></p>

## 一览

| 项 | 内容 |
|---|---|
| 是什么 | 一个 **DeepSeek Harness 主题插件**（Cordis bundle），不改 DSH 安装包 |
| 为谁 | 想给 DSH 换一整套外观，但不想读选择器、不想手调色板的人 |
| 凭什么 | 只用官方接缝：theme token / 素材路由 / 首帧注入 / `shell.overlay` |
| 交付形态 | 一个插件包 + 一个随包分发的 Agent Skill + `$DSH_HOME/sdt/` 内容目录 |
| 现在 | **v1.1 插件骨架**：可装进 `web` profile，配置 / 素材路由 / 14 个 token 已实测生效 |

## 简介

DSH-SDT 把「外观」当成一件**可以整件替换的成品**，而不是一堆让人自己调的变量。
代码只负责渲染，外观全部落在 `$DSH_HOME/sdt/`：一份 JSON 配置加一组素材。
升级插件不会覆盖你的素材，换素材也不需要改代码。

素材怎么变成外观，交给随插件分发的 **Agent Skill**。把图片、字体、纹理丢进 `sdt/inbox/`，
对 Agent 说一句「用 inbox 里的素材缝一套灵衣」，配置与素材映射由它生成 ——
不需要知道槽位命名、文件格式或选择器层级。

## 设计原则

- **默认即成品**：装上就是完整一套外观；可定制是加分项，不是半成品的借口。
- **引擎与内容分离**：素材与配置在用户目录，升级不覆盖、卸载不删除。
- **单点失效不崩**：首帧注入失效退回纯 client 开屏；素材 404 回退内置；版本超范围由宿主跳过。

## 快速开始

```bash
# 开发态（隔离 profile，不要装在 desktop）
dsh plugin --profile web add link:<repo>/plugin

# 发布后
dsh plugin --profile web add dsh-sdt
```

| 步骤 | 做什么 |
|---|---|
| ① 装插件 | 默认灵衣直接生效，零配置 |
| ② 换素材 | 丢进 `$DSH_HOME/sdt/inbox/`，让 Agent 缝一套 |
| ③ 精调 | 改 `sdt.config.json`，或写 `overrides.css` |

> v1.0 只是契约基线，插件包尚未产出；以上命令为目标形态。

## 能力

| 能力 | 实现方式 | 版本 |
|---|---|---|
| 明暗双套配色 | `ctx.theme.overrideTokens(src, { light, dark })`，含对比度自检 | v1.2 |
| 素材路由 | host `webServer.register({ kind: 'prefix' })`：白名单 + 扩展名 + 体积 + 路径穿越防护 | v1.1 |
| 首帧接管 | `webserver/index-inject`（仅 `style` / `script`），规避 271 ms 开机卡片空窗 | v1.3 |
| 覆盖层与 HUD | client `shell.overlay` + `slots.register` | v1.3 / v1.4 |
| 配置系统 | `$DSH_HOME/sdt/sdt.config.json`：默认值深合并，错误带行列号 | v1.1 |
| Agent 适配 | Skill 随插件分发（`ctx.skills.registerProvider`），从 `inbox/` 生成配置 | v1.5 |
| CSS 逃生舱 | `$DSH_HOME/sdt/overrides.css`，优先级最高 | v1.5 |

## 架构

| 层 | 手段 | 官方支持 |
|---|---|---|
| **A** | theme token 覆盖：`--dsw-alias-*` / `--dsw-specific-*` | ✅ 完全官方 |
| **B** | 素材路由 + 首帧注入 + `shell.overlay` | ✅ 官方接缝 |
| **C** | 自有 CSS 覆盖既有组件外观，选择器分级并集中在 `overrides.tier3.css` | ⚠️ 未承诺，按版本验证 |

**四条硬约束**：不碰 `app.asar`；不在 `desktop` profile 做实验；素材路由必须自行调用
`ctx.connection.requestRejection(req)`；不重定义 `--dsw-*` token —— 圆角、阴影、字体、动效
走自有 `--bj-*` 变量。

<details>
<summary><b>版本规则与路线</b></summary>

| 规则 | 说明 |
|---|---|
| 格式 | `vX.Y` 两段，`Y ∈ 0–9` |
| 进位 | 逢 10 进 1：`v1.9 → v2.0`，不存在 `v1.10` |
| 禁止 | 三段及以上（`v1.0.0`）、两位小数（`v1.11` / `1.11.0`） |
| 真相源 | 根目录 `VERSION`；与 DSH 官方版本号完全解耦 |
| 发版判定 | 代码完成 → 自验证 → CHANGELOG → `VERSION` +0.1 → 推送 → 贴报告，缺一不进位 |

| 版本 | 内容 |
|---|---|
| v1.1 ✅ | 插件骨架 · 素材路由 · 配置系统 |
| v1.2 | 默认灵衣（token 全覆盖 + 对比度） |
| v1.3 | 开屏动画（首帧注入 + 看门狗 + 刷新去重） |
| v1.4 | 氛围层（材质 / HUD / 常驻动效） |
| v1.5 | 框架化（inbox 适配 · doctor 校验 · Skill 分发 · 逃生舱） |
| v1.6 | C 层视觉语言（圆角 / 阴影 / 几何） |
| v1.7 | 对话动画（入场 / 流式节奏 / 工具卡） |
| v1.8 | 回归与降级验证 |
| v1.9 | 发布准备（双语 / 演示 / 市场元数据） |
| v2.0 | 首次公开发布 |

</details>

<details>
<summary><b>自验证清单</b></summary>

1. `dsh --profile web --dump-config` 可见插件层
2. 卸载后界面恢复原生，控制台无 404 素材请求
3. 素材路由四用例：路径穿越 / 非法扩展名 / 超大文件 / 跨源请求
4. 明 / 暗 / 跟随系统：无白底白字，正文对比度 ≥ 4.5:1
5. 窄窗 `980×640` 不遮挡输入框与侧栏
6. `prefers-reduced-motion` 无动画；刷新不重复注入、不二次开屏
7. 仓库全文扫描无 token / 密钥字面量
8. 版本号格式校验（`scripts/release_check.py`）

</details>

## 参考项目

以下项目的**做法与结构**被本项目参考，代码均为自行实现。

| 项目 | 许可 | 取用 |
|---|---|---|
| [dsh-550c-boot](https://github.com/yannicksong0106/dsh-550c-boot) | MIT | 271 ms 时序量化、host + client 双半边、三条看门狗退出、Shadow DOM 隔离 —— 主骨架参考 |
| [dsh-startup-screen](https://github.com/6shenhonghong9/dsh-startup-screen) | MIT | 首帧注入 + 自定义路由 + 本地 JSON 配置的成品化做法 |
| [dsh-erii-boot-splash](https://github.com/yanglingrise/dsh-erii-boot-splash) | MIT | React 计时器 + CSS keyframes 的干净结构 |
| [dsh-splash-screen](https://github.com/52baihehhh-ai/dsh-splash-screen) | MIT | canvas 点阵式开屏 |
| [dsh-client-ui-theme-pack](https://github.com/rpglit/dsh-client-ui-theme-pack) | MIT | 129 项 `--dsw-*` 可覆盖清单的证据来源 |
| [dsh-bloom-theme](https://github.com/webkubor/dsh-bloom-theme) | MIT | OKLCH 调色与 WCAG AA 对比度求解 |
| [dsh-theme-endfield](https://github.com/ymh0000123/dsh-theme-endfield) | MIT | 整站风格 token 化与版本回落 |
| [dsh-catppuccin-theme](https://github.com/NoNameLeGo/dsh-catppuccin-theme) | MIT | 多主题切换与持久化 |
| [open-sea-skin](https://github.com/d-dev0101/open-sea-skin) | MIT | 动态背景与参数化 |
| [dsh-skin-market](https://github.com/kingOfSoySauce/dsh-skin-market) | MIT | 皮肤市场的组织与分发 |
| [dsh-web-scroll-flow](https://github.com/TYOPXN360/dsh-web-scroll-flow) | 未声明 | `data-*` + rAF 的对话动效（只读，不抄码） |
| [dsh-endfield-ui](https://github.com/rison114514/dsh-endfield-ui) | 未声明 | 纯 CSS 时间轴与选择器分级（只读，不抄码） |
| [DSH-Transparent-UI-Plugin](https://github.com/WYH66666666/DSH-Transparent-UI-Plugin) | AGPL-3.0 | 玻璃材质参数化思路（许可不允许并入） |
| [dsh-plugin-upgrade-skill](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill) | — | 189 张升级卡，用于判断接缝稳定性 |

## 文档

| 文件 | 作用 |
|---|---|
| [`VERSION`](./VERSION) ｜ [`CHANGELOG.md`](./CHANGELOG.md) | 版本真相源与变更记录 |
| [`AGENTS.md`](./AGENTS.md) ｜ [`HANDOFF.md`](./HANDOFF.md) | AI 协作入口 / 换设备交接 |
| [`docs/TODO.md`](./docs/TODO.md) | 进度、阻塞项、决策记录 |
| [`docs/compat-0.2.2-rc.1.md`](./docs/compat-0.2.2-rc.1.md) | 本机版本实测：接缝、token、插件契约 |
| [`docs/architecture.md`](./docs/architecture.md) | A/B/C 分层、271 ms 时序、数据流 |
| [`docs/asset-library.md`](./docs/asset-library.md) ｜ [`docs/DESIGN.md`](./docs/DESIGN.md) | 素材槽位规范 / 视觉规范 |
| [`research/ECOSYSTEM-2026-11-22.md`](./research/ECOSYSTEM-2026-11-22.md) | 生态调研：规模、头部项目、机制、空位 |
| [`scripts/release_check.py`](./scripts/release_check.py) | 每版自验证脚本 |

## 致谢与许可

- **DeepSeek Harness** —— 运行基座与 Cordis 插件体系（本机基线 `0.2.2-rc.1`）
- 《Fate/Grand Order》—— 名称与视觉意象出处
- 许可尚未选定，首次公开发布前补齐；在此之前代码可读可参考，不构成再分发授权。