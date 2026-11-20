// Line-by-line visualiser. CN.viz(host, def, parsedCode) -> controller
//
// Shows: the code with the running line highlighted, what that line does (fixed
// explanation + live note with the real values), the call stack with every variable,
// the console output, and tabs for the pattern grid / trace table / row analysis.
(function () {
  'use strict';
  const CN = window.CN;
  const esc = CN.esc;

  function arrHTML(v) {
    if (v.map || v.set) return '<span class="vv">' + esc(v.val) + '</span>';
    const wr = new Set((v.wr || []).map(p => String(p)));
    if (v.dims >= 3 || (Array.isArray(v.arr[0]) && Array.isArray(v.arr[0][0]))) return '<span class="vv small">' + v.dims + '-D · see the Arrays tab</span>';
    if (Array.isArray(v.arr[0]) || (v.dims === 2)) {
      const cols = Math.max(0, ...v.arr.map(r => r.length));
      let h = '<table class="mat"><tr><th></th>' + Array.from({ length: cols }, (_, j) => '<th>' + j + '</th>').join('') + '</tr>';
      v.arr.forEach((row, i) => { h += '<tr><th>' + i + '</th>' + row.map((x, j) => '<td class="' + (wr.has(i + ',' + j) ? 'hl' : '') + '">' + fmt(x, v.base) + '</td>').join('') + '</tr>'; });
      return h + '</table>';
    }
    if (v.arr.length > 24) return '<span class="vv small">size ' + v.arr.length + ' · see the Arrays tab</span>';
    return '<span class="arr">' + v.arr.map((x, i) => '<span class="cell' + (wr.has(String(i)) ? ' hl' : '') + '"><i>' + i + '</i><b>' + fmt(x, v.base) + '</b></span>').join('') + '</span>';
  }
  function fmt(x, base) {
    if (x === undefined) return '?';
    if (base === 'char') return x === 0 ? '\\0' : esc(String.fromCharCode(x));
    if (base === 'double') return Number.isInteger(x) ? x.toFixed(1) : String(+x.toFixed(4));
    return String(x);
  }
  function compactArr(v) {
    if (!v.arr) return v.val;
    if (Array.isArray(v.arr[0])) return '[' + v.arr.map(r => '[' + r.map(x => fmt(x, v.base)).join(',') + ']').join(',') + ']';
    return '[' + v.arr.map(x => fmt(x, v.base)).join(',') + ']';
  }

  CN.viz = function (host, def, pc) {
    const isGrid = !!def.grid;
    const el = document.createElement('div');
    el.className = 'viz';
    el.tabIndex = 0;
    el.innerHTML = `
      <div class="viz-bar">
        <button class="btn primary play" title="Play / pause (space)">▶ Run</button>
        <button class="btn back" title="Step back (←)">◀ Back</button>
        <button class="btn step" title="Step forward (→)">Step ▶</button>
        ${isGrid ? '<button class="btn sm nextrow" title="Run until the next line of output is finished">⏭ Next row</button>' : '<button class="btn sm nextout" title="Run until something is printed">⏭ Next print</button>'}
        <button class="btn sm reset" title="Back to the start">↺ Reset</button>
        <span class="sep"></span>
        <span class="lbl">speed</span><input class="spd" type="range" min="1" max="30" value="6">
        <button class="btn sm quizbtn" title="Hide values so you can trace by hand, click a value to reveal it">🎯 Trace it myself</button>
        <span class="stepc"></span>
      </div>
      <div class="viz-scrub"><input type="range" min="0" value="0" class="scrub" aria-label="step"></div>
      <div class="viz-in"><span>Input <span class="muted small">(what you type for scanf)</span></span><input class="inp" spellcheck="false"><button class="btn sm rerun">Run with this input</button><span class="chips"></span></div>
      <div class="quiz-tip">Practice mode: values and output are blurred. Before you press Step, say what the next value will be, then click a blurred value to check.</div>
      <div class="viz-errhost"></div>
      <div class="viz-main">
        <div class="viz-code"></div>
        <div class="viz-side">
          <div class="viz-now"><div class="now-line"></div><div class="now-note"></div><div class="now-why"></div></div>
          <div class="viz-pane-title">Variables (stack frames)</div>
          <div class="viz-vars"></div>
          <div class="viz-out"><div class="viz-pane-title">Output (console)</div><pre></pre></div>
        </div>
      </div>
      <div class="viz-tabs">
        ${def.watch ? '<button data-t="seq">Sequence</button>' : ''}
        ${def.decisions ? '<button data-t="dec">Decisions</button>' : ''}
        ${isGrid ? '<button data-t="grid">Pattern grid</button><button data-t="rows">Row analysis</button>' : ''}
        <button data-t="arr" class="arrbtn" style="display:none">Arrays</button>
        <button data-t="trace">Trace table</button>
        <button data-t="none">Hide</button>
      </div>
      <div class="viz-tab"></div>`;
    host.appendChild(el);

    const $ = s => el.querySelector(s);
    const codeEl = $('.viz-code'), varsEl = $('.viz-vars'), outEl = $('.viz-out pre'), tabEl = $('.viz-tab');
    const inp = $('.inp');
    const hasInput = /scanf|cin\s*>>/.test(pc.text);
    if (!hasInput) $('.viz-in').style.display = 'none';
    inp.value = (def.input || '').trim();
    if (def.tests) {
      const chips = $('.chips');
      chips.innerHTML = '<span class="muted small">try:</span> ' + [def.input].concat(def.tests).map(t => '<button class="chip" data-v="' + esc(t) + '">' + esc(t) + '</button>').join('');
      chips.querySelectorAll('.chip').forEach(c => c.onclick = () => { inp.value = c.dataset.v; load(); });
    }

    codeEl.innerHTML = pc.lines.map((l, i) => '<div class="row" data-l="' + (i + 1) + '"><span class="n">' + (i + 1) + '</span><span class="c">' + (CN.highlight(l.code) || ' ') + '</span></div>').join('');
    const rows = [...codeEl.children];

    let hasArrays = false, firstLoad = true, bars = !!def.bars, memView = false;
    let res, cur = 0, timer = null, tab = def.decisions ? 'dec' : def.watch ? 'seq' : isGrid ? 'grid' : 'trace', quiz = false;
    let gridLines = [], traceCols = [];

    function load() {
      stop();
      res = CTrace.run(pc.text, inp.value);
      cur = 0;
      $('.scrub').max = res.steps.length - 1;
      $('.viz-errhost').innerHTML = res.error ? '<div class="viz-err">⚠ ' + esc(res.error.msg) + (res.error.line ? ' (line ' + res.error.line + ')' : '') + '</div>' : '';
      const g = res.out.slice(res.gridStart);
      gridLines = g.split('\n'); if (gridLines[gridLines.length - 1] === '') gridLines.pop();
      // trace-table columns: every variable name that ever appears in the top frame
      const seen = new Map();
      res.steps.forEach(s => { const f = s.frames[s.frames.length - 1]; if (f) f.vars.forEach(v => { if (!seen.has(v.name)) seen.set(v.name, seen.size); }); });
      traceCols = [...seen.keys()];
      buildTraceTable();
      buildSeq();
      hasArrays = res.steps.some(st => st.frames.some(f => f.vars.some(v => v.arr || v.map || v.set)));
      $('.arrbtn').style.display = hasArrays ? '' : 'none';
      if (firstLoad) { firstLoad = false; if (hasArrays && !def.decisions && !def.watch && !isGrid) tab = 'arr'; }
      render();
    }

    // ---------- rendering one step
    function render() {
      const s = res.steps[cur];
      rows.forEach(r => r.classList.remove('cur', 'prev'));
      for (let l = s.l; l <= s.e; l++) if (rows[l - 1]) rows[l - 1].classList.add('cur');
      const first = rows[s.l - 1];
      if (first) {
        const top = first.offsetTop - codeEl.offsetTop;
        if (top < codeEl.scrollTop + 20 || top > codeEl.scrollTop + codeEl.clientHeight - 60) codeEl.scrollTop = top - codeEl.clientHeight / 3;
      }
      $('.stepc').textContent = 'step ' + cur + ' / ' + (res.steps.length - 1);
      $('.scrub').value = cur;
      $('.back').disabled = cur === 0;
      $('.step').disabled = cur >= res.steps.length - 1;
      $('.play').textContent = timer ? '⏸ Pause' : (cur >= res.steps.length - 1 ? '↺ Replay' : '▶ Run');
      const lineCode = pc.lines[s.l - 1] ? pc.lines[s.l - 1].code.trim() : '';
      $('.now-line').innerHTML = 'Line <b>' + s.l + (s.e > s.l ? '–' + s.e : '') + '</b> · <code>' + esc(lineCode.length > 70 ? lineCode.slice(0, 68) + '…' : lineCode) + '</code>';
      $('.now-note').innerHTML = s.note;
      const whys = [];
      for (let l = s.l; l <= s.e; l++) if (pc.lines[l - 1] && pc.lines[l - 1].why) whys.push(pc.lines[l - 1].why);
      $('.now-why').innerHTML = whys.length ? '<b>Why this line:</b> ' + whys.join(' ') : '';
      $('.now-why').style.display = whys.length ? '' : 'none';

      // variables
      if (!s.frames.length) varsEl.innerHTML = '<div class="muted small" style="padding:6px 0">No frames — the program is not running.</div>';
      else varsEl.innerHTML = s.frames.slice().reverse().map((f, i) => '<div class="frame' + (i === 0 ? ' top' : '') + '"><div class="frame-name">' + esc(f.name) + (i === 0 ? ' · running' : ' · waiting') + '</div>' +
        (f.vars.length ? f.vars.map(v => '<div class="vrow' + (v.changed ? ' chg' : '') + '"><span class="vt">' + esc(v.type) + '</span><span class="vn">' + esc(v.name) + '</span>' +
          (v.arr ? arrHTML(v) : '<span class="vv' + (v.val === '?' ? ' garbage' : '') + '" title="' + (v.val === '?' ? 'not initialised yet' : '') + '">' + esc(v.val) + '</span>') + (v.ref ? '<span class="muted small">→ ' + esc(v.ref) + '</span>' : '') + '</div>').join('')
          : '<div class="vrow muted small">no variables yet</div>') + '</div>').join('');

      // console
      const prev = cur > 0 ? res.steps[cur - 1].outLen : 0;
      outEl.innerHTML = consoleUpTo(s.outLen, prev) + (s.kind === 'end' ? '' : '<span class="caret"></span>');
      outEl.scrollTop = outEl.scrollHeight;

      if (tab === 'grid') renderGrid(s, prev);
      else if (tab === 'trace') syncTrace();
      else if (tab === 'rows') renderRows(s);
      else if (tab === 'seq') renderSeq();
      else if (tab === 'dec') renderDec();
      else if (tab === 'arr') renderArrays(s, prev);
      el.querySelectorAll('.viz-tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
      tabEl.style.display = tab === 'none' ? 'none' : '';
    }

    function consoleUpTo(len, prev) {
      let html = '', pos = 0;
      const piece = (a, b, cls) => {
        if (b <= a) return '';
        // highlight what this step printed
        let h = '';
        const mid1 = Math.max(a, Math.min(b, prev));
        h += cls ? '<span class="' + cls + '">' + esc(res.out.slice(a, mid1)) + '</span>' : esc(res.out.slice(a, mid1));
        if (b > mid1) h += '<span class="' + (cls ? cls + ' ' : '') + 'new">' + esc(res.out.slice(mid1, b)) + '</span>';
        return h;
      };
      for (const [a, b] of res.inputs) {
        if (a >= len) break;
        html += piece(pos, a, '') + piece(a, Math.min(b, len), 'in'); pos = Math.min(b, len);
      }
      html += piece(pos, len, '');
      return html;
    }

    // ---------- pattern grid
    function renderGrid(s, prev) {
      const W = Math.max(1, ...gridLines.map(l => l.length));
      const H = gridLines.length;
      const upto = Math.max(0, s.outLen - res.gridStart);
      const newFrom = Math.max(0, prev - res.gridStart);
      // position of every printed char
      let r = 0, c = 0;
      const filled = Array.from({ length: H }, () => []);
      const fresh = new Set();
      const text = res.out.slice(res.gridStart, res.gridStart + upto);
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '\n') { r++; c = 0; continue; }
        if (filled[r]) { filled[r][c] = ch; if (i >= newFrom) fresh.add(r + ',' + c); }
        c++;
      }
      const curRow = r;
      let h = '<div class="grid-legend"><span class="l1">printed char</span><span class="l2">printed space</span><span class="l3">printed by this step</span><span class="l4">not printed yet</span></div>';
      if (!H) { tabEl.innerHTML = h + '<p class="muted">Nothing printed yet.</p>'; return; }
      h += '<div class="pgrid" style="grid-template-columns:auto repeat(' + W + ', 26px)"><span></span>';
      for (let j = 0; j < W; j++) h += '<span class="gh">' + (j + 1) + '</span>';
      for (let i = 0; i < H; i++) {
        h += '<span class="gr' + (i === curRow && s.kind !== 'end' ? ' cur' : '') + '">line ' + (i + 1) + '</span>';
        for (let j = 0; j < W; j++) {
          const ch = filled[i][j];
          const final = gridLines[i][j];
          let cls = 'gc', t = '';
          if (ch === undefined) { cls += final === undefined ? '' : ' ghost'; }
          else if (ch === ' ') { cls += ' s'; t = '·'; }
          else { cls += ' f'; t = esc(ch); }
          if (fresh.has(i + ',' + j)) cls += ' now';
          h += '<span class="' + cls + '">' + t + '</span>';
        }
      }
      h += '</div>';
      tabEl.innerHTML = h;
    }

    // ---------- sequence table: one row per finished iteration of the watched index variable
    let seqRows = [];
    function buildSeq() {
      seqRows = [];
      if (!def.watch) return;
      // def.at = text of the line that finishes one term; a row is recorded every time it runs
      const ats = new Set([].concat(def.at || []).map(a => pc.lines.findIndex(l => l.code.includes(a)) + 1));
      res.steps.forEach((s, i) => {
        if (!ats.has(s.l) || s.kind === 'false' || s.kind === 'true') return;
        const f = s.frames[s.frames.length - 1]; const m = {};
        if (f) f.vars.forEach(v => { m[v.name] = v.val; });
        seqRows.push({ i, m });
      });
    }
    function renderSeq() {
      const W = def.watch, bar = W[1];
      const num = x => { const v = parseFloat(String(x).replace(/^'|'$/g, '')); return isFinite(v) ? v : 0; };
      const max = Math.max(1e-9, ...seqRows.map(r => Math.abs(num(r.m[bar]))));
      let h = '<p class="small muted" style="margin-top:0">One row each time line <b>' + [].concat(def.at || []).map(a => pc.lines.findIndex(l => l.code.includes(a)) + 1).join(' / ') + '</b> runs (values right after it). The bar shows <code>' + esc(bar) + '</code>: watch how it changes from one row to the next.</p>';
      h += '<table class="ttable seqt"><thead><tr><th>#</th>' + W.map(w => '<th>' + esc(w) + '</th>').join('') + '<th style="width:40%">' + esc(bar) + '</th></tr></thead><tbody>';
      seqRows.forEach((r, k) => {
        const v = num(r.m[bar]);
        const w = Math.max(1, Math.round(Math.abs(v) / max * 100));
        h += '<tr data-i="' + r.i + '" class="' + (r.i > cur ? 'fut' : '') + '"><td>' + (k + 1) + '</td>' + W.map(x => '<td>' + esc(r.m[x] === undefined ? '' : r.m[x]) + '</td>').join('') +
          '<td style="text-align:left"><span class="sbar' + (v < 0 ? ' neg' : '') + '" style="width:' + w + '%"></span></td></tr>';
      });
      h += '</tbody></table>';
      if (!seqRows.length) h = '<p class="muted">No iterations yet.</p>';
      tabEl.innerHTML = h;
      let best = null;
      tabEl.querySelectorAll('tr[data-i]').forEach(tr => { tr.addEventListener('click', () => { stop(); cur = +tr.dataset.i; render(); }); if (+tr.dataset.i <= cur) best = tr; });
      if (best) best.classList.add('cur');
    }

    // ---------- arrays: big view of every array / vector / map / set with index pointers
    const PCOL = ['#4f46e5', '#0e9f6e', '#e8590c', '#d6336c', '#0b7285', '#9c36b5', '#c08a00', '#1971c2'];
    const pcolor = name => PCOL[[...name].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) % PCOL.length];
    const RANGES = [['low', 'high'], ['lo', 'hi'], ['left', 'right'], ['l', 'r'], ['start', 'end'], ['s', 'e']];
    const SIZE = { int: 4, long: 8, double: 8, char: 1, bool: 1 };
    function pathKey(p) { return Array.isArray(p) ? p.join(',') : String(p); }
    function hitOf(paths, P) { // 2 = this exact cell, 1 = a whole row/slice containing it
      if (!paths) return 0;
      let r = 0;
      for (const q of paths) {
        if (!Array.isArray(q)) continue;
        if (q.length === P.length && q.every((x, i) => x === P[i])) return 2;
        if (q.length < P.length && q.every((x, i) => x === P[i])) r = 1;
      }
      return r;
    }
    function renderArrays(s) {
      const items = [], byKey = {};
      s.frames.forEach((f, fi) => f.vars.forEach(v => {
        if (!(v.arr || v.map || v.set)) return;
        let it = byKey[v.key];
        if (!it) { it = byKey[v.key] = { v, names: [], frames: [] }; items.push(it); }
        if (!v.refKey) it.v = Object.assign({}, it.v, { name: v.name, type: v.type });
        it.names.push(v.name + (v.refKey ? ' in ' + f.name : ''));
        it.frames.push(fi);
      }));
      if (!items.length) { tabEl.innerHTML = '<p class="muted">No arrays exist at this step.</p>'; return; }
      const scalarIn = fis => { // pointer variables visible to this array (top frame first)
        const m = {};
        const order = [s.frames.length - 1].concat(fis.slice().reverse());
        order.forEach(fi => { const f = s.frames[fi]; if (f) f.vars.forEach(v => { if (!v.arr && !v.map && !v.set && m[v.name] === undefined && /^-?\d+$/.test(v.val)) m[v.name] = +v.val; }); });
        return m;
      };
      let h = '<div class="av-tools"><label><input type="checkbox" class="t-bars"' + (bars ? ' checked' : '') + '> bar chart</label><label><input type="checkbox" class="t-mem"' + (memView ? ' checked' : '') + '> memory layout</label><span class="av-legend"><span class="lg rd">read</span><span class="lg wr">written</span><span class="lg inr">range</span></span></div>';
      items.forEach(it => { h += containerHTML(it, scalarIn(it.frames)); });
      tabEl.innerHTML = h;
      tabEl.querySelector('.t-bars').onchange = e => { bars = e.target.checked; render(); };
      tabEl.querySelector('.t-mem').onchange = e => { memView = e.target.checked; render(); };
    }
    function ptrTags(list) { return list.map(p => '<span class="ptag" style="--pc:' + pcolor(p) + '">' + esc(p) + '</span>').join(''); }
    function containerHTML(it, sc) {
      const v = it.v;
      let shape = '';
      if (v.arr && !v.vec) { let x = v.arr; while (Array.isArray(x)) { shape += '[' + x.length + ']'; x = x[0]; } }
      const head = '<div class="av-head"><b>' + esc(v.name) + '</b><span class="muted">' + esc(shape ? v.type.replace(/(\[\])+$/, '') + shape : v.type) + (v.arr ? (v.vec ? ' · size ' + v.arr.length : '')  : v.map ? ' · ' + v.map.length + ' keys' : ' · ' + v.set.length + ' items') + '</span>' + (it.names.length > 1 ? '<span class="av-alias">also seen as ' + esc(it.names.slice(1).join(', ')) + '</span>' : '') + '</div>';
      if (v.map) {
        const wr = new Set((v.wr || []).map(String)), rd = new Set((v.rd || []).map(String));
        return '<div class="av">' + head + (v.map.length ? '<table class="amap"><tr><th>key</th><th>value</th></tr>' + v.map.map(([k, x]) => '<tr class="' + (wr.has(String(k)) ? 'wr' : rd.has(String(k)) ? 'rd' : '') + '"><td>' + fmt(k, v.kb) + '</td><td>' + fmt(x, v.vb) + '</td></tr>').join('') + '</table>' : '<p class="muted small">empty</p>') + '</div>';
      }
      if (v.set) {
        const wr = new Set((v.wr || []).map(String)), rd = new Set((v.rd || []).map(String));
        return '<div class="av">' + head + '<div class="aset">' + (v.set.length ? v.set.map(x => '<span class="' + (wr.has(String(x)) ? 'wr' : rd.has(String(x)) ? 'rd' : '') + '">' + fmt(x, v.vb) + '</span>').join('') : '<span class="muted small">empty</span>') + '</div></div>';
      }
      const dims = Math.max(1, v.dims || 1);
      const ptrs = d => (v.idxv && v.idxv[d] || []).concat(d === 0 && def.ptrs ? def.ptrs : []).filter((n, i, a) => a.indexOf(n) === i && sc[n] !== undefined).map(n => ({ n, i: sc[n] }));
      let body = '';
      if (dims === 1) body = oneD(v, v.arr, [], ptrs(0), sc);
      else body = nD(v, v.arr, [], 0, ptrs, dims);
      if (memView) body += memHTML(v, dims);
      return '<div class="av">' + head + body + '</div>';
    }
    function oneD(v, arr, prefix, P, sc) {
      const N = arr.length;
      const W = N > 24 ? 30 : N > 14 ? 38 : 46;
      const lo = Math.min(0, ...P.map(p => p.i)), hi = Math.max(N - 1, ...P.map(p => p.i));
      const start = Math.max(lo, -1), end = Math.min(hi, N);
      const cols = end - start + 1;
      let range = null;
      const pairs = def.range ? [def.range] : RANGES;
      for (const [a, b] of pairs) if (sc[a] !== undefined && sc[b] !== undefined && P.some(p => p.n === a) && P.some(p => p.n === b)) { range = [sc[a], sc[b]]; break; }
      const nums = arr.map(x => typeof x === 'number' ? x : 0);
      const mx = Math.max(1, ...nums.map(Math.abs));
      let h = '<div class="av-scroll"><div class="av-grid" style="grid-template-columns:repeat(' + cols + ',' + W + 'px)">';
      if (bars) for (let i = start; i <= end; i++) {
        const x = nums[i];
        h += '<span class="av-bar">' + (i >= 0 && i < N ? '<i class="' + (x < 0 ? 'neg' : '') + (hitOf(v.wr, prefix.concat([i])) ? ' wr' : hitOf(v.rd, prefix.concat([i])) ? ' rd' : '') + '" style="height:' + Math.max(2, Math.round(Math.abs(x) / mx * 86)) + 'px"></i>' : '') + '</span>';
      }
      for (let i = start; i <= end; i++) h += '<span class="av-i">' + (i >= 0 && i < N ? i : '') + '</span>';
      for (let i = start; i <= end; i++) {
        if (i < 0 || i >= N) { h += '<span class="av-c ghost">' + (i < 0 ? '−1' : 'end') + '</span>'; continue; }
        const P2 = prefix.concat([i]);
        const w = hitOf(v.wr, P2), r = hitOf(v.rd, P2);
        const inr = range && i >= Math.min(range[0], range[1]) && i <= Math.max(range[0], range[1]) && range[0] <= range[1];
        h += '<span class="av-c' + (w ? ' wr' : r ? ' rd' : '') + (inr ? ' inr' : '') + '">' + fmt(arr[i], v.base) + '</span>';
      }
      for (let i = start; i <= end; i++) {
        const here = P.filter(p => p.i === i).map(p => p.n);
        h += '<span class="av-p">' + (here.length ? '<span class="arrow">▲</span>' + ptrTags(here) : '') + '</span>';
      }
      h += '</div></div>';
      return h;
    }
    function matrix(v, a, prefix, rp, cp) {
      const cols = Math.max(0, ...a.map(r => Array.isArray(r) ? r.length : 0));
      const rowHit = new Set(rp.map(p => p.i)), colHit = new Set(cp.map(p => p.i));
      let h = '<div class="av-scroll"><table class="am"><tr><th class="corner"></th>';
      for (let j = 0; j < cols; j++) { const t = cp.filter(p => p.i === j).map(p => p.n); h += '<th class="ch' + (colHit.has(j) ? ' hit' : '') + '">' + j + (t.length ? '<div>' + ptrTags(t) + '</div>' : '') + '</th>'; }
      h += '</tr>';
      a.forEach((row, i) => {
        const t = rp.filter(p => p.i === i).map(p => p.n);
        h += '<tr><th class="rh' + (rowHit.has(i) ? ' hit' : '') + '">' + (t.length ? ptrTags(t) + ' ' : '') + i + '</th>';
        for (let j = 0; j < cols; j++) {
          if (!Array.isArray(row) || j >= row.length) { h += '<td class="empty"></td>'; continue; }
          const P2 = prefix.concat([i, j]);
          const w = hitOf(v.wr, P2), r = hitOf(v.rd, P2);
          const cross = (rowHit.has(i) ? 1 : 0) + (colHit.has(j) ? 1 : 0);
          h += '<td class="' + (w ? 'wr' : r ? 'rd' : '') + (cross === 2 ? ' xhit' : cross ? ' xline' : '') + '">' + fmt(row[j], v.base) + '</td>';
        }
        h += '</tr>';
      });
      return h + '</table></div>';
    }
    function nD(v, a, prefix, d, ptrs, dims, active = true) {
      if (dims - d === 2) return matrix(v, a, prefix, active ? ptrs(d) : [], active ? ptrs(d + 1) : []);
      const lp = ptrs(d);
      return '<div class="slices">' + a.map((sub, k) => {
        const t = lp.filter(p => p.i === k).map(p => p.n);
        const on = active && (!lp.length || t.length > 0);   // only the selected layer gets the crosshair
        return '<div class="slice' + (t.length && active ? ' hit' : '') + '"><div class="slice-h">' + esc(v.name) + prefix.map(x => '[' + x + ']').join('') + '[' + k + ']' + (t.length ? ' ' + ptrTags(t) : '') + '</div>' + nD(v, sub, prefix.concat([k]), d + 1, ptrs, dims, on) + '</div>';
      }).join('') + '</div>';
    }
    function memHTML(v, dims) {
      const sz = SIZE[v.base] || 4, base = 1000;
      if (v.vec && dims > 1) return '<p class="small muted mem-note">A <code>vector&lt;vector&lt;…&gt;&gt;</code> is <b>not</b> one block: every row is a separate vector somewhere on the heap, so there is no single address formula. Plain C arrays (<code>int a[R][C]</code>) are one contiguous block.</p>';
      const shape = []; let x = v.arr; for (let d = 0; d < dims; d++) { shape.push(Array.isArray(x) ? x.length : 0); x = Array.isArray(x) ? x[0] : undefined; }
      const stride = shape.map((_, d) => shape.slice(d + 1).reduce((a, b) => a * b, 1));
      const flat = [];
      (function walk(a, p) { a.forEach((y, i) => { if (Array.isArray(y)) walk(y, p.concat([i])); else flat.push([p.concat([i]), y]); }); })(v.arr, []);
      const focus = (v.wr && v.wr.find(Array.isArray)) || (v.rd && v.rd.find(q => Array.isArray(q) && q.length === dims));
      let h = '<div class="mem"><div class="mem-h">Memory (row-major): the elements sit one after another, ' + sz + ' bytes each, starting at address ' + base + '.</div><div class="av-scroll"><div class="mem-row">';
      flat.forEach(([P, y]) => {
        const off = P.reduce((s2, i, d) => s2 + i * stride[d], 0);
        const on = focus && focus.length === P.length && focus.every((q, i) => q === P[i]);
        h += '<div class="mcell' + (on ? ' on' : '') + (dims > 1 && P[P.length - 1] === 0 && off ? ' rowstart' : '') + '"><b>' + fmt(y, v.base) + '</b><i>' + P.map(i => '[' + i + ']').join('') + '</i><em>' + (base + off * sz) + '</em></div>';
      });
      h += '</div></div>';
      if (focus && focus.length === dims) {
        const off = focus.reduce((s2, i, d) => s2 + i * stride[d], 0);
        const terms = focus.map((i, d) => stride[d] === 1 ? String(i) : i + '×' + stride[d]).join(' + ');
        h += '<div class="mem-f">&amp;' + esc(v.name) + focus.map(i => '[' + i + ']').join('') + ' = ' + base + ' + (' + terms + ') × ' + sz + ' = ' + base + ' + ' + off * sz + ' = <b>' + (base + off * sz) + '</b>' + (dims > 1 ? ' <span class="muted">(stride of each index = number of elements one step of it skips: ' + stride.join(', ') + ')</span>' : '') + '</div>';
      }
      return h + '</div>';
    }

    // ---------- decisions: every if / switch check, in the order it happened
    function renderDec() {
      const isDecision = l => /^(}\s*)?(else\s+)?if\b|^switch\b/.test((pc.lines[l - 1] || { code: '' }).code.trim());
      const rows = [];
      res.steps.forEach((s, i) => { if ((s.kind === 'true' || s.kind === 'false') && isDecision(s.l)) rows.push(i); });
      let h = '<p class="small muted" style="margin-top:0">Every decision the program made, in order. In an if / else-if ladder the checks stop at the <b>first true</b> one, and the conditions after it are never looked at. Change the input to send the program down another branch.</p>';
      if (!rows.length) { tabEl.innerHTML = h + '<p class="muted">No if / switch checks in this program.</p>'; return; }
      h += '<table class="ttable dect"><thead><tr><th>#</th><th>line</th><th>check</th><th>result</th></tr></thead><tbody>';
      let best = -1;
      rows.forEach((i, k) => {
        const s = res.steps[i];
        if (i <= cur) best = i;
        const note = s.note.replace(/<(?!\/?(code|b)\b)[^>]*>/g, '').replace(/ → <b class="(yes|no)">(true|false)<\/b>.*$/, '').replace(/^(Check|switch on) /, '');
        h += '<tr data-i="' + i + '" class="' + (i > cur ? 'fut' : '') + '"><td>' + (k + 1) + '</td><td>' + s.l + '</td><td class="note">' + note + '</td><td><span class="pill ' + (s.kind === 'true' ? 'easy">true' : 'hard">false') + '</span></td></tr>';
      });
      h += '</tbody></table>';
      tabEl.innerHTML = h;
      tabEl.querySelectorAll('tr[data-i]').forEach(tr => { tr.addEventListener('click', () => { stop(); cur = +tr.dataset.i; render(); }); if (+tr.dataset.i === best) tr.classList.add('cur'); });
    }

    // ---------- row analysis: count spaces & characters in each finished line
    function renderRows(s) {
      const upto = Math.max(0, s.outLen - res.gridStart);
      const done = res.out.slice(res.gridStart, res.gridStart + upto).split('\n').length - 1;
      let h = '<p class="small muted" style="margin-top:0">Every pattern is “for each row, print <i>this many</i> spaces then <i>this many</i> characters”. Read the columns top to bottom and find how each count changes with the row number — that change is your loop limit.</p>';
      h += '<table class="tbl formula"><tr><th>line</th><th>leading spaces</th><th>other chars</th><th>total width</th><th>printed (· = space)</th></tr>';
      gridLines.forEach((l, i) => {
        const lead = l.length - l.replace(/^ +/, '').length;
        const other = l.slice(lead).replace(/ +$/, '').length;
        h += '<tr style="' + (i >= done ? 'color:#c1c7d3' : '') + '"><td>' + (i + 1) + '</td><td>' + lead + '</td><td>' + other + '</td><td>' + l.length + '</td><td style="text-align:left">' + esc(l).replace(/ /g, '<span style="color:#c4cad6">·</span>') + '</td></tr>';
      });
      tabEl.innerHTML = h + '</table>';
    }

    // ---------- trace table (manual tracing on paper, but automatic)
    let traceRows = [];
    function buildTraceTable() {
      traceRows = [];
      let lastOut = 0;
      res.steps.forEach((s, i) => {
        const f = s.frames[s.frames.length - 1];
        const anyChg = f && f.vars.some(v => v.changed);
        const printed = s.outLen > lastOut;
        if (anyChg || printed || s.kind === 'true' || s.kind === 'false' || i === 0 || s.kind === 'end' || s.kind === 'error') traceRows.push(i);
        lastOut = s.outLen;
      });
      let lastOutLen = 0;
      const multi = new Set(res.steps.filter(s => s.frames.length).map(s => s.frames[s.frames.length - 1].name)).size > 1;
      let h = '<p class="small muted" style="margin-top:0">This is the table you would draw when tracing by hand. A highlighted cell means the value changed at that step. Click a row to jump to it.</p><table class="ttable"><thead><tr><th>step</th><th>line</th>' + (multi ? '<th>function</th>' : '') + traceCols.map(c => '<th>' + esc(c) + '</th>').join('') + '<th>printed</th><th>what happened</th></tr></thead><tbody>';
      traceRows.forEach(i => {
        const s = res.steps[i];
        const f = s.frames[s.frames.length - 1];
        const vm = {};
        if (f) f.vars.forEach(v => { vm[v.name] = v; });
        const prevLen = i > 0 ? res.steps[i - 1].outLen : 0;
        let printed = res.out.slice(prevLen, s.outLen);
        const inputEcho = res.inputs.some(([a, b]) => a >= prevLen && b <= s.outLen && b > a);
        printed = inputEcho ? '' : printed;
        h += '<tr data-i="' + i + '"><td>' + i + '</td><td>' + s.l + '</td>' + (multi ? '<td>' + esc(f ? f.name : '') + '</td>' : '') + traceCols.map(c => {
          const v = vm[c];
          if (!v) return '<td></td>';
          return '<td class="' + (v.changed ? 'chg' : '') + '">' + esc(v.arr ? compactArr(v) : v.val) + '</td>';
        }).join('') + '<td class="o">' + (printed ? '<span class="outq">' + esc(printed).replace(/ /g, '<span class="sp">·</span>').replace(/\n/g, '<span class="nl">↵</span>') + '</span>' : '') + '</td><td class="note">' + s.note.replace(/<(?!\/?(code|b)\b)[^>]*>/g, '') + '</td></tr>';
        lastOutLen = s.outLen;
      });
      h += '</tbody></table>';
      el._traceHTML = h;
    }
    function syncTrace() {
      if (!tabEl.querySelector('.ttable')) {
        tabEl.innerHTML = el._traceHTML;
        tabEl.querySelectorAll('tr[data-i]').forEach(tr => tr.addEventListener('click', () => { stop(); cur = +tr.dataset.i; render(); }));
      }
      let best = null;
      tabEl.querySelectorAll('tr[data-i]').forEach(tr => {
        const i = +tr.dataset.i;
        tr.classList.toggle('fut', i > cur);
        tr.classList.remove('cur');
        if (i <= cur) best = tr;
      });
      if (best) {
        best.classList.add('cur');
        const t = best.offsetTop - tabEl.offsetTop;
        if (t < tabEl.scrollTop + 30 || t > tabEl.scrollTop + tabEl.clientHeight - 30) tabEl.scrollTop = t - tabEl.clientHeight / 2;
      }
    }

    // ---------- controls
    function speed() { return 1000 / +$('.spd').value; }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function go(i) { cur = Math.max(0, Math.min(res.steps.length - 1, i)); render(); }
    function play() {
      if (timer) { stop(); render(); return; }
      if (cur >= res.steps.length - 1) cur = 0;
      timer = setInterval(() => { if (cur >= res.steps.length - 1) { stop(); render(); return; } cur++; render(); }, speed());
      render();
    }
    $('.play').onclick = play;
    $('.step').onclick = () => { stop(); go(cur + 1); };
    $('.back').onclick = () => { stop(); go(cur - 1); };
    $('.reset').onclick = () => { stop(); go(0); };
    $('.scrub').oninput = e => { stop(); go(+e.target.value); };
    $('.spd').oninput = () => { if (timer) { stop(); play(); } };
    $('.rerun').onclick = load;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') load(); });
    const nr = $('.nextrow');
    if (nr) nr.onclick = () => {
      stop();
      const nlCount = i => (res.out.slice(0, res.steps[i].outLen).match(/\n/g) || []).length;
      const base = nlCount(cur);
      let i = cur + 1; while (i < res.steps.length - 1 && nlCount(i) <= base) i++;
      go(i);
    };
    const no = $('.nextout');
    if (no) no.onclick = () => { stop(); const base = res.steps[cur].outLen; let i = cur + 1; while (i < res.steps.length - 1 && res.steps[i].outLen <= base) i++; go(i); };
    $('.quizbtn').onclick = () => { quiz = !quiz; el.classList.toggle('quiz', quiz); $('.quizbtn').classList.toggle('primary', quiz); };
    el.addEventListener('click', e => { if (quiz) { const t = e.target.closest('.vv, .viz-out pre, .arr .cell b'); if (t) t.classList.add('reveal'); } });
    el.querySelectorAll('.viz-tabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; tabEl.innerHTML = ''; render(); });
    rows.forEach(r => r.addEventListener('click', () => jumpToLine(+r.dataset.l)));
    el.addEventListener('keydown', e => {
      if (e.target === inp) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); stop(); go(cur + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(cur - 1); }
      else if (e.key === ' ') { e.preventDefault(); play(); }
    });

    // jump to the next time this line runs (wrapping around)
    function jumpToLine(l) {
      stop();
      const n = res.steps.length;
      for (let k = 1; k <= n; k++) { const i = (cur + k) % n; const s = res.steps[i]; if (l >= s.l && l <= s.e) { go(i); return; } }
    }

    load();
    return { el, jumpToLine, reload: load };
  };
})();
