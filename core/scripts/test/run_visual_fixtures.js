#!/usr/bin/env node
/*
 * Fixture tests for check_page.js visual-asset checks (v5.2).
 * Usage: node core/scripts/test/run_visual_fixtures.js
 *
 * Each fixture is a tiny, otherwise-valid page that exercises exactly one
 * behaviour. The runner asserts (a) exit code and (b) a specific message,
 * so these tests fail when behaviour changes — not when wording is reflowed.
 */
const path = require('path');
const { spawnSync } = require('child_process');
const checker = path.join(__dirname, '..', 'check_page.js');
const dir = path.join(__dirname, 'fixtures');

const cases = [
  {
    name: 'image file exists -> pass',
    file: 'ok_image_exists.html', code: 0,
    expects: ['local images exist (1)']
  },
  {
    name: 'declared required image missing -> fail',
    file: 'fail_missing_image.html', code: 1,
    expects: ['image not found: assets/does-not-exist.png']
  },
  {
    name: 'legacy page without map -> no regression',
    file: 'legacy_no_map.html', code: 0,
    expects: ['legacy page: no data-visual-contract'],
    forbids: ['FAIL ']
  },
  {
    name: 'requirement points to absent figure id -> fail with id',
    file: 'fail_unknown_figid.html', code: 1,
    expects: ['VR-001 points to figure "FIG-99"']
  },
  {
    name: 'svg + img combined, one figure serving two required VRs -> pass',
    file: 'ok_combined_multireq.html', code: 0,
    expects: ['figure ids unique (1)', 'visual requirements: 3']
  },
  {
    name: 'empty figure container with required VR -> fail',
    file: 'fail_empty_container.html', code: 1,
    expects: ['empty figure container']
  },
  {
    name: 'placeholder text instead of a figure -> fail',
    file: 'fail_placeholder.html', code: 1,
    expects: ['placeholder text instead of a real figure']
  },
  {
    name: 'figure cites undeclared requirement -> fail',
    file: 'fail_undeclared_req.html', code: 1,
    expects: ['references undeclared requirement "VR-404"']
  },
  {
    name: 'duplicate data-fig-id -> fail',
    file: 'fail_duplicate_figid.html', code: 1,
    expects: ['duplicate data-fig-id: FIG-01']
  },
  {
    name: 'every requirement downgraded to helpful -> warn, not fail',
    file: 'warn_all_helpful.html', code: 0,
    expects: ['no requirement is marked required'],
    forbids: ['FAIL ']
  },
  {
    name: 'redrawn figure inside practice tab -> warn (question figures stay original)',
    file: 'warn_practice_redrawn.html', code: 0,
    expects: ['question figures should normally be the original'],
    forbids: ['FAIL ']
  },
  {
    name: 'original evidence figure inside practice tab -> no warning',
    file: 'ok_practice_evidence.html', code: 0,
    expects: ['question tabs use original figures'],
    forbids: ['question figures should normally be the original']
  }
];

let bad = 0;
const rows = [];
for (const c of cases) {
  const file = path.join(dir, c.file);
  const r = spawnSync(process.execPath, [checker, file], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  const code = r.status;
  const problems = [];
  if (code !== c.code) problems.push(`exit ${code} != ${c.code}`);
  for (const e of c.expects || []) if (!out.includes(e)) problems.push(`missing: ${e}`);
  for (const f of c.forbids || []) if (out.includes(f)) problems.push(`unexpected: ${f}`);
  if (problems.length) bad++;
  rows.push(`${problems.length ? 'FAIL' : 'ok  '}  ${c.name}${problems.length ? '\n        - ' + problems.join('\n        - ') : ''}`);
}

console.log(rows.join('\n'));
console.log(`\n${cases.length - bad}/${cases.length} fixture expectations met`);
process.exit(bad ? 1 : 0);
