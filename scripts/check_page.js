#!/usr/bin/env node
/*
 * Interactive Study Guide v4.0 — static checker
 * Usage: node scripts/check_page.js <page.html>
 *
 * This checker verifies mechanical HTML/UI consistency only.
 * It does NOT prove subject-matter correctness, prerequisite completeness,
 * assessment scope, or pedagogical quality. Those require the audits in
 * references/verification.md.
 */
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/check_page.js <page.html>'); process.exit(2); }
const raw = fs.readFileSync(file, 'utf8');
const html = raw.replace(/<!--[\s\S]*?-->/g, ' ');
const slim = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
let fail = 0, warn = 0;
const out = [];
const FAIL = (s) => { fail++; out.push('  FAIL ' + s); };
const WARN = (s) => { warn++; out.push('  WARN ' + s); };
const INFO = (s) => out.push('  INFO ' + s);

/* 1. inline JS syntax */
out.push('--- inline scripts ---');
const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let m, nScript = 0;
while ((m = scriptRe.exec(html)) !== null) {
  nScript++;
  try { new Function(m[1]); out.push(`  script ${nScript}: OK`); }
  catch (e) { FAIL(`script ${nScript}: ${e.message}`); }
}

/* 2. tag pairing */
out.push('--- tag pairing ---');
for (const tag of ['div','svg','table','ul','ol','li','p','script','section','details','summary','text','g']) {
  const open = (html.match(new RegExp('<' + tag + '(?=[\\s/>])', 'gi')) || []).length;
  const self = (html.match(new RegExp('<' + tag + '(?=[\\s/>])[^>]*/>', 'gi')) || []).length;
  const close = (html.match(new RegExp('</' + tag + '\\s*>', 'gi')) || []).length;
  if (open - self !== close) FAIL(`${tag}: open=${open} self=${self} close=${close}`);
}
if (!fail) out.push('  major tag pairs OK');

/* 3. viewport + ids */
out.push('--- viewport / ids ---');
if (!/<meta[^>]+name=["']viewport["']/i.test(html)) FAIL('missing viewport meta');
else out.push('  viewport OK');
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(x => x[1]);
const dupIds = [...new Set(ids.filter((x,i) => ids.indexOf(x) !== i))];
if (dupIds.length) FAIL('duplicate ids: ' + dupIds.join(', '));
else out.push(`  ids unique (${ids.length})`);

/* 4. tabs */
out.push('--- tabs ---');
const decl = /var\s+TABS\s*=\s*\[([^\]]*)\]/.exec(html);
const declared = decl ? decl[1].split(',').map(x => x.trim().replace(/^["']|["']$/g,'')).filter(Boolean) : [];
if (!declared.length) WARN('TABS declaration not found; dynamic navigation cannot be fully checked');
for (const id of declared) {
  if (!new RegExp(`id=["']page-${id}["']`).test(html)) FAIL(`TABS contains ${id}, but #page-${id} is missing`);
  if (!new RegExp(`id=["']btn-${id}["']`).test(html)) FAIL(`TABS contains ${id}, but #btn-${id} is missing`);
}

/* parse tab bodies */
const tabRe = /<div class=["']tabpage["'] id=["']page-([A-Za-z0-9_-]+)["']>([\s\S]*?)(?=<div class=["']tabpage["'] id=["']page-|$)/g;
const tabs = [];
while ((m = tabRe.exec(slim)) !== null) tabs.push({id:m[1], body:m[2]});

/* 5. gotoText resolution and ambiguity */
out.push('--- gotoText ---');
function candidates(key) {
  const hits = [];
  for (const tb of tabs) {
    for (const h of [...tb.body.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/g)]) {
      const txt = h[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
      if (txt.includes(key)) hits.push(`${tb.id}:heading:${txt.slice(0,48)}`);
    }
    for (const b of [...tb.body.matchAll(/<b(?=[\s>])[^>]*>([\s\S]*?)<\/b>/g)]) {
      const txt = b[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
      if (txt.includes(key)) hits.push(`${tb.id}:bold:${txt.slice(0,48)}`);
    }
  }
  return hits;
}
const keys = [...new Set([...slim.matchAll(/gotoText\('([^']+)'\)/g)].map(x => x[1]))];
for (const key of keys) {
  const hits = candidates(key);
  if (!hits.length) FAIL(`gotoText key not found: "${key}"`);
  else if (hits.length > 1) WARN(`gotoText key is ambiguous: "${key}" -> ${hits.length} matches`);
  else out.push(`  "${key}" -> ${hits[0]}`);
}

/* 6. sidebar engine */
out.push('--- sidebar ---');
const required = [
  ['#side', /id=["']side["']/], ['#sideNav', /id=["']sideNav["']/],
  ['#sideToggle', /id=["']sideToggle["']/], ['#sideBackdrop', /id=["']sideBackdrop["']/],
  ['scroll spy', /function\s+spy/], ['openAncestors', /openAncestors/]
];
const miss = required.filter(([,re]) => !re.test(html)).map(([n]) => n);
if (miss.length) WARN('sidebar engine incomplete: ' + miss.join(', '));
else out.push('  sidebar shell + engine OK');

/* 7. heading hierarchy */
out.push('--- heading hierarchy ---');
for (const tb of tabs) {
  const seq = [...tb.body.matchAll(/<h([1-6])(?=[\s>])[^>]*>([\s\S]{0,120})/g)]
    .map(x => ({lv:+x[1], txt:x[2].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()}));
  let prev = null;
  for (const h of seq) {
    if (prev !== null && h.lv > prev + 1) FAIL(`[${tb.id}] heading skip h${prev} -> h${h.lv}: ${h.txt.slice(0,40)}`);
    prev = h.lv;
  }
}

/* 8. outline granularity */
out.push('--- outline granularity ---');
let longWarnings = 0;
for (const tb of tabs) {
  const h2s = [...tb.body.matchAll(/<h2(?=[\s>])[^>]*>/g)];
  for (let i=0;i<h2s.length;i++) {
    const seg = tb.body.slice(h2s[i].index, i+1<h2s.length ? h2s[i+1].index : tb.body.length);
    const title = seg.replace(/^<h2[^>]*>/,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,36);
    const len = seg.replace(/<[^>]+>/g,' ').replace(/\s+/g,'').length;
    const kids = (seg.match(/<h3(?=[\s>])/g)||[]).length + (seg.match(/class=["'][^"']*(?:qt|practice-title)[^"']*["']/g)||[]).length;
    if (len > 6000 && kids === 0) FAIL(`[${tb.id}] "${title}" is ${len} chars with no child anchors`);
    else if (len > 3000 && kids === 0) { WARN(`[${tb.id}] "${title}" is ${len} chars with no child anchors`); longWarnings++; }
  }
}
if (!longWarnings) out.push('  no obvious long-section / zero-anchor issue');

/* 9. review-layer consolidation */
out.push('--- review layer ---');
function label(id) {
  const re = new RegExp(`id=["']btn-${id}["'][^>]*>([\\s\\S]*?)<\\/button>`);
  const x = re.exec(html); return x ? x[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim() : id;
}
const labels = declared.map(id => ({id, label:label(id)}));
const summaries = labels.filter(x => /summary/i.test(x.id) || /总结/.test(x.label));
const split = labels.filter(x => /易混|速记|公式汇总|公式表|cheat|confuse/i.test(x.id + ' ' + x.label));
if (!summaries.length) WARN('no single summary/review entry detected');
if (split.length) WARN('separate review tabs detected: ' + split.map(x => x.label).join(' / ') + ' — consider merging into summary');
if (summaries.length && !split.length) out.push('  single summary/review entry OK');

/* 10. progressive disclosure */
out.push('--- progressive disclosure ---');
function cntClass(name) {
  let n=0; for (const x of html.matchAll(/class=["']([^"']+)["']/g)) if (x[1].split(/\s+/).includes(name)) n++; return n;
}
const counts = ['recall','bridge','deep','practice','answer','check','concept','formula','translation']
  .map(x => `${x}=${cntClass(x)}`).join(' ');
out.push('  ' + counts);
const legacyPrep = (html.match(/id=["']prep-/g)||[]).length;
if (legacyPrep) WARN(`${legacyPrep} legacy #prep-* block(s) detected; keep only if they are genuine local bridges, not a per-question template`);

/* 11. MathJax / formulas */
out.push('--- formula rendering ---');
if (/\\\(|\\\[/.test(html) && !/mathjax/i.test(html)) WARN('TeX delimiters found but MathJax reference not detected');
else out.push('  formula renderer linkage looks plausible');

/* 12. page archetype */
out.push('--- page archetype ---');
const archMatch = /<body[^>]*data-archetype=["']([A-Za-z-]+)["']/i.exec(html);
const archetype = archMatch ? archMatch[1].toLowerCase() : '';
if (!archetype) WARN('data-archetype not declared on <body>; SKILL.md §8 requires it (assuming exam-prep)');
const arch = archetype || 'exam-prep';
function hasTab(id) { return new RegExp(`id=["']page-${id}["']`).test(html); }
const optPresent = ['examples','practice'].filter(hasTab);
const optMissing = ['examples','practice'].filter(t => !hasTab(t));
out.push(`  archetype: ${arch}${archMatch ? '' : ' (assumed)'}; optional tabs present: ${optPresent.join(', ') || '(none)'}`);
if (arch === 'exam-prep' && optMissing.length) WARN(`exam-prep expects examples+practice tabs; missing: ${optMissing.join(', ')}`);
else if ((arch === 'principle' || arch === 'review') && optPresent.length) WARN(`${arch} archetype normally closes examples/practice; found ${optPresent.join(', ')} — keep only if the user explicitly asked`);
if (arch === 'custom') INFO('custom archetype: structure is governed by the user-confirmed board list; verify tabs match the declaration');

/* 13. figures & interaction (v5.0 hard rules) */
out.push('--- figures & interaction ---');
const diagCount = (html.match(/class=["'][^"']*\bdiag\b[^"']*["']/g) || []).length;
const caps = [...html.matchAll(/<div class="cap">([\s\S]*?)<\/div>/g)]
  .map(x => x[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim());
const labelRe = /^图\s*([A-Za-z]+[′″']?)\s*[·:：]/;
const seen = {};
for (const c of caps) { const m = labelRe.exec(c); if (m) (seen[m[1]] = seen[m[1]] || []).push(c.slice(0,30)); }
const dup = Object.keys(seen).filter(k => seen[k].length > 1);
out.push(`  figures(.diag): ${diagCount}; numbered captions: ${Object.keys(seen).join(', ') || '(none)'}`);
if (dup.length) FAIL(`duplicate figure numbers: ${dup.map(k => k + '×' + seen[k].length).join(', ')} (same 图号 used by multiple figures)`);
else if (Object.keys(seen).length) out.push('  figure numbers unique OK');
const axisNote = /横轴|实轴|水平边|水平分量|纵轴|虚轴|竖直|竖轴/.test(caps.join(' '));
if (diagCount >= 2 && !axisNote) WARN('multiple figures but no axis-basis note in captions; if the page mixes coordinate systems, state each figure basis (see interactive-patterns.md §5)');
for (const tb of tabs) {
  if (!/^topic/.test(tb.id)) continue;
  const n = (tb.body.match(/class=["'][^"']*\bdiag\b[^"']*["']/g) || []).length;
  if (n === 0) WARN(`[${tb.id}] no visual anchor (.diag) in a knowledge tab — every knowledge tab needs at least one figure / interaction`);
}
/* 交互信号统计：先剔除引擎自带的 scroll-spy 节流行（onScroll 内的 rAF 不是教学交互），
   避免"纯静态图页面"因引擎噪音被误判为有交互。 */
const htmlNoSpy = html.split('\n').filter(l => !/function onScroll/.test(l)).join('\n');
const interactives =
  (htmlNoSpy.match(/type="range"/g) || []).length +
  (htmlNoSpy.match(/requestAnimationFrame/g) || []).length +
  (htmlNoSpy.match(/addEventListener\(\s*["'](?:input|change|pointerdown|mousedown|touchstart)["']/g) || []).length;
out.push(`  interactive widgets detected: ${interactives}`);
if (diagCount > 0 && interactives === 0) WARN('figures exist but no interactive widget detected; figures in the five patterns (parameter sensitivity / time evolution / geometry / graph reading / method comparison) must be interactive by default');

/* final */
out.push('=====================================');
if (fail) out.push(`FAIL: ${fail} hard issue(s), ${warn} warning(s)`);
else if (warn) out.push(`PASS WITH WARNINGS: ${warn} warning(s)`);
else out.push('PASS: structural checks clean');
out.push('Structural pass ≠ subject correctness. Run Coverage / Dependency / Solution-backward / Correctness audits too.');
console.log(out.join('\n'));
process.exit(fail ? 1 : 0);
