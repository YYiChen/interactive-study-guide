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
2. 用 `assets/planning-workbench.md` 建内部施工图；
3. 基于 `assets/study-page-template.html` 生成/修改页面；
4. 新材料到来时更新 `course-state.json` 和施工图，再局部修改页面；
5. 运行 `node scripts/check_page.js page.html`；
6. 做 Coverage / Dependency / Solution-backward / Correctness 四类审计。

## 版本说明

v4.0 是一次 consolidation：保留成熟的 sidebar、scroll-spy、跨页跳转、折叠和验证工具；删除旧版“每题必须 prep”“每页固定自检”等互相冲突的规则；振动学等具体经验不再作为通用规则。
