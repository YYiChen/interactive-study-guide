#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
make_variant.py — 生成"自动操作副本"，用于对交互式页面做功能测试（而不是只看静态截图）。

用法（可组合多个动作，按出现顺序执行）：
  python make_variant.py in.html out.html \
      --click "#page-demo .revealbtn" --click-index 1 \
      --click "总索引里含某文字的链接" \
      --slider "#demoSlider:0.75" \
      --probe "document.querySelectorAll('.revealwrap.open').length" \
      --delay 800

各参数：
  --click <选择器>        选中第一个匹配元素并 .click()（若元素文本含中文，可直接传任意 CSS 选择器）
  --click-text <文字>     在所有 <a> 中找文本包含该文字的元素并点击（模拟"点索引跳转"）
  --click-index <n>       配合 --click 使用，点击第 n 个匹配元素（从 0 开始）
  --slider <选择器:值>    设置 range 值并派发 input 事件（触发联动）
  --probe <JS 表达式>      结果写入 document.title，前缀 RESULT|
  --delay <ms>            执行动作前的等待（默认 700ms，等 MathJax 排版）

配合无头浏览器抓取探针结果：
  msedge --headless=new --virtual-time-budget=15000 --dump-dom "file:///<out.html>" > dom.html
  然后在 dom.html 里搜 RESULT| 即可看到探针输出（如 hash、show 状态、scrollY）。

为什么需要：本类页面的 bug 多发生在"点击/拖动之后"（折叠高度、跨页跳转、联动读数），
静态截图看不出来；用注入脚本自动操作 + 探针回读，才能可靠验证。
"""
import re
import sys


def parse_args(argv):
    opts = {"click": None, "click_index": 0, "click_text": None,
            "slider": None, "probe": None, "delay": 700}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--click":
            opts["click"] = argv[i + 1]; i += 2
        elif a == "--click-index":
            opts["click_index"] = int(argv[i + 1]); i += 2
        elif a == "--click-text":
            opts["click_text"] = argv[i + 1]; i += 2
        elif a == "--slider":
            opts["slider"] = argv[i + 1]; i += 2
        elif a == "--probe":
            opts["probe"] = argv[i + 1]; i += 2
        elif a == "--delay":
            opts["delay"] = int(argv[i + 1]); i += 2
        else:
            i += 1
    return opts


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(2)
    src, dst = sys.argv[1], sys.argv[2]
    o = parse_args(sys.argv[3:])

    html = open(src, encoding="utf-8").read()
    steps = []
    if o["click"]:
        sel = o["click"].replace("\\", "\\\\").replace('"', '\\"')
        steps.append('var els=document.querySelectorAll("%s"); if(els.length>%d) els[%d].click();'
                     % (sel, o["click_index"], o["click_index"]))
    if o["click_text"]:
        txt = o["click_text"].replace("\\", "\\\\").replace('"', '\\"')
        steps.append('var as=document.querySelectorAll("a"); for(var i=0;i<as.length;i++){'
                     ' if(as[i].textContent.indexOf("%s")>=0){ as[i].click(); break; } }' % txt)
    if o["slider"]:
        sel, val = o["slider"].rsplit(":", 1)
        sel = sel.replace('"', '\\"')
        steps.append('var sl=document.querySelector("%s"); if(sl){ sl.value=%s;'
                     ' sl.dispatchEvent(new Event("input")); }' % (sel, val))

    probe = o["probe"] or 'location.hash'
    probe = probe.replace("\\", "\\\\").replace('"', '\\"')
    probe = probe.replace("\n", " ")

    inject = (
        '<script>window.addEventListener("load", function(){ setTimeout(function(){'
        + " ".join(steps) +
        ' setTimeout(function(){ try{ document.title = "RESULT|" + (%s); }'
        ' catch(e){ document.title = "RESULT|probe-error:" + e.message; } }, 900);'
        ' }, %d); });</script>' % (probe, o["delay"])
    )
    html = html.replace("</body>", inject + "</body>")
    open(dst, "w", encoding="utf-8").write(html)
    print("written", dst)


if __name__ == "__main__":
    main()
