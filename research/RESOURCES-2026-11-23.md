# 可复用资源与参考实现（2026-11-23）

> 规则：**先调研、再动手**。能复用方法就复用方法；能复用代码则必须看清许可。
> 本文只记"我们要借什么"，不搬运第三方源码。

---

## 1. 参考实现（按用途）

| 项目 | 许可 | 借什么 | 不借什么 |
|---|---|---|---|
| [dsh-theme-endfield](https://github.com/ymh0000123/dsh-theme-endfield) | MIT | bundle patch + `dsh.client` 三件套（platform/immediately/inject）、`theme.overrideTokens` 用法、`<style>` 注入、**双挂载幂等保护** | 它的视觉资产与文案 |
| [dsh-bloom-theme](https://github.com/webkubor/dsh-bloom-theme) | MIT | **OKLCH 调色 + WCAG AA 对比度求解**的方法；明暗双套的组织方式 | 15 套配色与玻璃拟态实现 |
| [dsh-skins](https://github.com/zhu1090093659/dsh-skins) | BSD-3-Clause | "皮肤中心"的模块划分（列表 / 安装 / 切换） | 代码（BSD-3 要求保留声明，能不搬就不搬） |
| [dsh-theme-plugin](https://github.com/gulagala001/dsh-theme-plugin) | MIT | **主题失败自动恢复**的思路（安全模式） | 其主题市场接入 |
| [dsh-startup-screen](https://github.com/6shenhonghong9/dsh-startup-screen) | MIT | 首帧注入 + 自定义路由 + 本地 JSON 配置的成品化写法 | 其片头素材与音效 |
| [dsh-client-ui-theme-pack](https://github.com/rpglit/dsh-client-ui-theme-pack) | MIT | `--dsw-*` 变量清单（129 项）作为**变量名索引** | 其主题数据 |

> 结论：结构照 endfield，配色方法照 bloom，安全模式照 theme-plugin，皮肤中心照 dsh-skins。
> 我们的差异点不在"再造一个换色插件"，而在**模块化能力探测 + 默认主题成品化**。

---

## 2. 可复用的非代码资源

| 资源 | 许可 | 用法 |
|---|---|---|
| 思源宋体 / Noto Serif SC | OFL-1.1 | 标题字体（自带许可文件，随包分发） |
| 得意黑 Smiley Sans | OFL-1.1 | 备选大标题 |
| Lucide 图标 | ISC | HUD / 角标 |
| 自生成纹理（CSS 渐变 + SVG 噪声） | 本项目 | 面板底纹，零授权负担 |
| Catppuccin / 中国传统色等配色表 | MIT / 公共领域 | 仅作**取色参考**，不直接搬色板 |

**明确不用**：FGO 游戏美术（TYPE-MOON 保留所有权利）、Mooncell 站点图（CC BY-NC-SA，且含游戏图）。
默认主题的视觉全部由**色值 + 排版 + 自绘 SVG**构成。

---

## 3. 复用判据（避免又走偏）

1. 先问「这是**引擎结构**还是**视觉内容**」——结构可借，视觉自造。
2. 代码许可必须是 MIT/Apache-2.0/BSD-3（BSD 要留声明）；AGPL 与无许可的**只读思路**。
3. 借来的方法必须在本机**实测通过**才算数，写进 `docs/MODULARITY.md` 并标注证据等级。