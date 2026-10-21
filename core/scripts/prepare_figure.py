#!/usr/bin/env python
"""Prepare a full source page, crop candidate and side-by-side review without altering the source.

Python + Pillow. PDF inputs optionally use existing pypdfium2 or PyMuPDF.
No box -> whole page. --box is normalized xyxy on the WHOLE rendered page.
This tool does not recognize terminals, infer diagrams, or certify completeness.
"""
import argparse
import hashlib
import json
import math
import re
from pathlib import Path


def load_page(source, page_number, scale):
    from PIL import Image
    if source.suffix.lower() != '.pdf':
        if page_number != 1:
            raise ValueError('Image inputs have one page; omit --page or use 1.')
        with Image.open(source) as image:
            image.load()
            return image.convert('RGB'), 'pillow'
    try:
        import pypdfium2
    except ImportError:
        pypdfium2 = None
    if pypdfium2 is not None:
        with pypdfium2.PdfDocument(str(source)) as doc:
            if not 1 <= page_number <= len(doc):
                raise ValueError(f'Page {page_number} outside 1..{len(doc)}')
            page = doc[page_number - 1]
            try:
                bitmap = page.render(scale=scale)
                try:
                    return bitmap.to_pil().convert('RGB').copy(), 'pdfium'
                finally:
                    bitmap.close()
            finally:
                page.close()
    try:
        import fitz
    except ImportError as exc:
        raise ValueError('PDF rendering needs existing pypdfium2 or PyMuPDF. Use an available renderer and pass its PNG instead; no package was installed.') from exc
    with fitz.open(str(source)) as doc:
        if not 1 <= page_number <= len(doc):
            raise ValueError(f'Page {page_number} outside 1..{len(doc)}')
        pix = doc[page_number - 1].get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
        return Image.frombytes('RGB', (pix.width, pix.height), pix.samples), 'pymupdf'


def prepare(source, output, figure_id='FIG-01', page=1, box=None, padding=16, scale=2.5):
    from PIL import Image, ImageDraw
    source, output = Path(source).resolve(), Path(output).resolve()
    if not source.is_file():
        raise ValueError('Source is not a file: ' + str(source))
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.-]*', figure_id):
        raise ValueError('id must be a filename-safe stable ID, starting with a letter or digit.')
    if page < 1 or not math.isfinite(scale) or scale <= 0 or padding < 0:
        raise ValueError('page/scale must be positive; padding must be non-negative.')
    requested = list(box) if box is not None else [0.0, 0.0, 1.0, 1.0]
    if len(requested) != 4 or not all(math.isfinite(v) for v in requested):
        raise ValueError('box must contain four finite normalized numbers.')
    x0, y0, x1, y1 = requested
    if not (0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1):
        raise ValueError('box must satisfy 0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1.')
    paths = {kind: output / f'{figure_id}-{kind}.{ext}' for kind, ext in
             [('source', 'png'), ('candidate', 'png'), ('comparison', 'png'), ('review', 'json')]}
    if any(p == source for p in paths.values()):
        raise ValueError('Output would overwrite the source.')
    existing = [str(p) for p in paths.values() if p.exists()]
    if existing:
        raise ValueError('Review files already exist; choose a new --out or --id: ' + ', '.join(existing))
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    full, renderer = load_page(source, page, scale)
    w, h = full.size
    pixels = [max(0, math.floor(x0*w)-padding), max(0, math.floor(y0*h)-padding),
              min(w, math.ceil(x1*w)+padding), min(h, math.ceil(y1*h)+padding)]
    candidate = full.crop(pixels)
    # Draw only on a copy; the saved source page and source file stay untouched.
    marked = full.copy()
    ImageDraw.Draw(marked).rectangle([pixels[0], pixels[1], pixels[2]-1, pixels[3]-1],
                                    outline='#d32f2f', width=max(2, round(w/500)))
    preview = Image.new('RGB', (1440, 800), '#edf2f7')
    draw = ImageDraw.Draw(preview)
    draw.text((16, 10), 'FULL SOURCE + CROP BOX', fill='black')
    draw.text((736, 10), 'CANDIDATE - REVIEW REQUIRED', fill='black')
    for x, image in [(0, marked), (720, candidate)]:
        small = image.copy()
        small.thumbnail((688, 744))
        preview.paste(small, (x+(720-small.width)//2, 40+(744-small.height)//2))
    record = {'figure_id': figure_id, 'source': str(source), 'source_sha256': digest,
              'page_1based': page, 'renderer': renderer, 'render_scale': scale if source.suffix.lower()=='.pdf' else None,
              'render_size': [w, h], 'requested_normalized_xyxy': requested, 'padding_pixels': padding,
              'effective_pixel_xyxy': pixels, 'candidate_size': list(candidate.size),
              'status': 'candidate-needs-review',
              'review': {'source_and_crop_seen': False, 'content_verified': False,
                         'note': 'File generation is not evidence of semantic completeness or browser rendering.'},
              'files': {key: path.name for key, path in paths.items()}}
    output.mkdir(parents=True, exist_ok=True)
    full.save(paths['source']); candidate.save(paths['candidate']); preview.save(paths['comparison'])
    paths['review'].write_text(json.dumps(record, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--out', dest='output', type=Path, required=True)
    parser.add_argument('--id', default='FIG-01', dest='figure_id')
    parser.add_argument('--page', type=int, default=1)
    parser.add_argument('--box', nargs=4, type=float, metavar=('X0','Y0','X1','Y1'))
    parser.add_argument('--padding', type=int, default=16)
    parser.add_argument('--scale', type=float, default=2.5)
    args = parser.parse_args()
    try:
        result = prepare(**vars(args))
    except (ValueError, ImportError) as exc:
        parser.exit(2, str(exc)+'\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
