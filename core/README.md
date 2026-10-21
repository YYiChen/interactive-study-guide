# Core · 通用核心层

`core/` 是**跨领域通用**的部分：教学机制、页面引擎、检查器、状态模板与施工图模板。

它不包含任何学科的公式、章节模板或考试结构——那些属于 `domains/<domain>/`。

## 1. 加载顺序

1. 首次读 `../SKILL.md` 与 `references/execution-profiles.md`；后续按本轮影响加载，保留共同质量底线，不反复通读全部参考；
2. 本文件 → 按需读 `core/references/*.md`；
3. 领域适配器 `domains/<domain>/domain.md`：决定“这类资料怎么读、知识怎么成节、页面怎么表达”；
4. 项目数据（用户真实资料 + 生成的 HTML + `course-state.json`）：**由数据决定，不由 Skill 预设**。

## 2. 文件地图

| 文件 | 作用 |
|---|---|
| `core/references/execution-profiles.md` | 引导/自主两条路径、授权边界、简短工作单、等效验证与停止条件 |
| `core/scripts/prepare_figure.py` | 原页/候选裁图/框选对照/来源记录；不判断图意 |
| `core/references/teaching-architecture.md` | 能力 → 先修 → Canonical Teaching Location → 练习梯度 |
| `core/references/source-expansion-policy.md` | 不完整材料下的 Necessary Closure 与 A/B/C/D 四级来源 |
| `core/references/incremental-project-state.md` | Material Event、Coverage/Assessment 状态、稳定 ID、Delta Log、Impact Levels |
| `core/references/content-rules.md` | 概念/符号/公式/推导/经验关系/图/例/练习的通用写法 |
| `core/references/visual-material.md` | 图像材料：并行读取、图资产登记、视觉需求、素材降级阶梯、技术边界、图文式题一致、状态阶梯与图的增量 |
| `core/references/page-structure.md` | 信息架构、标题层级、sidebar、页签、渐进披露组件、gotoText |
| `core/references/page-archetypes.md` | 四个结构原型（exam-prep / principle / review / custom）与模板裁剪 SOP |
| `core/references/evolution-governance.md` | 多轮修改归位、禁止补丁墙、冲突材料处理 |
| `core/references/interactive-patterns.md` | 图型分级 A/B/C、必须做交互的触发条件、四种可抄代码骨架、图容器契约 |
| `core/references/verification.md` | Coverage / Dependency / Correctness / Technical 四层验收 |
| `core/references/case-studies/` | 具体学科事故与修复案例（不得反向硬编码进通用规则） |
| `core/assets/study-page-template.html` | `exam-prep` 的完整参考实现（成熟 UI/导航/交互引擎） |
| `core/assets/planning-workbench.md` | 生成前的内部施工图模板 |
| `core/assets/course-state-template.json` | 多轮更新的轻量状态模板 |
| `core/scripts/check_page.js` | 静态结构检查器 |
| `core/scripts/slice_png.py` / `core/scripts/make_variant.py` | 截图切条、交互自动化验证 |

## 3. 硬规则（领域适配器不得放松）

1. 材料不是一次性给全的；新材料先判 impact 再改页面（SKILL.md §1、§12）；
2. 每个核心概念只有一个 Canonical Teaching Location，其余位置只做 `.recall` / bridge / deep / 总结（§5）；
3. 首现规则：术语、符号、公式、方法第一次使用前必须交代清楚（§6）；
4. Necessary Closure + 四级来源，不把模型补充伪装成课程原话（§2）；
5. 知识不缩水：改动前先做 Coverage Baseline，每项都有去向（§4）；
6. 考试边界用证据权重，未观察到 ≠ 不考（§11）；
7. 图与视觉：文字与视觉并行读取，承载知识的图必须登记并与知识/题目关联（§3、`visual-material.md`）；配图充分性按视觉需求判定，"每板块一张图"只是下限；交互按学习收益选择，允许能完成任务的静态对照；图注三要素；图必须与文/式/题/答一致（§14）；
8. 交付前按影响范围取得 Gate A–D 的适用证据；改页面时做相关静态检查，显示/交互变化做相关渲染核验，未覆盖项如实说明（§15、`verification.md` §0）。

执行路径调整的是支撑程度和过程，不改变上述质量结果；领域差异与 guided/autonomous 相互独立。

**领域适配器可以调整**：板块的组织轴、资料类型划分、页面表达原型、术语与素材的呈现方式、状态字段的领域扩展。

**领域适配器不得调整**：上面 8 条，以及 core 文件自身的规则文本（要改就改 core，并说明对所有领域的影响）。

## 4. Domain Adapter Contract

一个注册域至少提供：

1. `domain.md` 入口：适用资料特征、domain 判定信号、加载清单；
2. 资料类型分类法：来源角色与内容性质怎么判，未知类型怎么处理；
3. 知识单元的定义、合并规则与来源（provenance）记录方式；
4. 组织轴候选与“从数据推出信息架构”的流程（含向用户确认 IA 的步骤）；
5. 页面表达原型 + 与 `data-archetype` 的映射 + 本域视觉锚点口径；
6. 增量更新动作（对齐 SKILL.md §12）；
7. 明确声明：本域是否放松了 core 规则（默认 0 条）与理由；
8. 反模式清单。

## 5. 工具用法

```bash
node core/scripts/check_page.js page.html    # 结构检查：读 data-archetype / data-domain / data-visual-contract
python core/scripts/slice_png.py shot.png outdir --band 1200 --prefix demo_
python core/scripts/make_variant.py in.html out.html --click <sel> --probe "JS表达式"
```

checker 只证明结构没有明显机械问题，不能证明内容正确；也不能证明图的结构正确或图片真的渲染出来（见 `verification.md` 的三层证据边界）。
