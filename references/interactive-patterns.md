# Interactive Patterns · 交互与图规范

交互是教学工具，不是装饰；但“工具”意味着该出现时不出现就是失职。

## 1. 什么时候必须做交互

出现下列任一情况，**必须配可交互演示**（滑块 / 播放 / 拖动），不允许只用文字或静态图糊过去：

1. **参数敏感性**：一个参数变化会改变结果、曲线形状、区域或数值——“参数变大，根会怎么移动”这类问题用文字描述成本很高；
2. **时间演化**：现象是过程性的——“谁先稳定下来”“振荡怎么衰减”；
3. **几何关系**：拖动位置、角度、长度或边界，几何量与公式结果同步变化；
4. **图形读法**：需要训练“从图上读一个量”的技能——“从衰减曲线上量出 δ”；
5. **方法对比**：同一输入下切换两种近似 / 模型 / 数值方法，看差异和适用范围；
6. **量级感**：数字跨越几个数量级或反直觉——“换个摆长周期怎么变”。

原则：交互要回答一个**具体问题**，且读数必须**与公式自洽**（用户会拿手算对照）。宁可少而准，不可无。

## 2. 不适合做交互的情况

- 只是为了“页面更酷”；
- 静态图已经足够（例如：只需识别部件名称的示意图）；
- 交互结果无法保证和公式一致（算不清就不要交互，改静态图 + 文字结论）；
- 动效会掩盖核心概念；
- 参数太多导致读者不知道该看什么（超过 3 个主动参数的交互重新设计）。

## 3. 最低要求（每个交互 / 每张图都要有）

图注三要素，缺一不可：

1. **它让什么变得可见**；
2. **应观察什么**；
3. **最终结论是什么**（静态结论，不依赖交互也能读到）。

其他硬要求：

- 交互旁必须有静态结论；JS 失效时核心知识不丢失（静态图作为降级兜底，见 §5）；
- 数值显示、曲线、文字结论相互一致，读数必须等于公式计算值；
- 关键结论不能只靠颜色或动画表达；交互控件有清晰文字标签；
- 每个知识板块至少 1 个视觉锚点（图 / 交互 / 可操作几何），纯文字板块不交付。

## 4. 四种可抄的代码骨架

所有模式共用两条工程纪律：

- **每个交互独立 `(function(){ … })()` 自执行 + 元素守卫**（`if(!el) return;`），一个交互出错不影响其他交互与导航；
- **初始化也要跑一次** `upd()`，否则首屏读数与图形不同步。

### 模式 1：滑块联动（参数 → 曲线 + 读数）

```html
<div class="diag" id="demo-slider" style="text-align:left;">
  <div style="font-size:13px;margin:0 16px 6px;">🎛 <b>参数探险器</b>：拖动滑块看曲线与读数怎么变</div>
  <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:flex-start;">
    <svg id="sSvg" width="430" height="250" viewBox="0 0 430 250" role="img" aria-label="参数-结果曲线"><!-- 静态轴/标签 --></svg>
    <div style="min-width:250px;">
      <div>参数 a = <b id="sAv">1.00</b>
        <input type="range" id="sA" min="0.1" max="3" step="0.05" value="1" style="width:100%;accent-color:var(--accent);">
      </div>
      <div id="sInfo" style="font-size:12.5px;color:var(--muted);"></div>
    </div>
  </div>
  <div class="cap">交互 · 它让“参数如何改变结果”变得可见；观察曲线形状与读数；结论：……</div>
</div>
<script>
(function(){
  var s = document.getElementById("sA"); if(!s) return;
  var info = document.getElementById("sInfo");
  function upd(){
    var a = parseFloat(s.value);
    /* ① 按公式计算 → ② 更新图形属性 → ③ 更新读数（读数必须等于公式值） */
    document.getElementById("sAv").textContent = a.toFixed(2);
    info.innerHTML = "当前结果：<b>" + /* 公式计算值 */ + "</b>";
  }
  s.addEventListener("input", upd); upd();
})();
</script>
```

### 模式 2：分量分解（把“总量”拆成可见的组成部分）

画两条分量曲线（虚线）+ 一条合成曲线（实线），让“相加”这件事看得见。适用于“两个常数相加”“慢项 + 快项”这类关键理解点。要点：图注写明“虚线相加 = 实线”，并给每条曲线一个能口述的名字。

### 模式 3：播放式动画（时间过程）

`requestAnimationFrame` 推进时间，渐进绘制曲线并移动游标；按钮控制播放 / 暂停 / 重播。

```javascript
var playing = false, i = 0, last = 0;
function frame(ts){
  if(!last) last = ts;
  var dt = Math.min(0.05, (ts - last) / 1000); last = ts;   // dt 封顶，否则切页回来跳帧
  if(playing){ i += dt / DURATION * N; if(i >= N){ i = N; playing = false; } }
  // 用 arr.slice(0, Math.floor(i)) 生成局部 polyline，并移动圆点
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

结束时把按钮文案改成“↻ 重播”。

### 模式 4：连续循环动画（运动 / 能量）

`rAF` 里递增相位并重画：运动部件、折线、能量条宽度同时更新。要点：视觉尺度要标注（如“动画已加速 ×3”），避免读者误判真实快慢；给“暂停 / 继续”按钮。

## 5. 图容器契约与静态降级

- 图统一用 `.diag` 容器 + `.cap` 图注（模板已含样式），SVG 手写内联：坐标轴 + 单位 + 正方向 + 关键标记；
- 静态元素写在 SVG 里，只有“会动的”用 JS 更新（每个动态元素给唯一 id）；
- **静态降级**：交互图必须同时是一张完整的静态图——JS 失效时 SVG 部分仍可读，图注三要素不依赖交互；
- 标注防重叠：远处标签用细引导线（`<line stroke="#cbd5e1">`）连回对象，不要硬挪坐标；一张图标注控制在 8 个以内，同类信息合并成带单位说明的标签；
- 多套坐标系并存时（如复平面 / 相位三角 / 时间图），必须在图旁注明各自横竖轴基准并给对照表；
- 图号全页唯一（“图 A / 图 B”式编号），checker 会查重；
- 复查方法：整页截图 → `scripts/slice_png.py` 切条 → 逐条目视（这一步不能省）。

折叠与侧栏导航的实现引擎在模板内（`assets/study-page-template.html`），不要在交互代码里重复造。
