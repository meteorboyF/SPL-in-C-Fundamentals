// Checks every problem: the in-browser interpreter must print exactly what gcc/g++ prints.
// Usage: node tools/verify.js [--show] [id-filter]
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
global.window = global;
const items = []; global.CN = { items, add: d => items.push(d) };
const CTrace = require(path.join(root, 'assets/js/cinterp.js'));
for (const f of fs.readdirSync(path.join(root, 'assets/data'))) require(path.join(root, 'assets/data', f));
const show = process.argv.includes('--show');
const filter = process.argv.slice(2).find(a => !a.startsWith('--'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cnv-'));
let bad = 0, n = 0, noExplain = 0;
for (const d of CN.items) {
  if (filter && !d.id.includes(filter)) continue;
  n++;
  const lines = d.code.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  const code = lines.map(l => { const i = l.indexOf('//>'); return i >= 0 ? l.slice(0, i).replace(/\s+$/, '') : l; }).join('\n');
  const cpp = /cout|cin|iostream|bits\/stdc/.test(code);
  const src = path.join(tmp, d.id + (cpp ? '.cpp' : '.c')), exe = path.join(tmp, d.id);
  fs.writeFileSync(src, code);
  let real;
  try {
    execFileSync(cpp ? 'g++' : 'gcc', ['-Wall', '-Wno-unused-variable', src, '-o', exe, '-lm'], { stdio: ['ignore', 'ignore', 'pipe'] });
    real = execFileSync(exe, { input: (d.input || '') + '\n' }).toString();
  } catch (e) { bad++; console.log('✗ COMPILE/RUN', d.id, String(e.stderr || e.message).slice(0, 400)); continue; }
  const r = CTrace.run(code, d.input || '');
  let mine = r.out;
  for (const [a, b] of r.inputs.slice().reverse()) mine = mine.slice(0, a) + mine.slice(b);
  if (r.error || mine !== real) { bad++; console.log('✗', d.id, r.error || ''); console.log('gcc :', JSON.stringify(real)); console.log('mine:', JSON.stringify(mine)); }
  if (show) { console.log('── ' + d.id + ' (' + r.steps.length + ' steps)\n' + real); }
}
console.log(n + ' programs checked, ' + bad + ' problems');
process.exit(bad ? 1 : 0);
