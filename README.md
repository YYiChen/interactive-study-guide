# Interactive Study Guide v5.3

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

1. 首次读 `SKILL.md` 与 `core/references/execution-profiles.md`，选择 guided / autonomous；后续按影响加载，不反复读完整 skill；
2. **判定 domain**（`engineering` / `ielts` / 未注册按 custom 处理），读 `domains/<domain>/domain.md` 并按其清单加载领域规则；
3. 跨领域时声明可合理判断的主/附领域继续；会改变范围且无法判断时才询问；
4. **判定结构原型**（exam-prep / principle / review / custom，见 `core/references/page-archetypes.md`），向用户明示所选原型；
5. 用短工作单或项目已有等效记录维护必要规划（`core/assets/planning-workbench.md`）（含 Provenance Ledger；材料含图时还要建 Figure Asset Ledger 与 Visual Requirements，见 `core/references/visual-material.md`）；
6. 领域要求时（如 IELTS）先给用户 IA 草案并等确认：`domains/ielts/organization.md` §5；
7. guided 默认使用 `core/assets/study-page-template.html`；autonomous 可自选等效组件与结构，维护页面契约，不必复演模板裁剪 SOP；
8. 新材料到来时更新 `course-state.json` 与施工图，再局部修改页面；
9. 运行 `node core/scripts/check_page.js page.html`（读取 `data-archetype` / `data-domain`，声明 `data-visual-contract="v1"` 时校验图的完整性）；
10. 按本轮影响取得 Coverage / Dependency / Correctness / Technical 的适用证据，领域可加专项项；无新修改/失败/疑点即结束，不固定全量复测。

## 当前执行路径

guided 提供成熟模板、分单元步骤、裁图对照工具与可运行示例；autonomous 自定布局/组件/操作顺序，以等效证据替代机械填表。两者共用知识正确、来源与补充可区分、内容不缩水、图文式题一致的质量底线。

模式不是按模型名称绑定，不靠模型自报能力升级。用户/项目设置优先，未知条件采用 guided；有同类任务证据且用户允许时可 autonomous。交互按学习收益选择；验证按改动风险缩放，无新变化/疑点即结束。参考 `core/references/execution-profiles.md`。

`python core/scripts/prepare_figure.py input.png --id FIG-01 --out review/fig01` 可生成整页、候选和框选对照；PDF 支持通过现有 PDFium/PyMuPDF 使用，不自动安装。

## 版本说明

旧版条目仅为历史记录；与当前执行方式冲突时，以 v5.3 及入口规则为准。

- **v5.3（当前）**：引导/自主执行路径；按需加载与规划；工具支持的候选裁图对照；原题/辅助图/改编区分；按风险验证及明确停止条件。

- **v4.0**：consolidation——保留成熟的 sidebar、scroll-spy、跨页跳转、折叠与验证工具；删除“每题必须 prep”“每页固定自检”等互相冲突的规则；具体课程经验不再作为通用规则。
- **v5.0**：①页面原型机制——结构由读者任务决定，例题/训练按原型取舍，模板定位为 exam-prep 的参考实现；②图与交互硬规则——每个知识板块至少 1 个视觉锚点、图型分级 A/B/C、图注三要素，checker 增加相应检查。
- **v5.1**：Core + Domain 分层。
  - **目录**：通用规则迁入 `core/`（`references/`、`assets/`、`scripts/`），领域规则新建 `domains/`（`engineering`、`ielts`）；
  - **调度**：`SKILL.md` 新增 §0 领域调度与页面 `data-domain` 声明；未注册领域按 custom 处理；
  - **通用层中性化**：工程专属示例（学科主线、Moody/K_L/ε–NTU 等图例）移入 `domains/engineering/domain.md`，core 不再含学科专属例子；
  - **来源与痕迹**：施工图新增 Provenance Ledger；状态模板升到 schema 3（`materials` 增 carrier/material_type/origin/locator，`knowledge_nodes` 增 kind/sources/personal_marks）；
  - **新增 IELTS 域**：资料类型判定、知识单元抽取与合并、来源记录、组织轴与 IA 草案、语言学习页面原型、增量并入流程——不预设四科结构，不编造资料里没有的内容。
- **v5.2**：图像材料从“配图要求”升级为可验收机制。
  - **并行读取**：读数材时必须同时产出 Figure Asset Ledger（`fig_id` / 定位 / 路径 / 上下文 / 关联 / 完整性 / 状态）；只留 `[IMG]` 不算读完（`core/references/visual-material.md` §1）；
  - **视觉需求**：配图充分性改由 Visual Requirement 判定（读者要追踪连接、判断方向极性、读波形、跟随信号流等 → `required`），“每板块至少一张图”降为下限提示（`SKILL.md` §14、`content-rules.md` §6）；
  - **素材降级阶梯**：解析图 → 内嵌图 → 原页渲染裁剪 → 重绘（须核验）→ 外部权威（标注补充），并写明技术边界（矢量抽图会丢线路、裁剪不能丢端子/极性）；
  - **图的三类角色**：`evidence` / `teaching` / `demo`；交互优先级明确为“静态结构正确 + 信息可见 + 可读”先于交互丰富度（`interactive-patterns.md`）；
  - **题图优先原题**：例题/训练/往年卷的图默认 `evidence`，禁止用自绘 SVG 顶替；确需重绘须经用户确认、图注标注“依据原题重绘”、并保留原图对照（`visual-material.md` §3.1、`SKILL.md` §7）；checker 对 practice/examples 页签中声明为 teaching/demo 的图给出警告。
  - **工程核验口径**：`domains/engineering/domain.md` §8 给出电路/器件图与其他工程结构的核验维度与禁止事项；
  - **状态与增量**：图资产并入 Provenance Ledger，状态阶梯 `located → extracted → placed → tech-checked → content-verified`（异常 `open-issue`），8 类图事件走既有 impact 流程；状态模板升到 schema 4（新增 `figures` / `visual_requirements`，旧文件仍可用）；
  - **检查器**：`data-visual-contract="v1"` 的页面严格校验（必需视觉需求缺图、图 ID 重复、空图容器、`[IMG]` 占位、本地图片缺失、图需求引用不存在）；未声明契约的旧页面保持原有行为，只给迁移提示；并明确 checker 不能证明图的结构或真实渲染。
