# Interactive Study Guide v5.1

把**分批、乱序、来源多样、完整度不固定**的学习资料，持续整理成面向零基础、最终能独立应考的交互式学习 HTML。

采用 **Core + Domain** 三层结构：

| 层 | 位置 | 内容 |
|---|---|---|
| Core | `core/` | 通用教学机制、页面引擎、检查器、状态模板——任何领域都照跑 |
| Domain | `domains/<domain>/` | 领域适配器：这类资料怎么读、知识怎么成节、页面怎么表达 |
| Project | 用户资料 + 生成的 HTML + `course-state.json` | **由真实资料决定，Skill 不预设结构** |

已注册领域：`engineering`（工科与工程数学，默认）、`ielts`（IELTS 与语言学习资料，不预设听说读写四科）。

## 设计目标

- 资料可以分批、乱序、不断补充；
- 教师材料可以很简略，模型负责补齐“为了学会当前内容所必需”的知识；
- 零基础读者不会遇到突然出现的符号、术语、公式或解题方法；
- 后续新材料优先回填到正确知识位置，不在页面末尾堆补丁；
- 重构允许去重和压缩，但不允许知识静默缩水；
- 考试边界使用证据权重，材料未齐时“没出现”不等于“不考”；
- 每个知识节点保留来源（哪份材料、哪次课、哪条笔记），个人强调与经验不因摘要而丢失；
- UI 引擎与教学规则分离，具体学科公式不写进通用层。

## 推荐工作流

1. 读 `SKILL.md`（§0 领域调度 → §16 迭代纪律）；
2. **判定 domain**（`engineering` / `ielts` / 未注册按 custom 处理），读 `domains/<domain>/domain.md` 并按其清单加载领域规则；
3. 判不准或资料横跨多个领域时先问用户，不要默默猜；
4. **判定结构原型**（exam-prep / principle / review / custom，见 `core/references/page-archetypes.md`），向用户明示所选原型；
5. 用 `core/assets/planning-workbench.md` 建内部施工图（含 Provenance Ledger）；
6. 领域要求时（如 IELTS）先给用户 IA 草案并等确认：`domains/ielts/organization.md` §5；
7. 基于 `core/assets/study-page-template.html`（exam-prep 完整参考实现）生成/修改页面，其他原型按裁剪 SOP 删减；
8. 新材料到来时更新 `course-state.json` 与施工图，再局部修改页面；
9. 运行 `node core/scripts/check_page.js page.html`（读取 `data-archetype`，并报告 `data-domain`）；
10. 做 Coverage / Dependency / Correctness / Technical 四层审计，领域可加一层专项审计。

## 版本说明

- **v4.0**：consolidation——保留成熟的 sidebar、scroll-spy、跨页跳转、折叠与验证工具；删除“每题必须 prep”“每页固定自检”等互相冲突的规则；具体课程经验不再作为通用规则。
- **v5.0**：①页面原型机制——结构由读者任务决定，例题/训练按原型取舍，模板定位为 exam-prep 的参考实现；②图与交互硬规则——每个知识板块至少 1 个视觉锚点、图型分级 A/B/C、图注三要素，checker 增加相应检查。
- **v5.1（当前）**：Core + Domain 分层。
  - **目录**：通用规则迁入 `core/`（`references/`、`assets/`、`scripts/`），领域规则新建 `domains/`（`engineering`、`ielts`）；
  - **调度**：`SKILL.md` 新增 §0 领域调度与页面 `data-domain` 声明；未注册领域按 custom 处理；
  - **通用层中性化**：工程专属示例（学科主线、Moody/K_L/ε–NTU 等图例）移入 `domains/engineering/domain.md`，core 不再含学科专属例子；
  - **来源与痕迹**：施工图新增 Provenance Ledger；状态模板升到 schema 3（`materials` 增 carrier/material_type/origin/locator，`knowledge_nodes` 增 kind/sources/personal_marks）；
  - **新增 IELTS 域**：资料类型判定、知识单元抽取与合并、来源记录、组织轴与 IA 草案、语言学习页面原型、增量并入流程——不预设四科结构，不编造资料里没有的内容。
