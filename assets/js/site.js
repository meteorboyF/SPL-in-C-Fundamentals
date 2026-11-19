// Shared site code: top bar, sidebar, syntax highlighting, problem cards.
//
// Data files call CN.add({...}) for every problem / worked example:
//   id, group ('patterns:A'), title, level ('easy'|'medium'|'hard'), lc ({n, slug} LeetCode),
//   gfg (url), src (legacy repo file), prompt (html), input (stdin), grid (true for patterns),
//   idea (html), formula ([[head...], [row...]...]), code (String.raw with //> explanations),
//   complexity, traps ([html]), tryit ([html]), example (true = shown inline in the notes)
(function () {
  'use strict';
  const CN = window.CN = window.CN || {};
  CN.items = CN.items || [];
  CN.byId = CN.byId || {};
  CN.add = function (def) { CN.items.push(def); CN.byId[def.id] = def; };

  const PAGES = [
    { href: 'index.html', label: 'Home' },
    { href: 'basics.html', label: '1 · C Basics' },
    { href: 'conditionals.html', label: '1b · Conditionals' },
    { href: 'loops.html', label: '2 · Loops' },
    { href: 'sequences.html', label: '2b · Sequences' },
    { href: 'patterns.html', label: '3 · Patterns' },
    { href: '#', label: '4 · Maths', soon: true },
    { href: '#', label: '5 · Recursion', soon: true },
    { href: '#', label: '6 · Arrays', soon: true },
  ];

  const esc = CN.esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ---------- syntax highlighting (C / C++)
  const KW = new Set('if else for while do switch case default break continue return sizeof using namespace struct typedef const static true false new delete'.split(' '));
  const TY = new Set('int char float double long short unsigned signed bool void string auto vector'.split(' '));
  const LIB = new Set('printf scanf putchar puts cout cin endl abs sqrt pow max min swap'.split(' '));
  CN.highlight = function (line) {
    let out = '', i = 0;
    const n = line.length;
    while (i < n) {
      const c = line[i];
      if (c === '/' && line[i + 1] === '/') { out += '<span class="tk-com">' + esc(line.slice(i)) + '</span>'; break; }
      if (c === '#' && !line.slice(0, i).trim()) { out += '<span class="tk-pp">' + esc(line.slice(i)) + '</span>'; break; }
      if (c === '"' || c === "'") {
        let j = i + 1; while (j < n && line[j] !== c) { if (line[j] === '\\') j++; j++; }
        out += '<span class="tk-str">' + esc(line.slice(i, j + 1)) + '</span>'; i = j + 1; continue;
      }
      if (/[0-9]/.test(c) && !/\w/.test(line[i - 1] || '')) {
        let j = i; while (j < n && /[0-9.a-fA-FxXuUlL]/.test(line[j])) j++;
        out += '<span class="tk-num">' + esc(line.slice(i, j)) + '</span>'; i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i; while (j < n && /\w/.test(line[j])) j++;
        const w = line.slice(i, j);
        const cls = KW.has(w) ? 'tk-kw' : TY.has(w) ? 'tk-ty' : (LIB.has(w) || line[j] === '(') ? 'tk-fn' : '';
        out += cls ? '<span class="' + cls + '">' + w + '</span>' : w; i = j; continue;
      }
      out += esc(c); i++;
    }
    return out;
  };

  // ---------- turning `code` (with //> notes) into lines + explanations
  const DEFAULTS = {
    '#include <stdio.h>': 'Include the <b>st</b>andar<b>d</b> <b>i</b>nput/<b>o</b>utput library so we can use {printf} and {scanf}.',
    '#include <math.h>': 'Include the maths library ({sqrt}, {pow}, {abs} …).',
    '#include <stdlib.h>': 'Include the standard library (it has {abs} for integers).',
    '#include <limits.h>': 'Gives us the constants {INT_MAX} = 2147483647 and {INT_MIN} = −2147483648.',
    '#include <stdbool.h>': 'Lets C use {bool}, {true} and {false}.',
    '#include <iostream>': 'C++ input/output: gives us {cout} and {cin}.',
    '#include <bits/stdc++.h>': 'A GCC shortcut that includes every standard C++ header at once.',
    'using namespace std;': 'Lets us write {cout} instead of {std::cout}.',
    'int main() {': 'Every C program starts running from {main()}. The {{} opens its body.',
    'int main()': 'Every C program starts running from {main()}.',
    'int main(void) {': 'Every C program starts running from {main()}.',
    'return 0;': '{main} returns 0 to the operating system, which means “finished without errors”.',
    'printf("\\n");': 'Print a newline: this row is finished, so the cursor moves to the start of the next line.',
    'scanf("%d", &n);': 'Read an integer typed by the user and store it in {n}. The {&} gives scanf the <i>address</i> of {n}, so it can write into it.',
    '{': 'Opens the block that belongs to the line above.',
  };
  function rich(s) { // {code} → <code>code</code>
    return s.replace(/\{\{\}/g, '<code>{</code>').replace(/\{\}\}/g, '<code>}</code>').replace(/\{([^{}]+)\}/g, (_, x) => '<code>' + esc(x) + '</code>');
  }
  CN.rich = rich;
  function stripStrings(s) { return s.replace(/"(\\.|[^"\\])*"/g, '""').replace(/'(\\.|[^'\\])*'/g, "''").replace(/\/\/.*$/, ''); }

  // a sensible explanation for lines that have no hand-written //> note
  function printWhat(args) {
    const m = /^"((?:\\.|[^"\\])*)"\s*(,.*)?$/.exec(args.trim());
    if (!m) return 'Print {' + args.trim() + '}.';
    const s = m[1];
    if (s === '*' || s === '* ' || s === '#' || s === '+') return 'Print one {' + s.trim() + '}.';
    if (s === ' ' || s === '  ') return 'Print ' + (s.length === 2 ? 'two spaces' : 'one space') + ' (needed to push the next characters into the right column).';
    if (s === '\\n') return 'End the current line.';
    return 'Print {"' + s + '"}' + (m[2] ? ', with each {%} placeholder replaced by {' + m[2].slice(1).trim() + '}' : '') + '.';
  }
  function autoExplain(t) {
    let m;
    const tail = s => { const p = /\)\s*printf\((.*)\);\s*$/.exec(s); return p ? ' Body: ' + printWhat(p[1]).replace(/\.$/, '') + ' each time.' : ''; };
    if ((m = /^for\s*\((.*?);(.*?);(.*?)\)/.exec(t))) {
      const init = m[1].trim(), cond = m[2].trim(), upd = m[3].trim();
      const v = (/(\w+)\s*=/.exec(init) || [])[1];
      return 'Loop' + (v ? ' with {' + v + '}' : '') + ': start with {' + init.replace(/^(int|char|long long)\s+/, '') + '}, keep going while {' + cond + '}, and do {' + upd + '} after every pass.' + tail(t);
    }
    if ((m = /^while\s*\((.*)\)\s*\{?$/.exec(t))) return 'Repeat the block while {' + m[1] + '} is true.';
    if ((m = /^}?\s*else\s+if\s*\((.*)\)\s*\{?$/.exec(t))) return 'Otherwise, check {' + m[1] + '}.';
    if (/^}?\s*else\s*\{?$/.test(t)) return 'Otherwise (the condition above was false) run this block.';
    if ((m = /^if\s*\((.*)\)\s*\{?$/.exec(t))) return 'Check {' + m[1] + '}. The block below runs only if it is true.';
    if ((m = /^if\s*\((.*?)\)\s*(.+);$/.exec(t))) return 'If {' + m[1] + '} is true, do {' + m[2] + '}.';
    if ((m = /^printf\((.*)\);$/.exec(t))) return printWhat(m[1]);
    if ((m = /^(?:int|char|double|long long|float|bool)\s+(\w+);$/.exec(t))) return 'Create the variable {' + m[1] + '}. It gets its value on a later line.';
    if ((m = /^(?:int|char|double|long long|float|bool)\s+(\w+)\s*=\s*(.+);$/.exec(t))) return 'Create {' + m[1] + '} and set it to {' + m[2] + '}.';
    if ((m = /^(?:int|char|double|long long|float|bool)\s+([\w\s,]+);$/.exec(t))) return 'Create the variables {' + m[1].replace(/\s+/g, '') + '}.';
    if ((m = /^scanf\((.*)\);$/.exec(t))) return 'Read the input values into {' + m[1].split(',').slice(1).map(s => s.trim().replace('&', '')).join('}, {') + '}.';
    if ((m = /^(\w+)\s*(\+\+|--);$/.exec(t))) return (m[2] === '++' ? 'Add 1 to {' : 'Subtract 1 from {') + m[1] + '}.';
    if ((m = /^(\w+(?:\[.*?\])*)\s*([-+*/%]?=)\s*(.+);$/.exec(t))) return m[2] === '=' ? 'Store {' + m[3] + '} in {' + m[1] + '}.' : 'Update {' + m[1] + '}: {' + m[1] + ' = ' + m[1] + ' ' + m[2][0] + ' ' + m[3] + '}.';
    if ((m = /^return\s+(.+);$/.exec(t))) return 'Send {' + m[1] + '} back to the caller and leave the function.';
    if ((m = /^else\s+(.+);$/.exec(t))) return 'Otherwise: ' + (/^printf\(/.test(m[1]) ? printWhat(m[1].slice(7, -1)) : 'do {' + m[1] + '}.');
    if ((m = /^switch\s*\((.*)\)\s*\{$/.exec(t))) return 'Look at the value of {' + m[1] + '} and jump to the matching {case}.';
    if (/^do\s*\{$/.test(t)) return 'Start a do-while loop: the body runs first, and the condition is checked at the end.';
    if ((m = /^(\w+)\((.*)\);$/.exec(t))) return 'Call the function {' + m[1] + '}' + (m[2] ? ' with {' + m[2] + '}' : '') + '.';
    if (t === 'break;') return 'Leave the loop / switch right now.';
    if (t === 'continue;') return 'Skip to the next pass of the loop.';
    if ((m = /^case\s+(.+?):/.exec(t))) return 'If the value is {' + m[1] + '}, execution starts here.';
    if (/^default:/.test(t)) return 'If no case matched, execution starts here.';
    if ((m = /^(\w[\w\s]*?)\s+(\w+)\((.*)\)\s*\{$/.exec(t))) return 'Define the function {' + m[2] + '}: it takes {' + (m[3] || 'nothing') + '} and returns {' + m[1] + '}.';
    return '';
  }

  CN.parseCode = function (raw) {
    const rawLines = raw.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
    const lines = rawLines.map(l => {
      const i = l.indexOf('//>');
      return i >= 0 ? { code: l.slice(0, i).replace(/\s+$/, ''), why: rich(l.slice(i + 3).trim()) } : { code: l, why: '' };
    });
    // match braces so we can explain the closing ones automatically
    const stack = [];
    lines.forEach((ln, idx) => {
      const s = stripStrings(ln.code);
      for (const ch of s) {
        if (ch === '{') stack.push(idx);
        else if (ch === '}') { const o = stack.pop(); if (ln.code.trim().startsWith('}') && !ln.closes) ln.closes = o; }
      }
    });
    lines.forEach(ln => {
      if (ln.why) return;
      const t = ln.code.trim();
      if (DEFAULTS[t]) { ln.why = rich(DEFAULTS[t]); return; }
      const auto = autoExplain(t);
      if (auto) { ln.why = rich(auto); return; }
      if (/^}/.test(t) && ln.closes != null) {
        const op = lines[ln.closes].code.trim();
        const at = ' (opened on line ' + (ln.closes + 1) + ')';
        if (/^for\b/.test(op)) ln.why = 'End of the {for} body' + at + '. Jump back up: run the update part, then test the condition again.';
        else if (/^while\b/.test(op)) ln.why = 'End of the {while} body' + at + '. Jump back up and test the condition again.';
        else if (/^do\b/.test(op)) ln.why = 'End of the {do} body — now the {while} condition is tested.';
        else if (/^(}\s*)?else\b/.test(op)) ln.why = 'End of the {else} block' + at + '.';
        else if (/^(}\s*)?if\b/.test(op)) ln.why = 'End of the {if} block' + at + '.' + (/else/.test(t) ? ' The {else} part runs only if the condition was false.' : '');
        else if (/^switch\b/.test(op)) ln.why = 'End of the {switch}.';
        else if (/\bmain\s*\(/.test(op)) ln.why = 'End of {main()} — the program is finished.';
        else if (/\)\s*\{$/.test(op)) ln.why = 'End of the function' + at + '.';
        else ln.why = 'Closes the block' + at + '.';
        ln.why = rich(ln.why);
      }
    });
    return { text: lines.map(l => l.code).join('\n'), lines };
  };

  CN.consoleHTML = function (res) {
    // program output, with the echoed keyboard input shown in green
    let html = '', pos = 0;
    for (const [a, b] of res.inputs) { html += esc(res.out.slice(pos, a)) + '<span class="in">' + esc(res.out.slice(a, b)) + '</span>'; pos = b; }
    html += esc(res.out.slice(pos));
    return html;
  };

  // ---------- layout
  function topbar() {
    const here = location.pathname.split('/').pop() || 'index.html';
    const nav = PAGES.map(p => '<a href="' + p.href + '" class="' + (p.href === here ? 'active' : '') + (p.soon ? ' soon' : '') + '">' + p.label + '</a>').join('');
    const el = document.createElement('header');
    el.className = 'topbar';
    el.innerHTML = '<div class="topbar-inner"><a class="brand" href="index.html"><span class="brand-mark">C++</span><span class="t">C / C++ Notes</span></a><nav class="nav">' + nav + '</nav></div>';
    document.body.prepend(el);
  }

  function sidebar() {
    const side = document.querySelector('.sidebar');
    if (!side) return;
    const hs = [...document.querySelectorAll('.main h2[id], .main h3[id]')];
    side.innerHTML = '<div class="side-title">On this page</div>' + hs.map(h => {
      const c = h.dataset.count ? '<span class="count">' + h.dataset.count + '</span>' : '';
      return '<a href="#' + h.id + '" class="' + (h.tagName === 'H3' ? 'sub' : '') + '">' + esc(h.dataset.short || h.textContent) + c + '</a>';
    }).join('');
    const links = [...side.querySelectorAll('a')];
    const obs = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
          const on = side.querySelector('a.on');
          if (on) { const r = on.getBoundingClientRect(), sr = side.getBoundingClientRect(); if (r.top < sr.top || r.bottom > sr.bottom) on.scrollIntoView({ block: 'nearest' }); }
        }
      });
    }, { rootMargin: '-70px 0px -70% 0px' });
    hs.forEach(h => obs.observe(h));
  }

  // ---------- solved state (per browser)
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem('cn:' + k)); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem('cn:' + k, JSON.stringify(v)); } catch (_) { } }
  };
  CN.store = store;

  // ---------- problem cards
  function lcLink(def) {
    if (def.lc) return '<a class="pill lc" target="_blank" rel="noopener" href="https://leetcode.com/problems/' + def.lc.slug + '/">LeetCode ' + def.lc.n + '</a>';
    if (def.gfg) return '<a class="pill lc" target="_blank" rel="noopener" href="' + def.gfg + '">GfG</a>';
    return '';
  }

  function miniPreview(def) {
    if (!def.grid || !window.CTrace) return '';
    const pc = CN.parseCode(def.code);
    const r = CTrace.run(pc.text, def.previewInput || '4');
    if (r.error) return '';
    const lines = r.out.slice(r.gridStart).split('\n').filter((l, i, a) => i < a.length - 1 || l).slice(0, 4);
    return '<span class="mini">' + esc(lines.map(l => l.slice(0, 16)).join('\n')) + '</span>';
  }

  function renderBody(def, body) {
    const pc = CN.parseCode(def.code);
    const res = CTrace.run(pc.text, def.input || '');
    let h = '';
    if (def.prompt) h += '<h4>Problem</h4><div>' + def.prompt + '</div>';
    if (def.src) h += '<div class="src">From your repo: <code>' + esc(def.src) + '</code> (now on the <code>legacy</code> branch)</div>';
    h += '<h4>Output' + (def.input ? ' for input <code>' + esc(def.input.trim().replace(/\s+/g, ' ')) + '</code>' : '') + '</h4><pre class="console">' + CN.consoleHTML(res) + '</pre>';
    if (def.tests) {
      const strip = r => { let o = r.out; for (const [a, b] of r.inputs.slice().reverse()) o = o.slice(0, a) + o.slice(b); return o.replace(/\n$/, ''); };
      h += '<h4>Output for other inputs</h4><div class="table-scroll"><table class="tbl"><tr><th>input</th><th>output</th></tr>' + def.tests.map(t => {
        const r = CTrace.run(pc.text, t);
        return '<tr><td><code>' + esc(t) + '</code></td><td><pre class="console" style="margin:0;padding:4px 8px">' + esc(r.error ? 'error: ' + r.error.msg : strip(r)) + '</pre></td></tr>';
      }).join('') + '</table></div>';
    }
    if (def.idea) h += '<h4>How to think about it</h4><div class="callout idea"><div class="callout-title">Idea</div>' + def.idea + '</div>';
    if (def.formula) {
      const [head, ...rows] = def.formula;
      h += '<div class="table-scroll"><table class="tbl formula"><tr>' + head.map(x => '<th>' + x + '</th>').join('') + '</tr>' + rows.map(r => '<tr>' + r.map(x => '<td>' + x + '</td>').join('') + '</tr>').join('') + '</table></div>';
    }
    h += '<h4>Run it line by line</h4><div class="viz-host"></div>';
    h += '<h4>Every line explained</h4><div class="table-scroll"><table class="lines">' + pc.lines.map((l, i) =>
      '<tr data-line="' + (i + 1) + '" class="' + (l.code.trim() ? '' : 'blank') + '"><td class="ln">' + (i + 1) + '</td><td class="lc">' + CN.highlight(l.code) + '</td><td class="lx">' + (l.why || '<span class="muted">—</span>') + '</td></tr>').join('') + '</table></div>';
    if (def.complexity) h += '<h4>Complexity</h4><p>' + def.complexity + '</p>';
    if (def.traps && def.traps.length) h += '<div class="callout trap"><div class="callout-title">Common mistakes</div><ul>' + def.traps.map(t => '<li>' + t + '</li>').join('') + '</ul></div>';
    if (def.tryit && def.tryit.length) h += '<div class="callout tip"><div class="callout-title">Try it yourself</div><ul>' + def.tryit.map(t => '<li>' + t + '</li>').join('') + '</ul></div>';
    body.innerHTML = h;
    const viz = CN.viz(body.querySelector('.viz-host'), def, pc);
    body.querySelectorAll('.lines tr').forEach(tr => tr.addEventListener('click', () => {
      viz.jumpToLine(+tr.dataset.line);
      viz.el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }));
  }

  function problemCard(def, no) {
    const el = document.createElement('div');
    el.className = 'prob';
    el.id = def.id;
    if (store.get('solved:' + def.id)) el.classList.add('solved');
    el.innerHTML = '<div class="prob-head"><span class="pno">' + no + '</span><span class="ptitle">' + esc(def.title) + '</span>' +
      miniPreview(def) + (def.level ? '<span class="pill ' + def.level + '">' + def.level + '</span>' : '') + lcLink(def) +
      '<label class="done-box" title="Mark as solved"><input type="checkbox"' + (store.get('solved:' + def.id) ? ' checked' : '') + '> done</label><span class="chev">▶</span></div><div class="prob-body" hidden></div>';
    const head = el.querySelector('.prob-head'), body = el.querySelector('.prob-body');
    let built = false;
    head.addEventListener('click', e => {
      if (e.target.closest('a, label')) return;
      const open = body.hidden;
      body.hidden = !open;
      el.classList.toggle('open', open);
      if (open && !built) { built = true; renderBody(def, body); }
      if (open) history.replaceState(null, '', '#' + def.id);
    });
    el.querySelector('input').addEventListener('change', e => { store.set('solved:' + def.id, e.target.checked); el.classList.toggle('solved', e.target.checked); });
    el.open = () => { if (body.hidden) head.click(); };
    return el;
  }

  function mountProblems() {
    document.querySelectorAll('.plist[data-group]').forEach(host => {
      const g = host.dataset.group;
      const items = CN.items.filter(d => d.group === g && !d.example);
      const prefix = host.dataset.prefix || '';
      items.forEach((d, i) => host.appendChild(problemCard(d, prefix + (i + 1))));
      const h = host.previousElementSibling && host.closest('section') ? host.closest('section').querySelector('h2, h3') : null;
      if (h && !h.dataset.count) h.dataset.count = items.length;
    });
    document.querySelectorAll('[data-example]').forEach(host => {
      const def = CN.byId[host.dataset.example];
      if (!def) { host.textContent = 'missing example ' + host.dataset.example; return; }
      host.classList.add('example-box');
      host.innerHTML = '<h4>▶ ' + esc(def.title) + '</h4>' + (def.prompt ? '<div>' + def.prompt + '</div>' : '') + '<div class="viz-host"></div><details><summary class="small muted" style="cursor:pointer">Every line explained</summary><div class="lines-host"></div></details>';
      const pc = CN.parseCode(def.code);
      CN.viz(host.querySelector('.viz-host'), def, pc);
      host.querySelector('.lines-host').innerHTML = '<table class="lines">' + pc.lines.map((l, i) => '<tr class="' + (l.code.trim() ? '' : 'blank') + '"><td class="ln">' + (i + 1) + '</td><td class="lc">' + CN.highlight(l.code) + '</td><td class="lx">' + (l.why || '<span class="muted">—</span>') + '</td></tr>').join('') + '</table>';
    });
    document.querySelectorAll('pre.c').forEach(pre => {
      pre.classList.add('codeblock');
      pre.innerHTML = pre.textContent.replace(/^\n/, '').split('\n').map(CN.highlight).join('\n');
    });
    // open the problem named in the URL
    const id = location.hash.slice(1);
    const target = id && document.getElementById(id);
    if (target && target.open) { target.open(); setTimeout(() => target.scrollIntoView({ block: 'start' }), 50); }
  }

  CN.boot = function () {
    topbar();
    mountProblems();
    sidebar();
    const f = document.createElement('footer');
    f.className = 'foot';
    f.innerHTML = 'C / C++ Notes · topic-wise problem solving following the Striver A2Z DSA order · every program runs in the in-browser tracer';
    document.body.appendChild(f);
  };
  document.addEventListener('DOMContentLoaded', CN.boot);
})();
