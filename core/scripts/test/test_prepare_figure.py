"""Offline invariants for crop coordinates, source preservation and honest review state."""
import hashlib
import importlib.util
import json
import os
import subprocess
import sys
from pathlib import Path
import tempfile
import unittest
from PIL import Image, ImageDraw

spec=importlib.util.spec_from_file_location('prepare_figure',Path(__file__).parents[1]/'prepare_figure.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

class FigurePreparationTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(dir=os.environ.get('ISG_TEST_TMP'));self.root=Path(self.tmp.name)
        self.source=self.root/'original.png'
        image=Image.new('RGB',(300,200),'white')
        draw=ImageDraw.Draw(image);draw.rectangle((30,40,269,159),outline='black',width=2)
        draw.rectangle((140,150,160,159),fill='blue')
        image.save(self.source)
        self.original=self.source.read_bytes()
    def tearDown(self):self.tmp.cleanup()
    def test_no_box_retains_complete_page(self):
        result=module.prepare(self.source,self.root/'full')
        self.assertEqual(result['effective_pixel_xyxy'],[0,0,300,200])
        with Image.open(self.root/'full/FIG-01-candidate.png') as im:
            self.assertEqual(im.size,(300,200));self.assertEqual(im.getpixel((150,155)),(0,0,255))
    def test_normalized_box_padding_and_source_immutable(self):
        result=module.prepare(self.source,self.root/'crop',box=[.1,.2,.9,.8],padding=10)
        self.assertEqual(result['effective_pixel_xyxy'],[20,30,280,170])
        self.assertEqual(result['candidate_size'],[260,140])
        self.assertEqual(self.source.read_bytes(),self.original)
        self.assertEqual(result['source_sha256'],hashlib.sha256(self.original).hexdigest())
        with Image.open(self.root/'crop/FIG-01-source.png') as im:
            self.assertEqual(im.getpixel((20,30)),(255,255,255))
    def test_invalid_box_never_writes(self):
        for box in [[.9,.1,.1,.8],[-.1,0,1,1],[0,0,1,float('nan')]]:
            with self.assertRaises(ValueError):module.prepare(self.source,self.root/'bad',box=box)
        self.assertFalse((self.root/'bad').exists())
    def test_candidate_is_not_claimed_verified(self):
        module.prepare(self.source,self.root/'review')
        record=json.loads((self.root/'review/FIG-01-review.json').read_text(encoding='utf-8'))
        self.assertEqual(record['status'],'candidate-needs-review')
        self.assertFalse(record['review']['content_verified'])
        self.assertFalse(record['review']['source_and_crop_seen'])
        self.assertTrue((self.root/'review/FIG-01-comparison.png').is_file())
    def test_existing_review_is_not_overwritten(self):
        module.prepare(self.source,self.root/'same')
        candidate=self.root/'same/FIG-01-candidate.png';before=candidate.read_bytes()
        with self.assertRaises(ValueError):module.prepare(self.source,self.root/'same',box=[.2,.2,.8,.8])
        self.assertEqual(candidate.read_bytes(),before)
    def test_page_number_and_id_validation(self):
        with self.assertRaises(ValueError):module.prepare(self.source,self.root/'badpage',page=2)
        with self.assertRaises(ValueError):module.prepare(self.source,self.root/'badid',figure_id='../escape')
    def test_documented_cli_creates_review(self):
        result=subprocess.run([sys.executable,str(Path(module.__file__)),str(self.source),
            '--out',str(self.root/'cli'),'--id','FIG-CLI','--box','.1','.2','.9','.8'],
            capture_output=True,encoding='utf-8',errors='replace')
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertTrue((self.root/'cli/FIG-CLI-review.json').is_file())

if __name__=='__main__':unittest.main()
