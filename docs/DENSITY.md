# DENSITY.md —— L3 密度层实测与决策（v1.6）

> 目的：把「字号 / 行高 / 间距 / 圆角」这类非颜色变量查清**到底有多少、谁在管、能不能改**。
> 证据等级：**【实测】** 本机 `0.2.2-rc.1` + `web` profile；**未确认** 标注未验证项。
> 复现入口见 §6。

---

## 0. 结论先行

| 结论 | 依据 |
|---|---|
| 旧文档「88 个 `--dsh-*`」**没有实测支撑** | 当前主视图实测 **49 个**；变量随视图按需加载，88 可能是全量猜测 |
| 绝大多数密度变量定义在**哈希类**作用域，不能用稳定选择器覆盖 | `.wtg9ga_root` / `.an3WzG_body` / `.AGrSLq_card` 等（R6 禁止哈希选择器） |
| **字号归宿主所有**：`--dsh-content-font-size` 等由宿主**内联写在 `body`** | 插件写样式表会被内联覆盖；且它对应设置页「字号大小」偏好，抢写会造成闪烁 |
| `theme` 服务**没有图标接口** | `ctx.theme` 原型 13 个方法：`getTheme/exportInspectTokens/setTheme/setFontSize/adjustFontSizes/setFontFamily/write/adopt/register/overrideTokens/buildSnapshot/composeActive/publish` |
| 可用稳定锚点覆盖的只有**会话内容容器**上的间距/宽度变量 | `[data-conversation-content]`（语义属性，非哈希类） |

---

## 1. 盘点方法与原始数据【实测】

扫描页面内 **158 个 `<style>`**（约 477 KB CSS），对 `--dsh-*` 做两件事：
① 统计定义位置（选择器）；② 统计 `var(--name)` 被引用次数。

| 指标 | 值 |
|---|---|
| `--dsh-*` 变量名 | **49**（当前视图） |
| `--dsw-*` 变量名 | **424**（含 static/font/specific，非全部可覆盖） |
| 被引用最多的密度变量 | `--dsh-content-font-delta` **125 次**、`--dsh-content-font-size-secondary` 49 次 |
| 定义在 `body` 的 | `--dsh-content-font-delta`、`--dsh-code-font-delta`、`--dsh-scrollbar-*`、`--dsh-boot-bg` |
| 定义在 `:root` 的 | 仅 `--dsh-font-family-*`（已被本项目接管） |
| 定义在哈希类上的 | 侧栏 `--dsh-sidebar-*`、会话 `--dsh-chat-content-width`、`--dsh-composer-*` 等 |

---

## 2. 变量归属表（决定「谁能改」）

| 变量组 | 定义位置 | 插件能否稳定覆盖 | 决策 |
|---|---|---|---|
| `--dsh-content-font-size` / `--dsh-code-font-size` | 宿主**内联在 `body`** | ❌ 样式表优先级低于内联；且对应设置页字号偏好 | **不覆盖**，交还宿主（ADR D29） |
| `--dsh-content-font-size-secondary` | `body` + 哈希类 | ⚠️ 同上，属字号体系 | 不覆盖 |
| `--dsh-sidebar-row-padding` / `-inline-padding` / `-label-gap` | `.wtg9ga_root`（无 `data-slot`） | ❌ 只能靠哈希类或结构选择器 | **不做**（等官方暴露稳定锚点） |
| `--dsh-composer-side-clearance` | `.an3WzG_body`，元素带 `[data-conversation-content]` | ✅ `html body [data-conversation-content]` 优先级更高 | **已改** 16px → 20px |
| `--dsh-composer-card-max-width` | 同上 | ✅ 同上 | **已改** `+32px` → `+48px` |
| `--dsh-chat-content-width` | 同上 | ✅ 可改，但窄窗有溢出风险 | 暂不改（等窄窗回归用例） |
| `--dsh-composer-stack-gap` | 更内层哈希类 | ❌ 祖先覆盖被内层定义压回 6px | 不做 |
| `--dsh-chat-flow-gap` | 哈希类 + `[data-chat-group-part]` | ⚠️ 依赖对话节点存在，当前页无内容 | 待对话态验证 |

> 关键教训：**CSS 变量不是「写在祖先就生效」**——只要目标元素自己重新定义了该变量，祖先的值就被遮蔽。

---

## 3. 本版实际改动（v1.6）

```css
/* plugin/client.js buildCss() */
html body [data-conversation-content]{
  --dsh-composer-side-clearance: 20px;                                  /* 16 → 20 */
  --dsh-composer-card-max-width: calc(var(--dsh-chat-content-width) + 48px); /* +32 → +48 */
}
```

- 只动**间距/几何**，不动字号；字号由宿主设置页控制。
- 两个变量都有官方 fallback 语义：变量失效时退回宿主默认，**不会破版**。

### 3.1 验证矩阵【实测】

| 视口 | 横向溢出 | 输入卡宽度 | 左右间距变量 | 宿主字号 |
|---|---|---|---|---|
| 944×735 | 无（scrollWidth = 944） | 728px | 20px | 14px（未被插件改动） |
| 980×640 | 无（980 = 980） | 728px | 20px | 14px |
| 1423×900 | 无（1423 = 1423） | 780px | 20px | 14px |

截图：`docs/preview/v16-light-1423.png`、`docs/preview/v16-light-980.png`。
980 宽下侧栏自动折叠为 60px 图标栏，输入卡完整、无重叠。

---

## 4. M4 只读信息卡【实测】

- 落点：`settings.general.item`（list / root），**不是** `settings.section`。
  - `settings.section` 实测是设置页的**内容容器**（一个 `[data-slot]` 包住整页），注册后不显示；
  - `settings.general.item` 才会渲染成「通用设置」里的一行。
- 注册方式：`ctx.slots.inject(name, () => ctx.slots.register({name, id, order}, Component))`
  —— 直接 `register` 不生效，必须走 `inject`（与 `sidebar.brand.mark` 同）。
- 内容：`DSH-SDT / 版本 / token 133/133 / 配置来源 / 目录`，全部只读。
- 验证：打开 设置 → 通用设置，页面底部出现上述文本；失败不影响主题（try/catch）。

---

## 5. M5 图标：负结论与降级【实测】

- `ctx.theme` 原型方法里**没有任何 icon 相关接口**（完整列表见 §0）。
- 官方 `ICON_SYMBOLS` 未通过 client 服务暴露；图标在 DOM 里也没有可稳定识别的 `data-*`。
- 因此「整套替换官方图标」**没有官方接缝**；硬做只能靠哈希类 / 中文 aria-label（R6/R7 明令禁止）。

**降级方案（待做）**：只给**自有元素**（overlay / 信息卡 / 字标）做菱形底板与配色，
不碰宿主图标。视觉效果打折，但不引入碎片化风险。

---

## 6. 复现命令

```powershell
# 1) 起隔离实例
dsh --profile web --no-open --port 18990
# 2) 在页面控制台/ego evaluate 中执行：统计 --dsh-* 定义与引用
#    代码见 git 历史本文件同版提交的 docs/DENSITY.md §1 方法说明
# 3) 三视口验证
#    Emulation.setDeviceMetricsOverride → 980×640 / 1423×900 → 读 scrollWidth 与输入卡 rect
```

> 相关决策：`docs/TODO.md` D29（字号归宿主）、D30（M5 无接缝，降级）。
