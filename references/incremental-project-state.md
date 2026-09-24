# Incremental Project State

## 1. Material Event

任何后续输入都视为 Material Event，不限定文件类型、章节、来源或顺序。

可能关系：
- 新范围；
- 已有范围补充；
- 更完整版本；
- 修订/纠错；
- 重复；
- 冲突；
- 新的考核证据；
- 用户反馈暴露的教学缺口。

## 2. Coverage State

每个知识区域至少可标：

- `OPEN`：线索很少；
- `PARTIAL`：有部分内容，但明显可能继续补；
- `SUBSTANTIAL`：当前证据较充分；
- `DECLARED_COMPLETE`：用户明确说明该范围已完整。

只有后两种状态下，材料缺席才可能形成较弱的负证据。

## 3. Assessment Status

- `confirmed`
- `strongly-supported`
- `plausible`
- `prerequisite-only`
- `unknown`

谨慎使用 `not-tested`。只有用户明确给出范围或材料非常充分时才使用。

## 4. Stable Knowledge IDs

重要知识节点使用稳定内部 ID，例如 `K-ALG-003`、`K-THERMO-007`。

展示标题可变，稳定 ID 尽量不变。

结构重排时保留旧锚点 alias，避免旧链接失效。

## 5. Delta Log

每轮记录：
- 新增了什么；
- 修改了什么；
- 哪些知识权重上升/下降；
- 哪些依赖被发现缺失；
- 哪些旧内容被纠错；
- 哪些结构发生移动。

## 6. Impact Levels

- `NO_STRUCTURAL_CHANGE`
- `LOCAL_ENRICHMENT`
- `PREREQUISITE_BACKFILL`
- `ASSESSMENT_REWEIGHT`
- `STRUCTURAL_REORDER`
- `CORRECTION_OR_CONFLICT`

先定 impact，再改页面。

## 7. 状态文件不是知识真相

`course-state.json` 只是索引和决策记录。

若状态与材料/当前 HTML 冲突，以重新核对后的证据为准，并更新状态。
