# JOURNAL.md —— 工作日志

> 每次交付一条：做了什么、怎么验证的、能不能回滚到哪个标记。
> 阶段标记是**回滚点**，命名 `stage-NN-vX.Y`。

---

## 2026-11-23 · 方案评审 v2 · 未发版

- 补调研：开屏动画、宠物、Steam 壁纸（Wallpaper Engine）、点击特效四类，共 6 个代表项目（均 MIT/未声明）。
- 产出 `docs/PLAN-2026-11-23.md` v2：补全 10 类模块矩阵（M1 覆盖层 … M10 Skill）、
  从三张 FGO 截图提炼 7 条设计语法（G1 顶栏 / G2 金框 / G3 白玻璃 / G4 菱形图标 / G5 衬线副标 / G6 菱格底 / G7 长条按钮），
  并据此把默认视觉定为深色 + 金 + 白玻璃；截图本身**不入库**（版权属 TYPE-MOON）：能力分 5 层（L1 颜色 / L2 区块 / L3 密度 / L4 覆盖层 / L5 系统级）、复用清单、v1.3–v2.0 计划、明确不做项。
- 待决：桌面端安装授权；默认视觉方向。

---

## 2026-11-23 · 阶段 3 · v1.2 —— 默认主题成稿 + 模块化矩阵

**做了什么**

- 主题代码：`plugin/client.js` 由 6 个基准色派生 18 个 token（14 白名单 + 4 非白名单候选），
  并注入 `--bj-*`（圆角/阴影/强调色/字体栈）与 `--dsh-font-family-*`（衬线正文）。
- 配置：`colors` 改为 `brand/accent/bgLight/bgDark/inkLight/inkDark`；
  新增 `examples/sdt.config.json` 作为可复制的内容层样例。
- 文档：新增 `docs/MODULARITY.md`（能力矩阵 + 不可改红线 + 探针结论）、
  `docs/ROADMAP.md`（阶段/版本/验收/回滚）、`docs/JOURNAL.md`（本文件）、
  `research/RESOURCES-2026-11-23.md`（先调研：可复用参考）。README 重写为官方术语简报。
- 退役：`research/ASSETS-2026-11-23.md`（FGO 素材清单）—— 方向错误，已删除，理由见下。

**验证（实测）**

| 项 | 结果 |
|---|---|
| 插件装进 `web` profile | ✅ `--dump-config` 见 `# == dsh-sdt` |
| `/sdt/config.json` | ✅ 200，读到 `source: file`、`tokens: 18`、`warnings: []` |
| 素材路由 | ✅ `logo.svg` 200；穿越 404；`.exe` 404；跨源 403；`POST` 405；未鉴权 401 |
| 浏览器：浅色 | ✅ 背景 `#f7f3ea`、金主按钮 `rgb(200,162,74)`、衬线正文 → `docs/preview/theme-light.png` |
| 浏览器：深色预览 | ✅ 背景 `#0d1117`、品牌 `#cfad60` → `docs/preview/theme-dark.png`（**算法值直应用，非偏好切换**） |
| 非白名单探针 | ✅ `button-primary-fill` 被消费者使用；`bg-layer-3` 写入但无消费点 |
| 自验证脚本 | ✅ `scripts/release_check.py` 7/7 |

**已知缺口**

- 发送/图标按钮的填充色未纳入（读的是别的变量，待 v1.3 定位）。
- 深色需界面偏好切「深色」；截图是算法预览。
- 布局不可换 —— 这是结论，不是缺口。

**运维**

- dev 实例：`dsh --profile web --no-open --port 18981`，token 见交付报告；`desktop` profile 全程未动。
- 退役原因：素材方向把"名字趣味"当成了产品概念，与项目目标（默认主题 + 模块化探测）不符。

**回滚点**：`stage-03-v1.2` → `git reset --hard stage-03-v1.2`

---

## 2026-11-23 · 阶段 2 · v1.1 —— 插件骨架

- bundle（`dsh.bundle.patch` + `dsh.client`）、host/client 半边、`/sdt/*` 路由、配置与素材解析。
- 关键坑：cordis 禁止访问未注入服务 → `ctx.connection` 抛错被宿主统一回 400；补 `inject: ['webServer','connection']`。
- 验收：401/200/404/403/405 全过；14 token 写入 `body`。
- 回滚点：`stage-02-v1.1`

---

## 2026-11-22 · 阶段 1 · v1.0 —— 合同与实测基线

- 四条接缝实测、14 token 白名单、插件契约（bundle/patch/host/client/locale/icon）、生态调研 170 项目。
- 建立版本规则（`vX.Y` 逢 10 进 1）、`VERSION`、`CHANGELOG`、自验证脚本。
- 回滚点：`stage-01-v1.0`