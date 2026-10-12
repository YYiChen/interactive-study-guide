# Interactive Study Guide v4.0 Final

这是一个面向工科/工程数学课程的长期增量学习页 Skill。

## 设计目标

- 资料可以分批、乱序、不断补充；
- 教师课件可以很简略，模型负责补齐“为了学会当前内容所必需”的知识；
- 零基础读者不会遇到突然出现的符号、公式或解题方法；
- 后续新材料优先回填到正确知识位置，不在页面末尾堆补丁；
- 重构允许去重和压缩，但不允许知识静默缩水；
- 考试边界使用证据权重，材料未齐时“没出现”不等于“不考”；
- UI 引擎与教学规则分离，具体学科公式不写进通用 Skill。

## 推荐工作流

1. 读取 `SKILL.md`；
2. **判定页面原型**（exam-prep / principle / review / custom，见 `references/page-archetypes.md`），向用户明示所选原型；
3. 用 `assets/planning-workbench.md` 建内部施工图；
4. 基于 `assets/study-page-template.html`（exam-prep 完整参考实现）生成/修改页面，其他原型按裁剪 SOP 删减；
5. 新材料到来时更新 `course-state.json` 和施工图，再局部修改页面；
6. 运行 `node scripts/check_page.js page.html`（校验器会读取 `data-archetype` 并按原型调整期望）；
7. 做 Coverage / Dependency / Solution-backward / Correctness 四类审计。

## 版本说明

v4.0 是一次 consolidation：保留成熟的 sidebar、scroll-spy、跨页跳转、折叠和验证工具；删除旧版“每题必须 prep”“每页固定自检”等互相冲突的规则；振动学等具体经验不再作为通用规则。

v5.0 做两件事：

- **页面原型机制**：结构由读者任务决定，不再写死“总览→板块→例题→训练→总结”。`principle`（原理/实验讲解）与 `review`（复习速查）原型下例题/训练默认关闭；模板重新定位为原型库中 exam-prep 的参考实现，带裁剪标记；
- **图与交互硬规则**：每个知识板块至少 1 个视觉锚点；落入参数敏感性/时间演化/几何关系/图形读法/方法对比五类之一的图默认必须可交互；图注三要素；checker 恢复图号唯一性、坐标轴说明、视觉锚点与交互存在性检查，并按原型调整板块期望。
