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

图资产同理使用稳定 `fig_id`（`FIG-<单元>-<序号>`），视觉需求使用 `vr_id`（`VR-<单元>-<序号>`）；一旦被页面、题目或答案引用，就不再改名。

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

## 8. 图资产状态（并入本文件，不另建系统）

图资产与视觉需求**不单独维护一套登记表**：图资产写进 Provenance Ledger 的扩展列（`fig_id` / `locator` / `path` / `role` / `integrity`），视觉需求写进 `course-state.json` 的 `visual_requirements`，状态词统一为：

`located` → `extracted` → `placed` → `tech-checked` → `content-verified`，异常时 `open-issue`。

含义与判据见 `visual-material.md` §6。**"文件存在"只到 `extracted`，不是通过。**

## 9. 图的增量事件

图的变化也是 Material Event，走同一套 impact 流程（先更新图资产与需求表，再改页面）：

| 事件 | impact 判断 | 必做动作 |
|---|---|---|
| 新材料带来新图 | `LOCAL_ENRICHMENT` | 新增 `fig_id`，判断覆盖哪条 `vr_id` |
| 同一张图找到更清晰版本 | `NO_STRUCTURAL_CHANGE` | 保留 `fig_id` 换 `path`，旧路径记 Delta Log |
| 课程版本替换（标注/参数不同） | `CORRECTION_OR_CONFLICT` | 登记版本差异，不静默覆盖；页面取当前口径 |
| 同图不同标注 | `CORRECTION_OR_CONFLICT` | 同一 `fig_id` 多条 `locator`，注明差异来源 |
| 旧图失效/丢失/被移动 | `NO_STRUCTURAL_CHANGE` | 状态回退 `located` 或 `open-issue`，清死链 |
| 图对应的知识节点或题目被移动 | `STRUCTURAL_REORDER` | 同步 `links` 与 `anchor`，旧锚点留 alias |
| 重绘后发现结构错误 | `CORRECTION_OR_CONFLICT` | 该图降级 `open-issue`，修正后重做五条一致性检查 |
| 源材料之间冲突 | `CORRECTION_OR_CONFLICT` | 按证据权重定页面口径，冲突双方都记录 |

替换图片时检查**所有引用位置**：正文引用、图号编号、题目、答案、总结页。只改可见的那一处，等于制造图文不一致。
