---
name: interactive-study-guide
version: 5.1
description: 将分批、来源多样、完整度不固定的学习资料（工科课程与工程数学，以及 IELTS 等语言学习资料）持续整理成面向零基础、最终能独立应考的交互式学习 HTML。采用 Core + Domain 三层结构，通用教学机制在 core/，领域适配器在 domains/（engineering 默认、ielts）。适用于概念+符号+公式+条件+推导+题型类课程，也适用于教师讲解、课堂笔记、语言素材、范文与个人经验总结类资料；支持后续任意新增、修订、替换、补充材料的增量重规划，避免知识断层、静默缩水、补丁式膨胀和考试边界误判。页面结构按读者任务选择原型，例题与训练等板块不写死。
summary: 三层结构——core（通用教学机制、页面引擎、检查器，任何领域照跑）+ domains/<domain>（领域适配器：这类资料怎么读、知识怎么成节、页面怎么表达）+ 项目数据（由用户真实资料决定，不预设结构）。课件只提供线索，不是知识上限；模型主动补齐必要前置，并用知识依赖图、登记表、来源记录与增量状态管理保证内容不缩水、可稳定并入。
---

# Interactive Study Guide v5.1

## 目标

把当前可见的课程资料，持续整理成一套：

**从零能读懂 → 知识不跳步 → 公式有来路与条件 → 能独立做题 → 后续新材料可稳定并入** 的学习系统。

默认领域 `engineering`（固体/材料力学、动力学、热力学、流体、传热、工程数学、微分方程及其他相近工科课程）；IELTS 等语言学习资料走 `domains/ielts/`。**领域规则只调整组织轴与表达口径，不改变下面的教学机制。**

固定的是**教学机制**，不是某一学科的公式或章节模板。

优先级：

**知识正确 > 依赖完整 > 考试能力覆盖 > 内容不缩水 > 去重与认知负荷 > UI 精致。**

---

## 0. 领域调度（Domain Dispatch）

本 Skill 分三层，动手前先确认自己在哪一层：

| 层 | 位置 | 谁决定 |
|---|---|---|
| **Core** | `core/` | 通用教学机制、页面引擎、检查器；任何领域都照跑 |
| **Domain** | `domains/<domain>/` | 这类资料怎么读、知识怎么成节、页面怎么表达 |
| **Project** | 用户资料 + 生成的 HTML + `course-state.json` | **由真实资料决定，Skill 不预设** |

执行顺序：

1. 先读本文件 §0–§16（core 规则常驻，不因领域放松）；
2. **判定 domain**：
   - 用户显式指定（如“按 IELTS 领域来做”）→ 直接采用；
   - 未指定 → 按资料特征判定（工科/理科课程 → `engineering`；IELTS/语言学习 → `ielts`）；
   - 判不准，或一批资料横跨多个领域 → 问用户，不要默默猜；横跨时指定主领域 + 附属领域，并在交付说明里写明；
3. 读 `domains/<domain>/domain.md`，按它给出的加载清单加载领域规则；
4. 领域规则与 core 冲突时，core 的教学机制、增量归位与交付 Gate 优先——领域只能调整“组织轴与表达口径”，不能放松硬规则；
5. 页面同时声明领域与结构原型：`<body data-archetype="…" data-domain="…">`，页面顶部注释写清原型取舍理由与领域。

领域未注册时按 `custom` 处理（同 §8）：先写下读者任务、板块清单、与最近领域的差异、哪些 core 硬规则仍适用，用户确认后再动手。

已注册领域见 `domains/README.md`（当前：`engineering` 为默认、`ielts`）。

---

## 1. 材料不是一次性给全的

默认假设：当前拿到的只是“当前可见材料”，不代表全部课程，也不代表最终考试边界。

后续任何新输入都视为一次 **Material Event**。它可能是新增、补充、修订、替换、重复、纠错、不同版本、不同来源或新的考核线索；不要把输入类型写死成某几个文件名或章节名。

除非用户明确声明某范围已完整，否则：

- 当前没出现 = **尚未观察到**；
- 当前没题 = **不能直接判定不考**；
- 当前材料没写全 = **不能因此不讲必要知识**；
- 新材料到来 = 先分析影响，再局部更新，不要整页推翻重写。

若环境允许，维护 `course-state.json`，模板见 `core/assets/course-state-template.json`。

详见 `core/references/incremental-project-state.md`。

---

## 2. 课件是课程线索，不是知识上限

教师材料往往只告诉“有什么”，不会把每个知识拆开讲透。因此模型必须主动做 **Necessary Closure（必要知识闭包）**。

内部把知识分四类：

- **A 课程明确**：材料直接出现或明确要求；
- **B 课程隐含**：材料没展开，但当前公式、任务、解答明显依赖；
- **C 标准必要补充**：为了让零基础读者真正理解 A/B 必须补的基础；
- **D 可选拓展**：非完成当前课程与考试所必需，只在确实有帮助时折叠呈现。

A+B+C 可进入正式教学主线。D 默认放 `<details class="deep">` 或不展开。

不要把补充内容伪装成老师原话；也不要因为模型知道更多就扩成百科。

详见 `core/references/source-expansion-policy.md`。

---

## 3. 写 HTML 前先做内部施工图

每轮创建或更新前，先扫描：**当前全部材料 + 现有 HTML + 既有状态**。

至少维护以下内部表：

1. **Coverage Baseline**：已有概念、符号、公式、条件、推导、技巧、例题、易错点；
2. **Mastery Map**：学生最终需要解释、计算、判断、建模、识别、证明或应用什么；
3. **Prerequisite Graph**：每个能力依赖哪些知识；
4. **Symbol Registry**：每个符号/术语的首现、含义、单位或用法、记号类型；
5. **Question Dependency Map**：每道题的关键解题动作依赖什么、教学地址在哪里；
6. **Material Ledger / Delta Log**：新材料相对旧状态新增、修订、冲突或强化了什么；
7. **Provenance Ledger**：每个知识节点的来源——哪份材料、哪次课、哪条笔记、定位、时间，以及用户自己的强调与批注。领域适配器可扩展字段（见 `domains/<domain>/`）。

这些表是内部施工图，不要求全部展示给学生。可使用 `core/assets/planning-workbench.md`。

---

## 4. 知识不缩水

修改旧页面时，不允许凭感觉“重新生成一份更清爽的”。

先把旧页面纳入 Coverage Baseline。每个已有知识项必须标记：

`保留 / 移动 / 合并 / 压缩 / 删除重复 / 纠错 / 明确移出范围`

允许减少字数，**不允许静默减少知识覆盖**。

删除重复前必须确认其中独有信息已经迁移到正式教学地址。

---

## 5. 正式教学地址 + 局部唤醒

每个核心概念只设一个 **Canonical Teaching Location（正式教学地址）**，在那里完整讲清：

**为什么需要 → 术语/符号 → 关系/公式 → 来路 → 条件/假设 → 最小示范 → 能力检查。**

后面再次遇到时按需要使用：

- `.recall`：1–3 行短提醒 + 回链；
- `<details class="bridge">`：只对当前题/当前情境需要的局部知识桥；
- `<details class="deep">`：第二种推导、证明细节、拓展边界；
- 🧾 总结：压缩复习，不重新教学。

去重不是删知识，而是减少“完整教学任务”重复出现。

---

## 6. 零基础规则：绝不允许符号、公式和方法突然出现

任何新符号第一次参与公式、图、推理或题目之前，至少要说明：

- 怎么读（必要时）；
- 表示什么；
- 单位/量纲（适用时）；
- 下标、上标、点号、偏导、向量、矩阵等记号是什么意思；
- 它是给定量、未知量、参数、常数、函数还是算子。

公式第一次正式出现时至少回答：

1. 描述什么；
2. 每一项是什么；
3. 从哪里来（定义 / 基本定律 / 本构 / 推导 / 经验 / 近似）；
4. 什么时候能用；
5. 典型误用是什么。

**“这是命名，不是推导”**、**“这是近似，不是恒等式”**、**“这是经验关系，不是基本定律”** 等角色必须明确。

交付前做 Symbol Registry ↔ 正文首现双向对账。

---

## 7. 练习不是固定前置框，而是依赖审计

练习分三类：

1. **Guided Practice**：刚学完，可有短提示；
2. **Transfer Practice**：换场景/问法，不直接提示方法；
3. **Exam Practice**：尽量模拟考试，不泄露题型。

每道题先做内部 Dependency Audit：

- 所需知识已正式教过 → 不重复大段讲解，最多给标签或短提醒；
- 学过但隔得远 → `.recall`；
- 通用知识从没教过 → **回修正文，把它前移到正式教学地址**；
- 仅该题需要的特殊技巧 → `.bridge`；
- 明显超出当前课程 → 标“拓展”，不要伪装成必会。

**旧规则“每题必须有一个大前置知识块 / `#prep-*`”已经废止。**

页面完成后执行 **Solution-backward Audit**：从答案逐步反查正文。任何解答步骤使用了未教学的符号、公式、假设、变换、边界条件或技巧，都必须修复。

练习覆盖以“能力单元”为单位，不要求每个微概念机械配一题。

---

## 8. 页面原型：先定任务，再定结构

动手前先判定：**这个页面要替读者完成什么任务**，据此选页面原型（Page Archetype）。原型决定板块的取舍，不决定板块数量。

内置原型：

| 原型 | 读者任务 | 板块结构 | 例题 / 训练 |
|---|---|---|---|
| `exam-prep`（默认） | 从零预习到能应付考试 | 总览 → 知识板块 → 📚 例题 → 📝 训练 → 🧾 总结 | 必备 |
| `principle` | 看懂某个原理 / 实验“为什么、怎么用” | 总览 → 知识板块 → 🧾 总结 | **默认关闭**，用户明确要求才加 |
| `review` | 考前压缩复习、速查 | 总览 → 知识板块（压缩表达）→ 🧾 总结 | 默认关闭 |
| `custom` | 上述都不匹配 | 模型自行声明板块清单与取舍理由，经用户确认后再动手 | 按声明 |

规则：

- 原型只规定**板块类别**的必备 / 可选 / 默认关闭，不规定板块数量；知识板块内部顺序仍按 §9“读者问题”划分，课程小可合并、大可拆多个 HTML；
- 原型选择必须向用户明示（一句话即可，如“按原理讲解型组织，不含例题与训练”）；
- 页面必须声明所用原型：`<body data-archetype="principle">`，并在页面顶部注释写一句取舍理由；
- `core/assets/study-page-template.html` 是 `exam-prep` 的**完整参考实现**；其他原型从它裁剪，裁剪步骤（删 tab、同步 TABS、清跳转键、checker 期望变化）见 `core/references/page-archetypes.md`；
- 不要再把“易混淆 / 速记表 / 公式汇总”拆成多个一级复习页；统一收口到总结。

表达分层（与原型正交，所有原型都适用）：

预习层：
- 从问题/现象/对象出发；
- 单线推进；
- 表格主要用于讲完后的收束；
- 必须回答“为什么需要它”。

复习层：
- 可压缩成表格、对照、决策树、公式卡；
- 不重新做长篇首次教学。

---

## 9. 页面分块按“读者问题”，不是按笔记分类

板块和 h2/h3 应回答一个明确的读者问题或动作：

- ✅ “这个量为什么要这样定义？”
- ✅ “拿到这种边界条件后怎么开始？”
- ❌ “理论补充”
- ❌ “参数讨论”
- ❌ “其他”

新材料到来时优先把内容放回它真正回答的问题，不要追加到页面末尾形成“补丁区”。

折叠只负责降低同时可见的信息量，不能掩盖结构没想清楚的问题。

---

## 10. 学科结构允许不同

Skill 不规定统一学科主线。结构由**领域适配器 + 当前真实资料**共同决定，不写死。

Core 只要求：

- 主线能回答“先有什么、再有什么”，顺序由 Prerequisite Graph 决定，不由资料顺序决定；
- 每一段都对应一个读者问题（§9）；
- 领域特异的组织轴与主线示例写在 `domains/<domain>/`：工程见 `domains/engineering/domain.md` §3，IELTS 见 `domains/ielts/organization.md` §2。示例都只是启发，不是强制模板。

---

## 11. 考试边界用证据权重，不用“没看到”做绝对判断

Mastery Map 至少区分：

`confirmed / strongly-supported / plausible / prerequisite-only / unknown`

强正证据通常包括：
- 明确要求完成的任务；
- 多个独立材料重复出现的解题动作；
- 教师反复示范、强调、布置或评价的能力；
- 有代表性的考核材料持续出现同一能力。

负证据只有在材料**足够有代表性**时才成立。

若资料仍明显不完整：没出现某题型只能记为 `unknown / not yet observed`。

即使某知识本身不单独考，只要它是已确认题型的必要前置，就仍必须教学。

---

## 12. 新材料到来时的固定增量流程

1. **Identify**：判断是全新范围、补充、修订、替换、重复还是冲突；
2. **Extract Delta**：只抽取真正新增/改变的信息；
3. **Classify Impact**：
   - `NO_STRUCTURAL_CHANGE`
   - `LOCAL_ENRICHMENT`
   - `PREREQUISITE_BACKFILL`
   - `ASSESSMENT_REWEIGHT`
   - `STRUCTURAL_REORDER`
   - `CORRECTION_OR_CONFLICT`
4. **Update Maps First**：先更新 §3 的施工图（含 Provenance Ledger）；
5. **Patch Canonical Locations**：新知识回到正式教学地址；
6. **Preserve Stability**：非必要不改稳定知识 ID、锚点和用户熟悉的导航名；
7. **Re-audit**：重新跑符号首现、依赖、题目反查、重复、正确性与技术检查。

用户指出“这个字母没解释 / 这题前面没教 / 这里太突然”时，也走同一流程，而不是原地追加一大块补丁。

---

## 13. 正确性审计

结构检查不能替代知识检查。关键结论至少审：

- 角色：定义 / 定律 / 本构 / 推导 / 近似 / 经验式是否混淆；
- 符号、单位、量纲是否一致；
- 假设、参考状态、坐标、边界/初值是否明确；
- 推导链是否缺关键步骤；
- 近似条件是否被隐藏；
- 极限/边界情形是否合理；
- 数值能否回代或满足守恒/方程/边界；
- 图、公式、文字是否一致。

若课程材料采用简化口径，而更完整学科表述更严格，要明确区分“本课考试口径”和“完整表述”。

若专业结论自己不确定，应验证；不要用自信语气掩盖不确定性。

---

## 14. UI 与渐进披露

直接基于 `core/assets/study-page-template.html` 修改，优先保留成熟的：

- 顶层页签；
- 左侧自动大纲；
- h2/h3 折叠；
- scroll-spy；
- 跨页 `gotoText()`；
- 移动端抽屉；
- MathJax；
- 键盘可访问性；
- `.recall / .bridge / .deep / .practice / .answer`。

核心教学默认可见；第二种方法、长证明、局部技巧、答案默认折叠。

### 图与交互：按图型分级，不是全盘交互化

每个知识板块至少 **1 个视觉锚点**（图 / 可交互演示 / 可操作几何），不允许整板块纯文字；但**不是每张图都要可交互**。动手前先给每张图定型：

| 图型 | 典型例子 | 默认要求 |
|---|---|---|
| **A 结构识别类** | 结构图、部件/关系示意、流程框图、实物或界面照片 | **静态**；禁止为动而动，动效不增加理解就不做 |
| **B 查表取值类** | 参数表、分级表、对应关系表、符号/术语速查 | **优先可交互查表**：给一个可调量，实时高亮对应行/曲线并显示完整数值；最低限度"可调范围与详细数值可见" |
| **C 关系演化类** | 参数敏感性 / 时间演化 / 几何关系 / 图形读法 / 方法对比 / 量级感 | **必须可交互**（滑块、播放/暂停、拖动）；静态图只作 JS 失效时的降级兜底 |

表格同样二分：**对比/收束型**（易错对照、符号汇总）保持静态；**查表取值型**按 B 类优先交互。

所有图（无论动静）都要有图注三要素：它让什么变得可见 / 应观察什么 / 最终结论是什么。交互旁必须有静态结论，读数必须与公式计算值一致。判定口径与可抄代码骨架见 `core/references/interactive-patterns.md`。

各领域的典型例子与 A/B/C 判定口径见对应领域适配器：工程 `domains/engineering/domain.md` §4；IELTS 等语言学习资料 `domains/ielts/page-patterns.md` §3。

模板默认依赖 MathJax CDN，因此是单 HTML 文件，不是严格离线；用户要求离线时再本地化依赖。

详见 `core/references/page-structure.md` 与 `core/references/interactive-patterns.md`。

---

## 15. 交付前四道 Gate

### Gate A — Coverage & Incremental State
- 当前已见材料中的关键知识是否都有归宿？
- 本轮 delta 是否都处理？
- 是否误把“尚未观察到”写成“不考/不需要”？
- 重构有没有知识静默消失？

### Gate B — Dependency & Learnability
- 随机抽 3 个能力，零基础能沿依赖一路读到吗？
- 符号首次使用前都定义了吗？
- 是否存在“答案会用、正文没教”的步骤？
- 必须掌握的能力是否有有效示范或练习，而不是只讲不练？

### Gate C — Correctness
- 关键式的角色、条件、量纲、边界、近似和数值是否自洽？
- 课程明确内容与模型补充有没有混淆？

### Gate D — UI / Technical
运行：

```bash
node core/scripts/check_page.js your-page.html
```

再做浏览器目视和交互测试。

checker 只能证明结构没有明显机械问题，不能证明学科知识正确。

---

## 16. 迭代纪律

用户反馈应转化成**通用规则**，不要把某门课的具体公式写回通用 Skill。

- 教学结构问题 → `core/references/teaching-architecture.md`
- 内容表达/符号/公式问题 → `core/references/content-rules.md`
- 新材料/版本/考试证据问题 → `core/references/incremental-project-state.md`
- 来源补全边界 → `core/references/source-expansion-policy.md`
- UI/导航 → `core/references/page-structure.md`
- 页面原型选型与裁剪 → `core/references/page-archetypes.md`
- 动效模式 → `core/references/interactive-patterns.md`
- 领域适配器本身的问题（判错领域、领域规则与资料不符）→ `domains/README.md`
- 工程域口径 → `domains/engineering/domain.md`
- IELTS 域口径 → `domains/ielts/domain.md`

某学科或某场考试的具体事故只能作为案例保存，不能升级成全局强制规则。案例放 `core/references/case-studies/`。

---

## Resources

### Core（跨领域通用，任何领域都照跑）

- `core/README.md` —— core 层地图、硬规则清单、Domain Adapter Contract。
- `core/references/teaching-architecture.md` —— 预习教学结构、知识闭环、Canonical Teaching Location、练习梯度。
- `core/references/source-expansion-policy.md` —— 不完整材料下如何主动补齐但不过度扩张。
- `core/references/incremental-project-state.md` —— 分批、乱序、修订、冲突材料的项目状态与考试证据管理。
- `core/references/content-rules.md` —— 概念、符号/术语、公式/规则、推导、例子、练习的通用写法。
- `core/references/page-structure.md` —— HTML 信息架构、标题层级、导航与组件契约。
- `core/references/page-archetypes.md` —— 结构原型选型（考试预习 / 原理与讲解 / 复习速查 / 自定义）与模板裁剪步骤。
- `core/references/evolution-governance.md` —— 多轮修改如何归位，避免补丁式膨胀。
- `core/references/interactive-patterns.md` —— 图型分级 A/B/C、必须做交互的触发条件、可抄代码骨架、图容器契约。
- `core/references/verification.md` —— 内容、依赖、正确性和技术验收。
- `core/references/case-studies/` —— 具体课程的教学事故与修复案例。
- `core/assets/study-page-template.html` —— 成熟 HTML/UI 引擎与当前规则示范（`exam-prep` 完整参考实现）。
- `core/assets/planning-workbench.md` —— 生成前内部施工图模板。
- `core/assets/course-state-template.json` —— 多轮更新的轻量状态模板。
- `core/scripts/check_page.js` —— 静态结构检查器（读取 `data-archetype` 与可选的 `data-domain`）。
- `core/scripts/slice_png.py` / `core/scripts/make_variant.py` —— 截图与交互验证辅助脚本。

### Domains（领域适配器，先读各自的 `domain.md`）

- `domains/README.md` —— 领域注册表、判定与调度规则、新增领域步骤。
- `domains/engineering/domain.md` —— 工科与工程数学（默认域）：学科主线、图型例子、内容与验证口径。
- `domains/ielts/domain.md` —— IELTS 入口：定位与边界、判定信号、加载清单、core 概念落地表。
- `domains/ielts/material-taxonomy.md` —— 资料类型判定（来源角色 × 内容性质、未知类型处理）。
- `domains/ielts/knowledge-units.md` —— 知识单元抽取与合并、来源记录（provenance）、个人痕迹保留。
- `domains/ielts/organization.md` —— 组织轴候选、从数据推出信息架构、IA 草案模板。
- `domains/ielts/page-patterns.md` —— 语言学习页面原型、与结构原型的映射、视觉锚点口径。
- `domains/ielts/incremental.md` —— 新材料并入流程与合并决策表。
