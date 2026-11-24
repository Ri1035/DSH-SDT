# 计划：推理强度滑块 + Live2D 桌宠（2026-11-25）

> 目标不变：DSH-SDT 是**自定义主题插件**，用用户素材 + 参考项目训练出「你的」外观与手感。
> 本文只记录两条新支线的调研结论、素材清单与实施顺序。

---

## A. Reasoning Effort Slider（推理强度）

### 参考实现（npm 实查）

| 包 | 版本 | 机制 |
|---|---|---|
| `dsh-reasoning-effort` | 0.2.8 | **host 侧**在 `llm-pi-ai` settings 里补齐 provider/model 的推理档位声明（`low/medium/high` 或 wire 值），**client 侧**在输入框发送按钮旁渲染按模型变化的滑杆 |
| `dsh-better-reasoning-effort` | 0.5.4 | 同类，偏 UI 增强 |
| `dsh-codex-effort-slider` | 1.1.9 | Codex 风格滑杆 |
| `@hytime/dsh-thinking-effort` | 0.4.1 | 思考强度 |

共同点：**不做假 UI** —— 滑杆必须落到 provider 的 settings 声明，否则模型不会真的改变推理量。

### 我们怎么做（M15）

1. **先读清楚自己的 provider 配置**：从 `llm-pi-ai` settings 里取当前 provider / model 列表与已有 `efforts` 字段（只读，不写）。
2. **host 半区**：以「追加、不覆盖」的方式补齐 `efforts` 映射（参考 `dsh-reasoning-effort` 的 `providers.<name>.efforts` 与 `models.<id>.disabled`）。
3. **client 半区**：在 `conversation.input.right`（发送按钮左侧）注册滑杆；档位离散，最高档给一点金色/紫色辉光（与主题一致，不复刻参考项目的紫色）。
4. **配置**：`reasoning.default`（默认档）、`reasoning.providers`（覆盖 wire 值）。
5. **验收**：切档后下一次请求的 reasoning 参数变化（抓请求/看 usage），UI 档位持久化。

**风险**：不同 provider 的 wire 值不一致；必须先只读探测，不能让插件写坏用户配置。失败回退 = 不改 settings，滑杆隐藏。

**工期**：1–2 天（含探测与回退）。

---

## B. Live2D 桌宠

### 参考实现（npm 实查）

`dsh-pet-live2d@3.7.0`：只吃 **Live2D 模型目录**，静态 PNG 不支持；
`live2dcubismcore.min.js` 由宿主首次联网从 Live2D 官方 CDN 取并缓存到 `%DSH_HOME%\pets\.runtime\`。

模型目录结构（官方要求）：

```
pets/<pet-id>/
├── pet.json                 # 清单：renderer: "live2d"、model 路径、动作/表情槽位、voices
├── <model>.model3.json      # Cubism 3/4 模型定义
├── <model>.moc3             # 编译后的模型
├── textures/texture_00.png  # 贴图（可多张）
├── motions/*.motion3.json   # 动作（idle/tap/thinking…）
├── expressions/*.exp3.json  # 表情
├── physics3.json            # 物理（头发/裙子摆动）
├── pose3.json / cdi3.json   # 可选
└── voice/*.wav              # 可选：提示音
```

### 你现在给的素材

- `玛修·基列莱特灵衣17模型.png`、`20模型.png`：512×512、**自带透明通道**（68% / 84%）；
- 已接入 **M13 静态桌宠**：右下角、可拖动、点击换装、位置记忆；
- 它们**不能直接驱动 Live2D**（没有骨骼/网格/参数）。

### 要变成 Live2D，需要你提供什么

**方案 1（推荐，最省事）**：找模型作者要 **Cubism 导出的运行时目录**（就是上面那套 `model3.json + moc3 + textures + motions + expressions + physics3`），压缩包直接丢给我。

**方案 2**：给我 Cubism 工程源文件 `.cmo3` + 贴图分层 PSD，我来导出运行时并做 `pet.json`（需要 Cubism Editor，工期取决于分层质量）。

**方案 3（今晚已做）**：继续用静态立绘，我加「呼吸/摇摆/点击切换/跟随鼠标微动」的伪动态，零模型依赖。

### 分阶段

| 阶段 | 内容 | 依赖 |
|---|---|---|
| P1 ✅ | 静态桌宠（两套灵衣、拖动、换装、记忆） | 无 |
| P2 | 伪动态：呼吸缩放、待机摇摆、点击回弹、说话气泡 | 无 |
| P3 | Live2D 接入：模型目录 + `pet.json` + Cubism Core 探测 | 你的运行时目录 |
| P4 | 事件联动：thinking/tool/done/error 切动作与表情 | P3 + 动作命名约定 |

---

## C. 毛玻璃（本轮已做）

- 顶栏（`conversation.session.header` / `conversation.header`）与侧栏：`backdrop-filter: blur(14–16px)`；
- 主区大面板：JS 标记 `data-sdt-glass`（面积 ≥ 18% 视口且不透明）+ 统一 CSS；
- 输入卡 88%、侧栏 85% 不透明度；视频壁纸下加 `.62` 遮罩与文字投影。

**待验**：插件管理页那种「整页内容压在视频上」的场景，需要真实点进插件页确认标记数量（本轮 CDP 点击未导航成功）。
