# Planning Workbench（持续项目 · 内部施工图模板）

> 这份文件用于生成前规划，不需要复制进最终学习页。
> 动手前先按 `../SKILL.md` §0 确定 `domain`，并读 `domains/<domain>/domain.md`。

## 本轮短工作单（优先填写这一块）

- 执行路径：guided / autonomous；选择依据（用户/项目设置或已有同类证据）：
- 本轮目标、受影响范围与保持不变的契约：
- 使用的材料/图像/公式依据及稳定定位：
- 采用的表达与重要取舍：
- 本轮适用验证、已有可复用证据、未解决项：

以下表是按需取用的规划维度，不要求每轮填写九张表。guided 可按单元填本工作单并使用必要表；autonomous 可直接复用项目记录或提供等效简短记录。新建/大范围重组时再扩展，局部修订只记录 delta，不把空表当作完成工作。

## 0. Course Project State

- domain：`engineering` / `ielts` / 其他（未注册领域按 custom 处理）
- 已读领域文件：`domains/<domain>/domain.md`（以及该域要求继续读的文件）

### Material Ledger
| material_id | 当前观察范围 | roles | 与已有材料关系 | Coverage State 影响 | 备注 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

### 本轮 Delta Log
| delta | 类型：knowledge/dependency/assessment/priority/correction/structure | impact level | 影响节点 | 已处理? |
|---|---|---|---|---|
|  |  |  |  |  |

### 范围覆盖状态
| 知识区域 | OPEN / PARTIAL / SUBSTANTIAL / DECLARED_COMPLETE | 依据 |
|---|---|---|
|  |  |  |

## 1. Baseline Contract

- 当前学习范围默认零基础：
- 可以假设已会：
- 一旦会阻断理解就要补的先修：

## 2. Course Signals / Source & Expansion Map

| knowledge_id | 核心知识/能力 | 当前材料线索 | A/B/C/D | 为什么必须包含 | 正式教学地址 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

> 不要求逐句追踪来源；只登记课程核心项、推断出的必要前置和重要补充。

## 2b. Provenance Ledger（来源登记）

| 节点 id | 来源 material_id | 定位（页/段/题号/时间码） | 来源角色 | 课次 / 日期 | 强调或批注（原样） | 用户原话引用 |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

> 一个节点有多条来源就占多行，不要只留一条。个人总结、强调与提醒尽量保留原句；定位记不清就留空，**不要编造**。领域适配器可追加列（IELTS 见 `domains/ielts/knowledge-units.md` §5）。

## 2c. Figure Asset Ledger（图资产登记）

读材料时与文字覆盖**同时**产出；承载知识的图必须在此有一行。判据与字段含义见 `../references/visual-material.md` §1–§2。

| fig_id | 来源 material_id | 定位（页/幻灯/图号） | 可用路径 | 上下文（附近标题/图注/一句话图意） | role | 关联节点/题目 | integrity | status |
|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  | evidence/teaching/demo |  | complete/cropped-questionable/unreadable/partial | located/extracted/placed/tech-checked/content-verified/open-issue |

- 同一张图被重复抽出：一个 `fig_id` + 多行定位，不要重复编号；
- 不同版本标注/参数有差异：保留差异，不静默取其一；
- **题图（例题/训练/往年卷里的图）role 默认 `evidence`**，且必须与题干成对登记；题目 id 写进 `关联节点/题目` 列，便于检查"这道题的图还在不在"；
- 封面、装饰、与范围无关的插图不进此表，也不进页面。

## 2d. Visual Requirements（视觉需求）

| vr_id | subject（节点/题目） | reader_action（读者要做什么） | must_see（必须看见什么） | need | fig_ids | 页面锚点 | status | note |
|---|---|---|---|---|---|---|---|---|
|  |  |  |  | required/helpful/unnecessary |  |  |  | 缺口原因 |

判定要点：读者要追踪连接、判断方向/极性/相位、辨认空间位置、读波形、跟随信号流、对照状态差异 → `required`；纯定义/纯代数 → 通常 `unnecessary`。**"每个板块一张图"不是充分性标准**，见 `../references/visual-material.md` §2。

## 3. Mastery Map

| 最终能力 | 要能解释 | 要能做的动作 | 练习层级 | Assessment Status | Evidence |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 4. Prerequisite Graph

- 目标 A ← …
- 目标 B ← …

## 5. Symbol Registry

| 符号/记号 | 首次出现 | 含义 | 单位/量纲 | 类型 | 已定义? |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 6. Question Dependency Map

| 题目 | 关键解题动作 | 所需前置 | 正式教学地址 | recall / bridge / 无 |
|---|---|---|---|---|
|  |  |  |  |  |

## 7. Coverage Migration（仅 REVISE）

| 旧页面知识项 | 新状态：保留/移动/合并/压缩/纠错/删除重复 | 新地址 | 独有信息已迁移? |
|---|---|---|---|
|  |  |  |  |


## 8. Incremental Impact Checklist

- [ ] 新材料是否只是新增证据，而非新增知识？
- [ ] 是否出现此前未教的 prerequisite？
- [ ] 是否改变某能力的 assessment status？
- [ ] 是否存在修订/冲突，不能静默覆盖？
- [ ] 是否需要结构重排，还是局部 canonical node 更新即可？
- [ ] 未受影响知识的 stable ID / anchor 是否保持不变？
- [ ] 新增内容是否已进入正确位置，而不是简单追加在页面末尾？
- [ ] 本轮新增/替换/重绘的图，是否已登记 `fig_id` 并更新对应 `vr_id`？
- [ ] 替换图后，所有引用位置（正文引用、图号、题目、答案、总结）是否同步？
- [ ] 是否存在 `open-issue` 的图被当成"已完成"？
