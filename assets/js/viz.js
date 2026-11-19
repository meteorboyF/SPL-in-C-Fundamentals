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
    if (Array.isArray(v.arr[0])) {
      const hl = new Set((v.hl || []).map(p => p.join(',')));
      const cols = v.arr[0].length;
      let h = '<table class="mat"><tr><th></th>' + Array.from({ length: cols }, (_, j) => '<th>' + j + '</th>').join('') + '</tr>';
      v.arr.forEach((row, i) => { h += '<tr><th>' + i + '</th>' + row.map((x, j) => '<td class="' + (hl.has(i + ',' + j) ? 'hl' : '') + '">' + fmt(x, v.base) + '</td>').join('') + '</tr>'; });
      return h + '</table>';
    }
    const hl = new Set((v.hl || []).map(p => String(p[0])));
    return '<span class="arr">' + v.arr.map((x, i) => '<span class="cell' + (hl.has(String(i)) ? ' hl' : '') + '"><i>' + i + '</i><b>' + fmt(x, v.base) + '</b></span>').join('') + '</span>';
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
      <div class="viz-in"><span>Input <span class="muted small">(what you type for scanf)</span></span><input class="inp" spellcheck="false"><button class="btn sm rerun">Run with this input</button></div>
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
        ${isGrid ? '<button data-t="grid">Pattern grid</button><button data-t="rows">Row analysis</button>' : ''}
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

    codeEl.innerHTML = pc.lines.map((l, i) => '<div class="row" data-l="' + (i + 1) + '"><span class="n">' + (i + 1) + '</span><span class="c">' + (CN.highlight(l.code) || ' ') + '</span></div>').join('');
    const rows = [...codeEl.children];

    let res, cur = 0, timer = null, tab = isGrid ? 'grid' : 'trace', quiz = false;
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
