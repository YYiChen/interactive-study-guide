# Verification

验收分四层：Coverage、Dependency、Correctness、Technical。

## A. Coverage

- 当前材料的关键概念/公式/任务是否都有归宿；
- 本轮 delta 是否都处理；
- 旧页面知识是否有去向；
- 是否把 unknown 错写成 not-tested；
- 已确认能力是否有正式教学与有效练习。

## B. Dependency

### Symbol Audit
正文每个新符号首次使用前是否定义。

### Prerequisite Audit
随机选 3 个能力，能否从 Baseline Contract 沿前置一路读到。

### Solution-backward Audit
从答案逐步反查正文，任何未教学步骤都要修。

### Duplication Audit
同一知识是否存在多个完整版解释；若有，保留一个 Canonical Teaching Location。

## C. Correctness

关键公式/结论检查：
- 角色；
- 条件；
- 量纲；
- 边界/初值；
- 近似范围；
- 极限情况；
- 数值回代；
- 图文一致。

## D. Technical

运行：

```bash
node scripts/check_page.js page.html
```

输出语义：
- `PASS`：没有脚本能识别的错误或警告；
- `PASS WITH WARNINGS`：没有硬错误，但有需要人工复核的问题；
- `FAIL`：存在结构/语法/ID/导航等硬错误。

随后做真实浏览器目视：
- 页签；
- sidebar；
- scroll-spy；
- gotoText；
- h2/h3 折叠；
- details；
- MathJax；
- 移动端抽屉；
- 动效数值一致性。

## Checker 不能做什么

它不能可靠证明：
- 学科公式正确；
- 前置知识真的完整；
- 某个题型一定会考；
- 某段解释真的适合零基础。

这些必须通过 A/B/C 的人工或模型审计完成。
