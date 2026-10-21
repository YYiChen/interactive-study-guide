#!/usr/bin/env node
/*
 * Interactive Study Guide v5.2 — static checker
 * Usage: node core/scripts/check_page.js <page.html>
 *
 * This checker verifies mechanical HTML/UI consistency only.
 * It does NOT prove subject-matter correctness, prerequisite completeness,
 * assessment scope, or pedagogical quality. It also does NOT prove that a
 * figure's topology is right, that images actually render, or that a visual
 * requirement is pedagogically satisfied. Those require the audits in
 * core/references/verification.md and core/references/visual-material.md.
 *
 * Visual checks are strict only for pages that declare data-visual-contract
 * (or <meta name="isg-visual-contract">). Legacy pages keep the old behaviour
 * and only get advisory notes, so existing projects are not retro-broken.
 */
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) { console.error('usage: node core/scripts/check_page.js <page.html>'); process.exit(2); }
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
  const openTag = m[0].slice(0, m[0].indexOf('>') + 1);
  if (/type=["']application\/(?:ld\+)?json["']/i.test(openTag)) {
    out.push(`  script ${nScript}: JSON data block (not executed)`);
    continue;
  }
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
const KNOWN_ARCH = ['exam-prep', 'principle', 'review', 'custom'];
if (archetype && !KNOWN_ARCH.includes(archetype)) WARN(`unknown data-archetype "${archetype}"; use one of ${KNOWN_ARCH.join(' / ')} — domain content patterns map onto these values, see domains/<domain>/`);
const domMatch = /<body[^>]*data-domain=["']([A-Za-z0-9_-]+)["']/i.exec(html);
if (domMatch) INFO(`domain: ${domMatch[1].toLowerCase()} — domain rules in domains/${domMatch[1].toLowerCase()}/domain.md`);
else INFO('data-domain not declared on <body>; assuming the default domain (engineering, or the custom board declared in the page header)');

/* 13. figures & interaction (v5.0 hard rules) */
out.push('--- figures & interaction ---');
const diagCount = (html.match(/class=["'][^"']*\bdiag\b[^"']*["']/g) || []).length;
const caps = [...html.matchAll(/<div class="cap">([\s\S]*?)<\/div>/g)]
  .map(x => x[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim());
/* 图号：字母式（图 A / 图 A′）或数字式（图 1‑1 / 4‑2 / 1.2），撇号计入编号；
   编号后跟空白 / · : ： . 全角空格或结尾；正文里"见图 1‑1"式引用不匹配（锚定行首）。 */
const labelRe = /^图\s*([0-9A-Za-z]+(?:[.\-‑–—][0-9A-Za-z]+)*['′″]?)(?:[\s·:：　.]|$)/;
const seen = {};
for (const c of caps) { const m = labelRe.exec(c); if (m) (seen[m[1]] = seen[m[1]] || []).push(c.slice(0,30)); }
const dup = Object.keys(seen).filter(k => seen[k].length > 1);
out.push(`  figures(.diag): ${diagCount}; numbered captions: ${Object.keys(seen).join(', ') || '(none)'}`);
if (dup.length) FAIL(`duplicate figure numbers: ${dup.map(k => k + '×' + seen[k].length).join(', ')} (same 图号 used by multiple figures)`);
else if (Object.keys(seen).length) out.push('  figure numbers unique OK');
const axisNote = /横轴|实轴|水平边|水平分量|纵轴|虚轴|竖直|竖轴/.test(caps.join(' '));
if (diagCount >= 2 && !axisNote) WARN('multiple figures but no axis-basis note in captions; if the page mixes coordinate systems, state each figure basis (see interactive-patterns.md §6)');
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
if (diagCount > 0 && interactives === 0) INFO('figures exist but no interactive widget detected — fine for type A (structure/apparatus) and static comparison tables; if any type C figure (parameter sensitivity / time evolution / geometry / graph reading / method comparison) is present, make it interactive (see interactive-patterns.md)');

/* 14. visual material contract (v5.2) */
out.push('--- visual assets ---');
const contractMatch = /<body[^>]*data-visual-contract=["']([^"']+)["']/i.exec(html)
  || /<meta[^>]+name=["']isg-visual-contract["'][^>]*content=["']([^"']+)["']/i.exec(html);
const contract = contractMatch ? contractMatch[1].trim() : '';
const strict = !!contract;
if (strict) out.push(`  visual contract declared: ${contract}`);

/* inner HTML of a div, by matching nesting (figure containers are divs) */
function divInner(src, openIdx) {
  let i = src.indexOf('>', openIdx);
  if (i < 0) return '';
  i += 1;
  let depth = 1;
  const re = /<div\b[^>]*>|<\/div\s*>/gi;
  re.lastIndex = i;
  let t;
  while ((t = re.exec(src)) !== null) {
    if (/^<\/div/i.test(t[0])) { depth--; if (depth === 0) return src.slice(i, t.index); }
    else depth++;
  }
  return src.slice(i);
}

const diagRe = /<div[^>]*class=["'][^"']*\bdiag\b[^"']*["'][^>]*>/gi;
const figs = [];
let dm;
while ((dm = diagRe.exec(html)) !== null) {
  const tag = dm[0];
  const attr = (n) => {
    const r = new RegExp(n + '\\s*=\\s*["\']([^"\']*)["\']', 'i').exec(tag);
    return r ? r[1].trim() : '';
  };
  const body = divInner(html, dm.index);
  figs.push({
    id: attr('data-fig-id'),
    role: attr('data-fig-role'),
    req: (attr('data-fig-req') || '').split(/[\s,]+/).filter(Boolean),
    source: attr('data-fig-source'),
    body
  });
}
out.push(`  figure containers: ${figs.length}`);

/* 14a. declared figure ids unique */
const figIds = figs.map(f => f.id).filter(Boolean);
const dupFig = [...new Set(figIds.filter((x, i) => figIds.indexOf(x) !== i))];
if (dupFig.length) {
  (strict ? FAIL : WARN)(`duplicate data-fig-id: ${dupFig.join(', ')} (one figure id must identify exactly one figure)`);
} else if (figIds.length) out.push(`  figure ids unique (${figIds.length})`);

/* 14b. empty / placeholder containers */
const PLACEHOLDER = /\[IMG\]|【图片?】|\[图\]|TODO|FIXME|待补图|占位图|placeholder/i;
let emptyFig = 0, phFig = 0, widgetFig = 0;
for (const f of figs) {
  const name = f.id || '(no data-fig-id)';
  const hasObj = /<svg[\s>]/i.test(f.body) || /<img[\s>]/i.test(f.body) ||
                 /<canvas[\s>]/i.test(f.body) || /<table[\s>]/i.test(f.body) ||
                 /<iframe[\s>]/i.test(f.body);
  const hasControl = /<input[\s>]/i.test(f.body) || /<select[\s>]/i.test(f.body) || /<button[\s>]/i.test(f.body);
  const txt = f.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (PLACEHOLDER.test(txt)) {
    phFig++;
    (strict ? FAIL : WARN)(`figure ${name}: placeholder text instead of a real figure (${txt.slice(0, 40)})`);
  } else if (!hasObj && hasControl) {
    widgetFig++;
    INFO(`figure ${name}: control-only widget (no svg/img/table) — acceptable for a numeric explorer, but the static conclusion must be visible in the caption`);
  } else if (!hasObj) {
    emptyFig++;
    if (txt.length > 40) WARN(`figure ${name}: no svg/img/canvas/table/iframe inside .diag (text-only figure)`);
    else (strict ? FAIL : WARN)(`figure ${name}: empty figure container (no svg/img/canvas/table)`);
  }
}
if (!emptyFig && !phFig && figs.length) out.push('  no empty / placeholder figure container');

/* 14c. local image files must exist */
const imgSrcs = [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(x => x[1]);
let imgMissing = 0;
for (const src of imgSrcs) {
  if (/^(?:https?:|data:|blob:|\/\/)/i.test(src)) continue;
  const rel = src.split(/[?#]/)[0];
  const abs = path.resolve(path.dirname(path.resolve(file)), decodeURI(rel));
  if (!fs.existsSync(abs)) {
    imgMissing++;
    (strict ? FAIL : WARN)(`image not found: ${src} (resolved: ${abs})`);
  }
}
if (imgSrcs.length && !imgMissing) out.push(`  local images exist (${imgSrcs.length})`);

/* 14d. visual requirement map */
let vrMap = null;
const mapRe = /<script[^>]*id=["']isg-visual-map["'][^>]*>([\s\S]*?)<\/script>/i;
const mmap = mapRe.exec(html);
if (mmap) {
  try { vrMap = JSON.parse(mmap[1]); }
  catch (e) { FAIL('isg-visual-map JSON parse error: ' + e.message); }
}
if (vrMap) {
  const reqs = Array.isArray(vrMap.requirements) ? vrMap.requirements : [];
  const byId = new Map();
  for (const r of reqs) {
    if (!r || !r.id) { FAIL('[visual] requirement entry without id'); continue; }
    if (byId.has(r.id)) FAIL(`[visual] duplicate requirement id ${r.id}`);
    byId.set(r.id, r);
  }
  const figSet = new Set(figIds);
  let openRequired = 0, documentedGap = 0;
  for (const r of reqs) {
    const need = String(r.need || 'required').toLowerCase();
    if (!['required', 'helpful', 'unnecessary'].includes(need)) {
      WARN(`[visual] ${r.id}: unknown need "${r.need}" (use required / helpful / unnecessary)`);
    }
    const refs = (Array.isArray(r.fig_ids) ? r.fig_ids : (r.fig ? [r.fig] : [])).filter(Boolean);
    if (need === 'required') {
      if (!refs.length) {
        openRequired++;
        if (String(r.note || '').trim()) {
          documentedGap++;
          WARN(`[visual] required ${r.id} has no figure (documented gap: ${String(r.note).slice(0, 60)})`);
        } else {
          FAIL(`[visual] required ${r.id} has no figure and no recorded reason (anchor: ${r.anchor || '?'})`);
        }
      }
    }
    for (const fid of refs) {
      if (!figSet.has(fid)) {
        (need === 'required' ? FAIL : WARN)(`[visual] ${r.id} points to figure "${fid}" which is not present on this page (anchor: ${r.anchor || '?'})`);
      }
    }
  }
  out.push(`  visual requirements: ${reqs.length} (required without figure: ${openRequired}, documented gaps: ${documentedGap})`);
  const nRequired = reqs.filter(r => String(r.need || 'required').toLowerCase() === 'required').length;
  if (!reqs.length) {
    WARN('[visual] visual contract declared but the requirement list is empty; declare the tasks that depend on a structure, or drop the contract');
  } else if (nRequired === 0) {
    WARN('[visual] no requirement is marked required; if any knowledge tab depends on structure/connection/waveform, this is likely an under-declaration (see visual-material.md §2)');
  }
  for (const f of figs) {
    for (const rid of f.req) {
      if (!byId.has(rid)) FAIL(`[visual] figure ${f.id || '(no id)'} references undeclared requirement "${rid}"`);
    }
  }
  if (strict) {
    const noreq = figs.filter(f => !f.id);
    if (noreq.length) WARN(`[visual] ${noreq.length} figure(s) lack data-fig-id; incremental updates cannot target them`);
    const badRole = figs.filter(f => f.role && !['evidence', 'teaching', 'demo'].includes(f.role));
    if (badRole.length) WARN(`[visual] unknown data-fig-role on ${badRole.length} figure(s): ${badRole.map(f => f.role).join(', ')} (use evidence / teaching / demo)`);
    const evNoSrc = figs.filter(f => f.role === 'evidence' && !f.source);
    if (evNoSrc.length) WARN(`[visual] ${evNoSrc.length} evidence figure(s) without data-fig-source; original figures should stay traceable`);
    /* text references to figure numbers that have no caption on this page */
    const capNums = new Set(Object.keys(seen));
    const refs = [...new Set([...html.matchAll(/(?:见|参见|如)\s*图\s*([0-9A-Za-z]+(?:[.\-‑–—][0-9A-Za-z]+)*['′″]?)/g)].map(x => x[1]))];
    const dangling = refs.filter(r => !capNums.has(r));
    if (dangling.length) WARN(`[visual] text refers to figure(s) with no caption here: ${dangling.join(', ')} (check numbering or cross-page wording)`);
  }
} else if (strict) {
  WARN('data-visual-contract declared but no #isg-visual-map block; required visual requirements cannot be checked');
}

/* 14e. question figures (examples / practice) should be the original */
const qTabs = tabs.filter(t => /practice|examples/i.test(t.id));
let redrawnQ = 0, qFigCount = 0;
for (const t of qTabs) {
  const ftagRe = /<div[^>]*class=["'][^"']*\bdiag\b[^"']*["'][^>]*>/gi;
  let fm;
  while ((fm = ftagRe.exec(t.body)) !== null) {
    qFigCount++;
    const roleM = /data-fig-role\s*=\s*["']([^"']*)["']/i.exec(fm[0]);
    const idM = /data-fig-id\s*=\s*["']([^"']*)["']/i.exec(fm[0]);
    const role = roleM ? roleM[1].trim().toLowerCase() : '';
    if (role && role !== 'evidence') {
      redrawnQ++;
      WARN(`[visual] ${t.id}: figure ${idM ? idM[1] : '(no id)'} declared "${role}" — question figures should normally be the original (evidence); for an auxiliary drawing or an authorized adapted question, retain available original evidence, label the role/changed conditions, and verify the matching answer (visual-material.md §3.1). This warning is not a blanket ban on auxiliary drawings.`);
    }
  }
}
if (strict && qFigCount && !redrawnQ) out.push(`  question tabs use original figures (${qFigCount} figure(s) checked)`);

/* 14f. legacy migration hint */
if (!strict && figs.length) {
  INFO('legacy page: no data-visual-contract; figure integrity checks are advisory. Add <body data-visual-contract="v1"> + #isg-visual-map to opt in (see core/references/visual-material.md §2)');
}

/* final */
out.push('=====================================');
if (fail) out.push(`FAIL: ${fail} hard issue(s), ${warn} warning(s)`);
else if (warn) out.push(`PASS WITH WARNINGS: ${warn} warning(s)`);
else out.push('PASS: structural checks clean');
out.push('Structural pass ≠ subject correctness. Run Coverage / Dependency / Solution-backward / Correctness audits too.');
out.push('Figure existence ≠ figure correctness. Topology, polarity and figure/text/formula consistency need the Structure Audit;');
out.push('actual image rendering (load, crop, overlap) is a browser-level check this script cannot perform.');
console.log(out.join('\n'));
process.exit(fail ? 1 : 0);
