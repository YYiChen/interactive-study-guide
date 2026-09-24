#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
slice_png.py — 把超长页面截图切成便于目视的条带，并自动定位内容区间。

用法：
  1) 切成条带（默认每条 1400px 高）：
       python slice_png.py shot.png outdir
       python slice_png.py shot.png outdir --band 1200 --prefix demo_

  2) 只找内容区间（判断"页面到此结束"或"某段是不是空白"）：
       python slice_png.py shot.png outdir --extent

  3) 按给定 y 区间裁剪（快速看某个区域）：
       python slice_png.py shot.png outdir --crop 3000 4500

为什么需要：无头浏览器整页截图往往上万像素高，直接看图会被压缩到看不清；
先切成条带再逐条目视，是发现"标注重叠 / 内容被裁 / 布局错位"最可靠的办法。
"""
import os
import sys

try:
    from PIL import Image
    import numpy as np
except ImportError:
    sys.exit("需要 Pillow 与 numpy。请在虚拟环境中安装，例如：\n"
             "  python -m venv .venv && .venv/bin/pip install pillow numpy   (Windows: .venv\\Scripts\\pip install pillow numpy)\n"
             "不要全局 pip install，以免污染本机其他项目的依赖。")


def load(path):
    return Image.open(path)


def content_extent(im, thresh=245, min_dark=12):
    """返回 (first_row, last_row)：有内容的像素行范围（用于判断页面是否只有顶部一小段）。"""
    a = np.asarray(im.convert("L"))
    rows = (a < thresh).sum(axis=1)
    idx = np.where(rows >= min_dark)[0]
    if len(idx) == 0:
        return (0, 0)
    return (int(idx.min()), int(idx.max()))


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    path, outdir = sys.argv[1], sys.argv[2]
    args = sys.argv[3:]
    band = 1400
    prefix = "band_"
    do_extent = "--extent" in args
    crop = None
    if "--band" in args:
        band = int(args[args.index("--band") + 1])
    if "--prefix" in args:
        prefix = args[args.index("--prefix") + 1]
    if "--crop" in args:
        i = args.index("--crop")
        crop = (int(args[i + 1]), int(args[i + 2]))

    os.makedirs(outdir, exist_ok=True)
    im = load(path)
    w, h = im.size

    if do_extent:
        a, b = content_extent(im)
        print("size=%dx%d  content_rows=%d..%d" % (w, h, a, b))
        return

    if crop:
        y0, y1 = crop
        dst = os.path.join(outdir, "%scrop_%d_%d.png" % (prefix, y0, y1))
        im.crop((0, max(0, y0), w, min(h, y1))).save(dst)
        print("saved", dst)
        return

    n = (h + band - 1) // band
    for i in range(n):
        y0, y1 = i * band, min(h, (i + 1) * band)
        dst = os.path.join(outdir, "%s%02d.png" % (prefix, i))
        im.crop((0, y0, w, y1)).save(dst)
    a, b = content_extent(im)
    print("size=%dx%d  bands=%d (band=%d)  content_rows=%d..%d" % (w, h, n, band, a, b))


if __name__ == "__main__":
    main()
