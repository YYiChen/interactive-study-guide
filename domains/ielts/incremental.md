# Incremental · 雅思资料的增量并入

对齐 `../../SKILL.md` §12，把动作换成本域的具体形态。每次新增雅思材料都走这一遍，不整页重写。

## 1. 流程

1. **Identify**：新资料是全新范围、补充、修订、重复，还是冲突（先按 `material-taxonomy.md` 判定类型）；
2. **Extract Delta**：只取真正新增或改变的信息，逐条登记；
3. **Classify Impact**：`NO_STRUCTURAL_CHANGE` / `LOCAL_ENRICHMENT` / `PREREQUISITE_BACKFILL` / `ASSESSMENT_REWEIGHT` / `STRUCTURAL_REORDER` / `CORRECTION_OR_CONFLICT`；
4. **Find existing nodes**：按 `knowledge-units.md` §3 的信号找已有节点（同功能 / 同题型 / 同动作 / 同素材族）；
5. **Merge at node level**：更新节点的内容、来源与示范——**不是**在页面末尾追加；
6. **Keep provenance**：新来源加入 `sources[]`，多来源分别列出；
7. **Update state**：更新 `course-state.json` 与施工图（`../../core/assets/planning-workbench.md`）；
8. **Re-audit**：覆盖、依赖、来源完整性、重复页面，并跑 checker。

## 2. 合并决策表

| 新内容 | 处理 |
|---|---|
| 与已有节点完全不同 | 新建节点，挂到最合适的板块（必要时先调整板块，再改页面） |
| 同一动作的不同说法 | 并入已有节点，作为补充表述 + 新来源 |
| 同一语言功能的更多素材 | 挂到该功能节点的素材清单，不新建节点 |
| 同题型的更多注意事项 | 并入题型节点，按“何时适用”分组 |
| 更完整的版本 | 替换主内容，旧版本要点进 note 或 `<details class="deep">`，不静默删 |
| 与旧内容冲突 | 保留双口径 + 来源 + 时间，记 `CORRECTION_OR_CONFLICT`，必要时请用户裁决主口径 |
| 看起来像已知内容但动作不同 | 新建节点并互相链接，不硬合并 |

## 3. 禁止

- 页面末尾追加“补充 1 / 2 / 3”；
- 重新生成一个“更整洁”的新页面（知识静默缩水）；
- 同一技巧出现第二个完整版解释（破坏 Canonical Teaching Location）；
- 覆盖旧来源：新资料进来后旧来源消失；
- 把冲突静默按“新的一定对”处理；
- 把本轮没处理的材料悄悄丢掉（要么纳入，要么登记“暂不纳入 + 原因”）。

## 4. 回归检查清单

- [ ] 每个新条目都有归宿（节点 / 素材清单 / note）；
- [ ] 旧节点的稳定 ID 与锚点未变；
- [ ] 受影响节点的 `sources[]` 是增加而不是替换；
- [ ] 个人痕迹没有被摘要掉；
- [ ] 未观察到的东西没有被写成“不考”；
- [ ] 板块结构与内容仍然一致（没有补丁区）；
- [ ] `node core/scripts/check_page.js page.html` 通过，并人工走一遍导航、折叠与素材表交互。
