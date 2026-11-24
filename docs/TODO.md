# TODO.md —— 任务、优先级与开发进度

> **本文件只负责三件事：任务状态、backlog、ADR（决策记录）。**
> 现状 / 环境 / 已知坑在 [`HANDOFF.md`](../HANDOFF.md)；版本与变更在 [`VERSION`](../VERSION) + [`CHANGELOG.md`](../CHANGELOG.md)。
>
> 最后更新：**2026-11-23 · v1.5 文档基线校正**（上一版停留在「代码 0 行」，已作废）

---

## 🎯 当前进度（v1.5）

```
[■■■■■■■■■■] 调研 / 计划        ✅ v1.0
[■■■■■■■■■■] P0 骨架+配置+路由   ✅ v1.1
[■■■■■■■■■■] P1 A层 token        ✅ v1.3（133/133）
[■■■■■■■■■■] P4 部分 L2 语法     ✅ v1.3（G2/G6）
[■■■■■■■■■■] 配色定版            ✅ v1.4（蓝青）
[■■■■■■■■■■] 稳定化 + 转手        ✅ v1.5
[■■■■■■■■■■] L3 间距 + M4 只读卡  ✅ v1.6（M5 负结论，降级）
[■■■■■■■■■■] 控制台 + 占位矩阵    ✅ v1.7
[■■■■■■■■■■] M2 dock + M1 骨架    ✅ v1.8（桌面端已安装验证）
[■■■■■■■■■■] 阶段审查 + 首帧结论  ✅ v1.8 补丁（index-inject 桌面生效）
[■■■■■■■■■■] 开屏视频 + 点击特效  ✅ v1.9（M9 首版 + M1b + 控制台入口）
[          ] 材质/皮肤/安全 + 回归  ⬜ v2.0（首发）
[          ] P3 氛围             🟡 仅底纹/发丝线
[          ] P4 余下（圆角/阴影/区块几何）⬜ 未开始
[          ] P5 对话动画         ⬜ 被 B3/B4 阻塞
```

**版本基线**：`v1.9`（`VERSION` / `CHANGELOG.md`；规则 `vX.Y` 逢 10 进 1，禁止三段版本号，见 D22）。

**下一件该做的事**：v2.0 = M6/M7/M8 + 回归 + 发布清单（首发）。

---

## ✅ 已完成（有实测证据）

| 能力 | 版本 | 证据 |
|---|---|---|
| bundle 安装与挂载 | v1.1 | `--dump-config` 出现 `# == dsh-sdt`；`web` profile bundles 含 `dsh-sdt` |
| `/sdt/health` `/config.json` `/asset/*` | v1.1 | 200 / 200 / 200；SVG 带 CSP |
| 四道安全闸 | v1.1–v1.5 | 401 / 404（穿越）/ 404（`.exe`）/ 403（跨源）/ 405（POST） |
| L1 133/133 token | v1.3 | `__sdtDebug = { mapped: 133, total: 133, skipped: [] }` |
| 品牌字标（M3） | v1.3 | `sidebar.brand.mark` 注册自绘 SVG |
| 深色切换 | v1.3 | 必须走 `theme.setTheme(mode)`；inline 会被宿主 publish 覆盖 |
| 配置校验 | v1.1–v1.5 | 非法 token 值被丢弃并给 warning；JSON 错带行列号 |
| 蓝青定版 | v1.4 | 截图 `docs/preview/theme-{light,dark}.png` |
| 6 个 bug 修复 | v1.5 | 打包漏 assets / HEAD 语义 / SVG CSP / 补扫覆盖配色 / `ctx.get` 未防护 / token 注入防护 |
| 自验证 | 每版 | `scripts/release_check.py` **8/8**（v1.5 起含 client 版本一致性） |

**尚未做**：桌面端安装与首帧实测、L3 密度、M5 图标、M4 设置卡、M1/M2 覆盖层、
M9 开屏、M6 壁纸/玻璃、M7 皮肤中心、M8 安全模式、P5 对话动画、P6 回归。

---

## 🚧 阻塞项（需要人类输入）

| # | 阻塞项 | 影响 | 状态 |
|---|---|---|---|
| B1 | 品牌素材（字体 woff2 / 纹理 / logo 成品） | P3、P4 | 🟡 字标已自绘；美术按 D26 走用户目录 |
| ~~B2~~ | ~~视觉定位~~ | P1–P4 | ✅ 深海军蓝 + 青蓝（v1.4） |
| B3 | 第二个参考项目名称 | P5 | ⏳ 待提供（不阻塞 v1.9） |
| B4 | 对话动画路线（轻量 `data-*` / 重度 `conversation.chat.node`） | P5 | ⏳ 待决策 |
| ~~B8~~ | ~~配置格式~~ | P0 | ✅ JSON `sdt.config.json` |
| ~~B9~~ | ~~目录定名~~ | P0 | ✅ `$DSH_HOME/sdt/` |
| ~~B12~~ | ~~桌面端安装授权~~ | P7 | ✅ 已完成（v1.8，桌面端已装并验证） |
| ~~B13~~ | ~~许可~~ | 全程 | ✅ 代码 MIT；第三方美术不入库（D26） |

---

## ✅ v1.6 已交付（2026-11-24）

### A. 基线一致性（0.5 天，无新功能）

- [x] **T6.0a** `TODO.md` 重写为 v1.5 现状（本文件）
- [x] **T6.0b** `AGENTS.md` 环境表、阅读顺序、R9、阻塞项校正
- [x] **T6.0c** `ROADMAP.md` / `PLAN` 版本表去重与顺延对齐
- [x] **T6.0d** `DESIGN.md` token 总量、已定色值、选择器文件路径校正
- [x] **T6.0e** `client.js` 版本常量 `1.3 → 1.5`；`plugin/package.json` license → MIT
- [x] **T6.0f** 新增 `LICENSE`（MIT）+ README 许可与素材政策
- [x] **T6.0g** 版本号单一来源检查：`release_check.py` 比对 `client.js` 的 `VERSION` 与 `VERSION` 文件（8/8）

### B. L3 密度 + M5 图标 + M4 只读设置卡（2 天）

- [x] **T6.1** `--dsh-*`（字号/行高/间距）梳理：当前视图实测 **49 个**（旧文档「88」无实测依据），
      归属表见 [`DENSITY.md`](./DENSITY.md) —— 字号归宿主、侧栏密度在哈希类、仅会话容器可稳定覆盖
- [x] **T6.2** 间距/几何落地：`--dsh-composer-side-clearance` 16→20、卡片最大宽 +32→+48；
      944 / 980 / 1423 三视口无横向溢出（980 下侧栏自动折叠，输入卡完整）
- [x] **T6.3** M5 图标：**负结论** —— `ctx.theme` 13 个方法无 icon 接口，官方无接缝；
      降级为「只装饰自有元素」，不碰宿主图标（D30）
- [x] **T6.4** M4 只读卡：落 `settings.general.item`（`settings.section` 实测是内容容器，注册不显示）；
      显示版本 / token 133·133 / 配置来源 / 目录，已实测渲染
- [ ] **T6.5** 明暗两套对比度自检（正文 ≥4.5:1），结果写 `DESIGN.md`

## ✅ v1.7 已交付（2026-11-24）

- [x] **T8.0** `/sdt/console` 控制台：KPI / 色板 / 13 卡功能矩阵 / 路线图 / 阻塞 / 自检；
      明暗预览、`?mode=dark`、980 无溢出；未鉴权 401
- [x] **T8.0b** `/sdt/features.json` 单一功能清单；`/sdt/health` 增加 `version`
- [x] **T8.0c** 内置 logo 换成蓝青菱形 + SDT（替换 v1.0 遗留占位图）
- [x] **T8.0d** `package.json` 的 `files` 补 `console.html` / `features.json`

## ✅ v1.8 已交付（2026-11-24）

- [x] **T9.2** M2 `conversation.input.dock` 氛围条：16px、点击穿透、卡片上方 8px
- [x] **T9.1** M1 `shell.overlay` 骨架：配置 `appearance.overlay`（默认 false），开启后四角标 + HUD，无交互
- [x] **T7.1** 注册进 `desktop` profile（dependencies + bundles），pnpm link 安装，冷启动生效
- [x] **T7.3** 桌面实测写入 `MODULARITY.md` §6：133/133、字标、dock、无溢出
- [x] 字标修复：single slot 改用 `priority: -10`（D32），并替换 `sidebar.brand.name`

## ✅ v1.9 已交付（2026-11-24）

- [x] **T10.1** 桌面首帧：`webserver/index-inject` **已验证生效**
      （`__sdtFirstFrame` / `data-sdt-first` / `--sdt-first-frame` 均存在；DSH 仍 0.2.2-rc.1）
- [x] **T10.2** M9 开屏（首版）：`motion.splash.video` 视频 / 纯 CSS 双模式；host 首帧注入；
      播完 / 到点 / 点击 / 键盘 / 失败均淡出移除；reduced-motion 跳过；`oncePerSession` 生效
- [x] **T9.3** M1b 点击特效：canvas 菱形爆发移植，260ms 43k 亮像素 / 900ms 清零，配置可关
- [x] **T11.1** 控制台入口：侧栏按钮（`window.open`，被拦复制）+ 设置卡「控制台」行
- [x] **T11.2** 插件图标重绘：金色菱形格矢量（`fgo.png` 作参考，位图不入库）

## 🚧 v2.0 进行中（首发候选）

- [x] **T12.0** 点击特效尺寸可调：`motion.click.scale`（0.5–3，默认 1）；
      非法值告警回落 1；`window.__sdtFx.preview()` 确定性静帧（rAF 节流环境可验证/可预览）
- [x] **T10.2b** 开屏打磨：CSS 两段式（文字先淡→底幕后淡）+ 三路退出看门狗
      （boot 卡消失 / 350ms 内未出现即快速启动 / 绝对时长）；视频版两段式退场

## 📋 下一步（v2.0 剩余）

- [x] **T10.3** M6 壁纸/玻璃：图片 + **视频壁纸**（固定层 + 全屏容器清底 + 主区文字投影）；
      玻璃 color-mix + backdrop-filter；桌面端真机验收（截图 v20-chaldeas.png）
- [x] **T12.3** M12 英雄区：标题改「迦勒底亚斯」+ 鲸鱼换 FGO 图标（heroTitle / heroMark）
- [x] **T12.4** 菜单移入侧栏列表（sidebar.panellist），左下角不再放按钮
- [x] **T10.4a** M7 皮肤中心：`skins/<id>.json` + 宿主机合并 + 列表；
      **面板内一键切换**（POST /sdt/skin 原子写配置）；坏包回退并告警
- [x] **T12.2** M11 应用内面板：侧栏按钮 → 抽屉（功能矩阵 / 皮肤 / 状态），Esc/遮罩关闭
- [x] **T10.4b** M8 安全模式：设置卡「进入安全模式」/ 控制台「退出」+
      `sdt/disabled` 标记 + 首帧注入 `__sdtSafeMode`；坏 JSON 自动回退默认并带行列号
- [~] **T10.5** 回归：深/浅色 ✅、980×640 无溢出 ✅、reduced-motion ✅、安全模式进出 ✅；
      卸载残留与长会话性能未测
- [ ] **T12.1** 发布清单：双语 README、演示 GIF、`private:false`、市场元数据

## 🔧 v1.8 阶段审查（2026-11-24，post-tag）

- [x] 配置颜色进入装饰层（红 #b23a3a 实测三处同步）
- [x] `__sdtDebug.skipped` 类型统一
- [x] 控制台桌面 KPI 读 features、按钮键盘可达
- [x] 控制台 CSP `frame-ancestors 'none'`
- [x] 素材符号链接逃逸校验
- [x] 阴影取色改用 `inkLight`
- [x] 首帧探针（仅 `style` + `script`，符合白名单）

---

## 📦 后续阶段（按版本顺延）

### P2 — 开屏动画（v1.9 首版 ✅，v2.0 打磨）⚠️ 最容易做错

- [x] **T2.1** host 首帧注入：`ctx.on('webserver/index-inject')` 只推 `style`/`script`；
      **桌面端已验证生效**（`__sdtFirstFrame`）
- [~] **T2.2** 看门狗：现为「绝对超时」一条路径；卡片消失 / spinner 两条待补（v2.0）
- [~] **T2.3** 正片：现为 head 脚本自建 `#sdt-splash`（非 `shell.overlay`）；够用但与方案书不同，v2.0 评估是否迁移
- [x] **T2.4** 开屏本体：视频（`motion.splash.video`）+ 纯 CSS 两模式
- [ ] **T2.5** 退场两段式（内容淡出 → 延迟 → 底幕淡出）→ v2.0
- [x] **T2.6** 刷新去重（`sessionStorage`，`oncePerSession` 可关）
- [x] **T2.7** `prefers-reduced-motion` 直接跳过 + 可跳过（点击/键盘，`skippable` 可关）
- [x] **T2.8** 配置驱动：`motion.splash.*` 全部生效（enabled/duration/skippable/oncePerSession/video）

### P3 — 氛围与素材（v2.0）

- [x] **T3.1** 背景氛围层（G6 菱格底纹，深色，v1.3 落地）
- [x] **T3.2** 装饰元素（G2 侧栏发丝线 / 会话头下边框，v1.3）
- [ ] **T3.3** 常驻循环动画（扫描线/呼吸/漂移；注意性能与 reduced-motion）
- [ ] **T3.4** 配置驱动：`motion.ambience.*`
- [ ] **T3.5** 素材回退链验证：删任一素材不崩、回退内置

### P3.5 — 框架化收尾（v2.0 首发）

- [ ] **T3.5.1** 槽位规格定稿 → 机器可读 JSON（`plugin/lib/slots.js`，ADR D20）
- [ ] **T3.5.2** `doctor` 校验器：存在性 / 格式 / 尺寸 / 体积 / 配置语法 / 语义 +
      「inbox 里未被匹配的文件」检测
- [ ] **T3.5.3** Agent 适配 Skill 随插件分发（`ctx.skills.registerProvider`）
- [ ] **T3.5.4** `overrides.css` 逃生舱
- [ ] **T3.5.5** 示例素材包（`examples/`）
- [ ] **T3.5.6** 用户文档改写为「丢进 inbox → 让 Agent 配」
- [ ] **T3.5.7** 配置错误的人话报错验证
- [ ] **T3.5.8** 幂等与回滚验证

### P4 — C 层视觉语言（v1.6 起，分批）

- [ ] **T4.1** 圆角与 `corner-shape`（配对规则见 `DESIGN.md` §3.1）
- [ ] **T4.2** 阴影与抬升（禁止用 border 配 elevation）
- [ ] **T4.3** 侧栏 / 会话列 / 输入卡几何与材质（优先二级 `data-slot`）
- [ ] **T4.4** 三级选择器收容：现状在 `client.js` 的 `buildCss()` 内联；拆分独立文件时
      必须写「验证版本」头注释

### P5 — 对话动画（被 B3/B4 阻塞）

- [ ] **T5.1** 路线决策（轻量 / 重度）
- [ ] **T5.2** 助手消息入场
- [ ] **T5.3** 流式输出节奏
- [ ] **T5.4** 工具卡展开/收起缓动
- [ ] **T5.5** 与官方滚动跟随管线共存（follow ledger 的 `gap>25px` 误判、rAF 打 `translateY` 抵消）
- [ ] **T5.6** 配置驱动 `motion.conversation.*`

### P6 — 回归（v2.0）

- [ ] 明 / 暗 / 跟随系统三模式
- [ ] 窄窗 980×640 不遮挡输入与侧栏
- [ ] 刷新不重复注入 `<link>`、不双开屏
- [ ] 卸载后完全恢复原生，无 404 素材请求
- [ ] `prefers-reduced-motion` 下无动画
- [ ] 长会话 / 多 turn 滚动性能

> P7（桌面端）已在 v1.8 完成安装与首验；首帧结论已在 v1.9 完成（T10.1）。

---

## 📝 决策记录（ADR）

| # | 决策 | 理由 | 状态 |
|---|---|---|---|
| D1 | 主骨架用 `dsh-550c-boot`（MIT）而非 `dsh-endfield-ui` | 后者 license 为 `null`；550c-boot 是唯一解决 271ms 时序问题的项目 | ✅ |
| D2 | 不依赖 `better-sidebar` / `shikitor` | 参考项目明确警告禁止单独 add（双挂载） | ✅ |
| D3 | 开发在 `web` profile，不在 `desktop` | desktop 被 Electron 独占，且是用户生产环境 | ✅ |
| D4 | 首帧注入用 `webserver/index-inject`，不用 `tapIndex` | 桌面端走 `dsh-app://` 不调 `renderIndex`，是死代码 | ✅ |
| D5 | 动效自带 `--bj-*` 变量 | 官方无动效 token（实测空集） | ✅ |
| D6 | 对话动画路线 | 待 B4 | ⏳ |
| D7 | 定位为「默认主题 + 素材与配置驱动框架」 | 引擎/内容分离，升级不覆盖用户内容 | ✅ |
| D8 | 用户目录 `$DSH_HOME/sdt/` | 已实测无冲突，命名空间独立 | ✅ |
| D9 | 素材逐项同名覆盖而非整目录替换 | 只放想改的文件，其余回退内置 | ✅ |
| D10 | 引入安全模式（Safe Mode） | DSH 迭代极快，宁可少效果不能不可用 | ✅ |
| D11 | 插件版本与 DSH 版本解耦 | 只声明验证过的版本 | ✅ |
| D12 | 子包依赖显式指定版本 | 所有子包 `latest` 停在 `0.0.1-rc.1` | ✅ |
| D13 | 兼容范围只写 `peerDependencies["@deepseek-ai/dsh"]` | 宿主不读自定义字段 | ✅ |
| D14 | `dsh.client.inject` 不新增服务依赖 | 生态「面板静默消失」根因；现有 `['theme','slots']` 已含降级 | ✅ |
| D15 | 只用 4 条最窄接缝 | 189 张升级卡中这 4 条零改名 | ✅ |
| D16 | 不碰官方 settings 通道，配置走自有文件 | 官方 settings API 换过代 | ✅ |
| D17 | token 接口只保证颜色 | 实测暴露项 `valueType` 全为 `"CSS color"` | ✅ |
| D18 | 适配 Skill 自动触发 | 用户要求；`description` 写列举式触发条件 | ✅ |
| D19 | 槽位清单 34 内容 / 13 样式 / 30 结构 | 用户要求全量列出 | ✅ |
| D20 | 槽位规格单一数据源 `plugin/lib/slots.js` | Agent / doctor / 文档共用 | ⏳ 文件尚未创建 |
| D21 | D17 修正：14 项只是 inspect 白名单，`overrideTokens` 实测可覆盖 133 项 | v1.3 `__sdtDebug` 证明 | ✅ |
| D22 | 版本 `vX.Y` 逢 10 进 1，真相源 `VERSION` | 用户要求 | ✅ |
| D23 | 项目更名 `DSH-SDT` / 灵衣缝制 | 生态 170 个外观项目中 FGO/衣柜叙事 0 个 | ✅ |
| D24 | 项目版本 `vX.Y` 与 manifest 三段 semver 分离 | npm/pnpm 强制三段 | ✅ |
| D25 | host 插件必须 `inject: ['webServer','connection']` | 未声明访问 `ctx.connection` 会抛错，宿主统一回 400 | ✅ |
| **D26** | **第三方美术（含 FGO）不入仓库、不入 npm 包，只走 `$DSH_HOME/sdt/assets/` 运行时加载** | 用户要求可使用 FGO 美术作二创；但 MIT 只能覆盖自有代码，无法覆盖第三方美术。运行时加载既满足自用，又让仓库保持可开源可分发 | ✅ |
| **D27** | **许可定为 MIT（仅代码）** | 用户指定；`LICENSE` 含第三方素材除外声明 | ✅ |
| **D28** | **文档真相源三层分离**：HANDOFF=现状 / TODO=任务+ADR / VERSION+CHANGELOG=版本 | v1.5 出现「TODO 说代码 0 行」的漂移，根因是单点真相源被绕过 | ✅ |
| **D29** | **字号交还宿主，插件不覆盖 `--dsh-content-font-size` / `--dsh-code-font-size`** | 实测宿主把它们**内联写在 `body`**，且对应设置页「字号大小」偏好；样式表覆盖会被内联压回，抢写还会与宿主 publish 打架 | ✅ |
| **D30** | **M5 不做官方图标替换，只装饰自有元素** | `ctx.theme` 原型 13 个方法无 icon 接口；图标无稳定 `data-*`，只剩哈希类/中文 aria（R6/R7 禁止） | ✅ |
| **D31** | **版本 = 树里实际存在的东西**：控制台这类独立增量单独发版，不发 WIP 版本号 | v1.6 标签已固定；把控制台挂在 v1.6 名下会造成「标签内容 ≠ 代码」；宁可整体顺延一位 | ✅ |
| **D32** | **single slot 用 `priority` 抢位，不用 `order`/`id`** | 桌面端实测：`sidebar.brand.mark` 官方默认标 priority 0，我们的 `order:20` 无效；`priority:-10` 才替换成功 | ✅ |

---

## 🔄 会话交接备忘

1. 读 `AGENTS.md`（契约 + 红线）→ `HANDOFF.md`（环境 + 现状 + 坑）→ 本文件（任务 + ADR）。
2. 从「下一步（v2.0）」的第一个未完成项继续；不要重读全部文档。
3. 完成后：勾任务 → 更新本文件进度 → 更新 `HANDOFF.md` §1/§5 → 写 `JOURNAL.md` → 打 `stage-NN-vX.Y`。
