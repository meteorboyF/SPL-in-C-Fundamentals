// CTrace — a tiny C / C++ interpreter that records a step for every line it runs.
//
// It understands the subset of C/C++ used in these notes: int / long long / char /
// float / double / bool variables, 1D and 2D arrays, all operators, if / else,
// switch, for / while / do-while, break / continue, functions (with recursion),
// printf / scanf / putchar / puts, cout / cin, and a few <math.h> helpers.
//
// CTrace.run(code, stdin) -> { steps, out, inputs, error, gridStart }
//   steps[i] = { l: firstLine, e: lastLine, note, frames, outLen, changed, kind }
(function () {
  'use strict';

  const MAX_STEPS = 30000;

  // ------------------------------------------------------------------ lexer
  const PUNCT = ['<<=', '>>=', '...', '->', '++', '--', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||',
    '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '::',
    '+', '-', '*', '/', '%', '<', '>', '=', '!', '~', '&', '|', '^', '?', ':', ';', ',', '.', '(', ')', '[', ']', '{', '}'];
  const TYPE_WORDS = new Set(['int', 'char', 'float', 'double', 'long', 'short', 'unsigned', 'signed', 'bool', 'void', 'const', 'static', 'auto']);
  const ESC = { n: '\n', t: '\t', '0': '\0', '\\': '\\', "'": "'", '"': '"', r: '\r', a: '\x07', b: '\b' };

  function CError(msg, line) { const e = new Error(msg); e.cline = line; return e; }

  function lex(src) {
    const toks = [];
    const defines = {};
    let i = 0, line = 1;
    const n = src.length;
    while (i < n) {
      const c = src[i];
      if (c === '\n') { line++; i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') {
        i += 2;
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
        i += 2; continue;
      }
      if (c === '#') { // preprocessor: only simple object-like #define is honoured
        let j = i; while (j < n && src[j] !== '\n') j++;
        const m = /^#\s*define\s+([A-Za-z_]\w*)\s+(.+)$/.exec(src.slice(i, j).trim());
        if (m) defines[m[1]] = lex(m[2]).toks;
        i = j; continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1]))) {
        let j = i, isFloat = false, v;
        if (c === '0' && /[xX]/.test(src[i + 1])) {
          j += 2; while (/[0-9a-fA-F]/.test(src[j])) j++;
          v = parseInt(src.slice(i, j), 16);
        } else {
          while (/[0-9]/.test(src[j])) j++;
          if (src[j] === '.') { isFloat = true; j++; while (/[0-9]/.test(src[j])) j++; }
          if (/[eE]/.test(src[j])) { isFloat = true; j++; if (/[+-]/.test(src[j])) j++; while (/[0-9]/.test(src[j])) j++; }
          v = parseFloat(src.slice(i, j));
        }
        let suf = '';
        while (/[uUlLfF]/.test(src[j])) { suf += src[j]; j++; }
        const t = isFloat || /f/i.test(suf) ? 'double' : (/l/i.test(suf) ? 'long' : 'int');
        toks.push({ k: 'num', v, t: t === 'int' && v > 2147483647 ? 'long' : t, line, text: src.slice(i, j) });
        i = j; continue;
      }
      if (c === "'") {
        let j = i + 1, ch;
        if (src[j] === '\\') { ch = ESC[src[j + 1]] !== undefined ? ESC[src[j + 1]] : src[j + 1]; j += 2; } else { ch = src[j]; j++; }
        if (src[j] !== "'") throw CError('bad character literal', line);
        toks.push({ k: 'num', v: ch.charCodeAt(0), t: 'char', line, text: src.slice(i, j + 1) });
        i = j + 1; continue;
      }
      if (c === '"') {
        let j = i + 1, s = '';
        while (j < n && src[j] !== '"') {
          if (src[j] === '\\') { const e = src[j + 1]; s += ESC[e] !== undefined ? ESC[e] : e; j += 2; } else { s += src[j]; j++; }
        }
        // adjacent string literals are joined, like C does
        const last = toks[toks.length - 1];
        if (last && last.k === 'str') { last.v += s; last.text += src.slice(i, j + 1); } else toks.push({ k: 'str', v: s, line, text: src.slice(i, j + 1) });
        i = j + 1; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i; while (j < n && /\w/.test(src[j])) j++;
        const w = src.slice(i, j);
        if (defines[w]) defines[w].forEach(t => toks.push(Object.assign({}, t, { line })));
        else toks.push({ k: 'id', v: w, line, text: w });
        i = j; continue;
      }
      const p = PUNCT.find(p => src.startsWith(p, i));
      if (!p) throw CError('unexpected character ' + c, line);
      toks.push({ k: 'p', v: p, line, text: p });
      i += p.length;
    }
    toks.push({ k: 'eof', v: '', line, text: '' });
    return { toks, defines };
  }

  // ------------------------------------------------------------------ parser
  function parse(src) {
    const { toks } = lex(src);
    let p = 0;
    const peek = (o = 0) => toks[p + o];
    const next = () => toks[p++];
    const is = (v, o = 0) => { const t = toks[p + o]; return t && (t.k === 'p' || t.k === 'id') && t.v === v; };
    const accept = v => { if (is(v)) { p++; return true; } return false; };
    const expect = v => { if (!is(v)) throw CError('expected "' + v + '" but found "' + (peek().text || 'end of file') + '"', peek().line); return next(); };
    const isTypeStart = (o = 0) => {
      const t = peek(o);
      return t && t.k === 'id' && (TYPE_WORDS.has(t.v) || t.v === 'string');
    };

    function parseType() {
      const words = [];
      while (isTypeStart()) words.push(next().v);
      let base = 'int';
      if (words.includes('char')) base = 'char';
      else if (words.includes('double') || words.includes('float')) base = 'double';
      else if (words.includes('bool')) base = 'bool';
      else if (words.includes('void')) base = 'void';
      else if (words.includes('string')) base = 'string';
      else if (words.filter(w => w === 'long').length) base = 'long';
      const name = words.filter(w => w !== 'const' && w !== 'static' && w !== 'signed').join(' ').replace('float', 'float');
      return { base, name: name || 'int' };
    }

    function program() {
      const funcs = {}, globals = [];
      while (peek().k !== 'eof') {
        if (is('using')) { while (!accept(';')) next(); continue; }
        if (is('typedef')) throw CError('typedef is not supported by the visualiser', peek().line);
        const startLine = peek().line;
        const type = parseType();
        const nameTok = next();
        if (nameTok.k !== 'id') throw CError('expected a name', nameTok.line);
        if (is('(')) {
          next();
          const params = [];
          if (!is(')')) {
            do {
              if (is('void') && is(')', 1)) { next(); break; }
              const pt = parseType();
              let byRef = accept('&');
              const pn = next().v;
              let dims = 0;
              while (accept('[')) { while (!is(']')) next(); expect(']'); dims++; }
              params.push({ type: pt, name: pn, dims, byRef });
            } while (accept(','));
          }
          expect(')');
          if (accept(';')) continue; // prototype
          const body = block();
          funcs[nameTok.v] = { name: nameTok.v, type, params, body, line: startLine };
        } else {
          p--; // back to the name
          globals.push(declRest(type, startLine));
        }
      }
      return { funcs, globals };
    }

    function declRest(type, line) {
      const vars = [];
      do {
        const name = next();
        if (name.k !== 'id') throw CError('expected a variable name', name.line);
        const dims = [];
        while (accept('[')) { dims.push(is(']') ? null : expr()); expect(']'); }
        let init = null;
        if (accept('=')) init = is('{') ? initList() : assign();
        else if (is('(') && !dims.length) { next(); init = expr(); expect(')'); }
        vars.push({ name: name.v, dims, init });
      } while (accept(','));
      const end = expect(';').line;
      return { k: 'decl', type, vars, line, end };
    }

    function initList() {
      expect('{');
      const items = [];
      if (!is('}')) {
        do { if (is('}')) break; items.push(is('{') ? initList() : assign()); } while (accept(','));
      }
      expect('}');
      return { k: 'list', items };
    }

    function block() {
      const line = expect('{').line;
      const body = [];
      while (!is('}')) body.push(statement());
      const end = expect('}').line;
      return { k: 'block', body, line, end };
    }

    function statement() {
      const t = peek();
      const line = t.line;
      if (is('{')) return block();
      if (accept(';')) return { k: 'empty', line, end: line };
      if (is('if')) {
        next(); expect('(');
        const cond = expr();
        const end = expect(')').line;
        const then = statement();
        let els = null, elseLine = null;
        if (is('else')) { elseLine = next().line; els = statement(); }
        return { k: 'if', cond, then, els, line, end, elseLine };
      }
      if (is('while')) {
        next(); expect('(');
        const cond = expr();
        const end = expect(')').line;
        return { k: 'while', cond, body: statement(), line, end };
      }
      if (is('do')) {
        next();
        const body = statement();
        const wl = expect('while').line; expect('(');
        const cond = expr(); expect(')'); const end = expect(';').line;
        return { k: 'do', body, cond, line, end, condLine: wl };
      }
      if (is('for')) {
        next(); expect('(');
        let init = null;
        if (!is(';')) {
          if (isTypeStart()) init = declRest(parseType(), line);
          else { init = { k: 'expr', e: expr(), line }; expect(';'); }
        } else expect(';');
        const cond = is(';') ? null : expr(); expect(';');
        const upd = is(')') ? null : expr();
        const end = expect(')').line;
        return { k: 'for', init, cond, upd, body: statement(), line, end };
      }
      if (is('switch')) {
        next(); expect('(');
        const disc = expr();
        const end = expect(')').line;
        expect('{');
        const cases = []; let cur = null;
        while (!is('}')) {
          if (is('case')) {
            const cl = next().line; const v = cond(); expect(':');
            cur = { test: v, body: [], line: cl }; cases.push(cur);
          } else if (is('default')) {
            const cl = next().line; expect(':');
            cur = { test: null, body: [], line: cl }; cases.push(cur);
          } else {
            if (!cur) throw CError('statement before first case', peek().line);
            cur.body.push(statement());
          }
        }
        const close = expect('}').line;
        return { k: 'switch', disc, cases, line, end, close };
      }
      if (is('break')) { next(); expect(';'); return { k: 'break', line, end: line }; }
      if (is('continue')) { next(); expect(';'); return { k: 'continue', line, end: line }; }
      if (is('return')) {
        next();
        const e = is(';') ? null : expr();
        const end = expect(';').line;
        return { k: 'return', e, line, end };
      }
      if (isTypeStart() && !(peek(1).k === 'p' && peek(1).v === '(')) return declRest(parseType(), line);
      const e = expr();
      const end = expect(';').line;
      return { k: 'expr', e, line, end };
    }

    // expressions (precedence climbing)
    const BIN = [
      ['||'], ['&&'], ['|'], ['^'], ['&'], ['==', '!='], ['<', '<=', '>', '>='], ['<<', '>>'], ['+', '-'], ['*', '/', '%']
    ];
    const ASSIGN = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=']);

    function expr() {
      let e = assign();
      while (is(',')) { next(); e = { k: 'comma', a: e, b: assign() }; }
      return e;
    }
    function assign() {
      const left = cond();
      const t = peek();
      if (t.k === 'p' && ASSIGN.has(t.v)) { next(); return { k: 'assign', op: t.v, target: left, value: assign() }; }
      return left;
    }
    function cond() {
      const c = binary(0);
      if (accept('?')) { const a = assign(); expect(':'); const b = cond(); return { k: 'tern', c, a, b }; }
      return c;
    }
    function binary(level) {
      if (level >= BIN.length) return unary();
      let left = binary(level + 1);
      for (;;) {
        const t = peek();
        if (t.k === 'p' && BIN[level].includes(t.v)) { next(); left = { k: 'bin', op: t.v, a: left, b: binary(level + 1) }; } else break;
      }
      return left;
    }
    function unary() {
      const t = peek();
      if (t.k === 'p' && ['!', '-', '+', '~', '++', '--', '&', '*'].includes(t.v)) {
        next();
        const a = unary();
        if (t.v === '++' || t.v === '--') return { k: 'pre', op: t.v, a };
        if (t.v === '&') return { k: 'addr', a };
        if (t.v === '*') throw CError('pointers are not supported by the visualiser yet', t.line);
        return { k: 'un', op: t.v, a };
      }
      if (is('(') && isTypeStart(1)) {
        next(); const ty = parseType(); expect(')');
        return { k: 'cast', type: ty, a: unary() };
      }
      if (is('sizeof')) {
        next(); expect('('); const ty = isTypeStart() ? parseType() : null; let a = null; if (!ty) a = expr(); expect(')');
        return { k: 'sizeof', type: ty, a };
      }
      return postfix();
    }
    function postfix() {
      let e = primary();
      for (;;) {
        if (is('[')) { next(); const i = expr(); expect(']'); e = { k: 'idx', a: e, i }; }
        else if (is('(')) {
          next(); const args = [];
          if (!is(')')) { do { args.push(assign()); } while (accept(',')); }
          expect(')');
          e = { k: 'call', f: e, args };
        }
        else if (is('++') || is('--')) { e = { k: 'post', op: next().v, a: e }; }
        else if (is('.')) { next(); const m = next().v; e = { k: 'member', a: e, m }; }
        else break;
      }
      return e;
    }
    function primary() {
      const t = next();
      if (t.k === 'num') return { k: 'num', v: t.v, t: t.t, text: t.text };
      if (t.k === 'str') return { k: 'str', v: t.v, text: t.text };
      if (t.k === 'id') {
        if (t.v === 'true' || t.v === 'false') return { k: 'num', v: t.v === 'true' ? 1 : 0, t: 'bool', text: t.v };
        if (t.v === 'std' && is('::')) { next(); return primary(); }
        return { k: 'id', name: t.v };
      }
      if (t.k === 'p' && t.v === '(') { const e = expr(); expect(')'); return { k: 'paren', a: e }; }
      throw CError('unexpected "' + (t.text || 'end of file') + '"', t.line);
    }

    return program();
  }

  // ------------------------------------------------------------------ values
  const INT_MAX = 2147483647, INT_MIN = -2147483648;
  const CONSTS = { INT_MAX: [INT_MAX, 'int'], INT_MIN: [INT_MIN, 'int'], LLONG_MAX: [9007199254740991, 'long'], LLONG_MIN: [-9007199254740991, 'long'], NULL: [0, 'int'], EOF: [-1, 'int'], M_PI: [Math.PI, 'double'] };

  function coerce(v, base) {
    if (base === 'double') return +v;
    if (base === 'bool') return v ? 1 : 0;
    if (base === 'string') return v;
    if (typeof v !== 'number' || !isFinite(v)) v = 0;
    v = Math.trunc(v);
    if (base === 'char') return ((v & 255) << 24) >> 24;
    if (base === 'int') return v | 0;
    return v; // long
  }
  const isFloat = t => t === 'double';
  function arith(ta, tb) {
    if (ta === 'double' || tb === 'double') return 'double';
    if (ta === 'long' || tb === 'long') return 'long';
    return 'int';
  }

  function fmtDouble(v, prec) { return v.toFixed(prec); }

  // printf-style formatting
  function cformat(fmt, args, line) {
    let out = '', ai = 0;
    for (let i = 0; i < fmt.length; i++) {
      const c = fmt[i];
      if (c !== '%') { out += c; continue; }
      const m = /^%([-+ 0#]*)(\*|\d+)?(?:\.(\*|\d+))?(hh|h|ll|l|L|z)?([diucfFeEgGsxXop%])/.exec(fmt.slice(i));
      if (!m) { out += c; continue; }
      i += m[0].length - 1;
      const flags = m[1] || '';
      let width = m[2] === '*' ? args[ai++].v : (m[2] ? +m[2] : 0);
      let prec = m[3] === '*' ? args[ai++].v : (m[3] !== undefined ? +m[3] : undefined);
      const spec = m[5];
      if (spec === '%') { out += '%'; continue; }
      const a = args[ai++];
      if (!a) throw CError('printf: not enough arguments for "' + m[0] + '"', line);
      let s;
      switch (spec) {
        case 'd': case 'i': s = String(Math.trunc(a.v)); break;
        case 'u': s = String(Math.trunc(a.v) >>> 0); break;
        case 'c': s = String.fromCharCode(a.v & 255); break;
        case 'f': case 'F': s = fmtDouble(+a.v, prec === undefined ? 6 : prec); break;
        case 'e': case 'E': s = (+a.v).toExponential(prec === undefined ? 6 : prec).replace(/e([+-])(\d)$/, 'e$10$2'); if (spec === 'E') s = s.toUpperCase(); break;
        case 'g': case 'G': s = String(+(+a.v).toPrecision(prec || 6)); break;
        case 's': s = String(a.v); if (prec !== undefined) s = s.slice(0, prec); break;
        case 'x': s = (a.v >>> 0).toString(16); break;
        case 'X': s = (a.v >>> 0).toString(16).toUpperCase(); break;
        case 'o': s = (a.v >>> 0).toString(8); break;
        default: s = String(a.v);
      }
      if (flags.includes('+') && /[dif]/.test(spec) && a.v >= 0) s = '+' + s;
      if (s.length < width) {
        if (flags.includes('-')) s = s + ' '.repeat(width - s.length);
        else if (flags.includes('0') && spec !== 's' && spec !== 'c') { const neg = s[0] === '-' || s[0] === '+'; s = (neg ? s[0] : '') + '0'.repeat(width - s.length) + (neg ? s.slice(1) : s); }
        else s = ' '.repeat(width - s.length) + s;
      }
      out += s;
    }
    return out;
  }

  function showVal(v, base) {
    if (v === undefined) return '?';
    if (base === 'char') return v >= 32 && v < 127 ? "'" + String.fromCharCode(v) + "'" : String(v);
    if (base === 'bool') return v ? 'true' : 'false';
    if (base === 'double') return Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(6));
    if (base === 'string') return '"' + v + '"';
    return String(v);
  }
  function visible(s) {
    return s.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
  }

  // ------------------------------------------------------------------ runner
  class Break { } class Continue { }
  class Return { constructor(v) { this.v = v; } }
  class StepLimit extends Error { }

  function run(program, stdin) {
    const steps = [];
    let out = '';
    const inputMarks = []; // [start, end) of echoed input inside out
    let gridStart = 0;
    const inTokens = String(stdin || '').split(/\s+/).filter(Boolean);
    let inPos = 0;
    const frames = []; // { name, scopes:[Map], line }
    const globals = new Map();
    let changed = new Set();
    let ast;

    function snapshot() {
      return frames.map((f, fi) => {
        const vars = [];
        const seen = new Set();
        for (let s = f.scopes.length - 1; s >= 0; s--) {
          f.scopes[s].forEach((cell, name) => {
            if (seen.has(name)) return;
            seen.add(name);
            vars.push(cellView(cell, name, fi));
          });
        }
        vars.sort((a, b) => a.order - b.order);
        return { name: f.name, vars };
      });
    }
    function cellView(cell, name, fi) {
      const key = fi + ':' + name;
      if (cell.ref) {
        const target = cell.ref;
        return { name, type: target.typeName + (target.dims ? '[]' : ''), order: cell.order, ref: target.owner + '.' + target.name, arr: target.dims ? copyArr(target.val) : null, val: target.dims ? null : showVal(target.val, target.base), base: target.base, changed: changed.has(key) || changed.has(target.key), hl: target.dims ? hlOf(target.key) : null };
      }
      return { name, type: cell.typeName + (cell.dims === 1 ? '[]' : cell.dims === 2 ? '[][]' : ''), order: cell.order, val: cell.dims ? null : showVal(cell.val, cell.base), arr: cell.dims ? copyArr(cell.val) : null, base: cell.base, changed: changed.has(key), hl: cell.dims ? hlOf(cell.key) : null };
    }
    let arrHl = {};
    function hlOf(key) { return arrHl[key] ? arrHl[key].slice() : null; }
    function copyArr(a) { return a.map(x => Array.isArray(x) ? x.slice() : x); }

    function step(node, note, kind, lines) {
      if (steps.length >= MAX_STEPS) throw new StepLimit('Stopped after ' + MAX_STEPS + ' steps (infinite loop? try a smaller input).');
      steps.push({ l: lines ? lines[0] : node.line, e: lines ? lines[1] : (node.end || node.line), note, kind: kind || 'stmt', frames: snapshot(), outLen: out.length, depth: frames.length });
      changed = new Set();
      arrHl = {};
    }

    // ---------- variables
    let orderCounter = 0;
    function curFrame() { return frames[frames.length - 1]; }
    function lookup(name) {
      const f = curFrame();
      if (f) for (let s = f.scopes.length - 1; s >= 0; s--) if (f.scopes[s].has(name)) return { cell: f.scopes[s].get(name), fi: frames.length - 1 };
      if (globals.has(name)) return { cell: globals.get(name), fi: -1 };
      return null;
    }
    function markChanged(cell) {
      changed.add(cell.key);
      if (cell.refKey) changed.add(cell.refKey);
    }
    function resolve(cell) { return cell.ref || cell; }

    function makeArray(dims, base, init, line) {
      const fill = base === 'double' ? 0 : 0;
      if (dims.length === 1) {
        const n = dims[0] != null ? dims[0] : (init ? init.items.length : 0);
        const a = new Array(n).fill(init ? fill : undefined);
        if (init) {
          if (init.k === 'str') { for (let i = 0; i < n; i++) a[i] = i < init.v.length ? init.v.charCodeAt(i) : 0; }
          else init.items.forEach((it, i) => { if (i < n) a[i] = coerce(evalE(it).v, base); });
        }
        return a;
      }
      const rows = dims[0] != null ? dims[0] : (init ? init.items.length : 0);
      const a = [];
      for (let r = 0; r < rows; r++) {
        const row = new Array(dims[1]).fill(init ? fill : undefined);
        if (init && init.items[r]) {
          const it = init.items[r];
          if (it.k === 'list') it.items.forEach((x, c) => { row[c] = coerce(evalE(x).v, base); });
        }
        a.push(row);
      }
      if (init && init.items.length && init.items[0].k !== 'list') { // flat init of 2D array
        init.items.forEach((x, i) => { const r = Math.floor(i / dims[1]); if (a[r]) a[r][i % dims[1]] = coerce(evalE(x).v, base); });
      }
      return a;
    }

    function declare(scope, fi, type, v, ownerName) {
      const cell = { base: type.base, typeName: type.name, dims: v.dims.length, order: orderCounter++, key: fi + ':' + v.name, name: v.name, owner: ownerName };
      if (v.dims.length) {
        const sizes = v.dims.map(d => d ? coerce(evalE(d).v, 'long') : null);
        let init = v.init;
        if (init && init.k === 'str') init = init; // char s[] = "abc"
        if (init && type.base === 'char' && init.k === 'str' && sizes[0] == null) sizes[0] = init.v.length + 1;
        cell.val = makeArray(sizes, type.base, init);
      } else if (v.init) {
        const r = evalE(v.init);
        cell.val = type.base === 'string' ? String(r.v) : coerce(r.v, type.base);
      } else cell.val = fi < 0 || type.base === 'string' ? (type.base === 'string' ? '' : 0) : undefined;
      scope.set(v.name, cell);
      changed.add(cell.key);
      return cell;
    }

    // ---------- lvalues
    function lref(e) {
      if (e.k === 'paren') return lref(e.a);
      if (e.k === 'id') {
        const f = lookup(e.name);
        if (!f) throw CError('"' + e.name + '" is not declared', curLine);
        const cell = resolve(f.cell);
        if (cell.dims) throw CError('cannot assign to a whole array', curLine);
        return {
          get: () => ({ v: cell.val === undefined ? 0 : cell.val, t: cell.base === 'char' ? 'char' : cell.base }),
          set: v => { cell.val = cell.base === 'string' ? v : coerce(v, cell.base); changed.add(f.fi + ':' + e.name); changed.add(cell.key); },
          base: cell.base, label: e.name
        };
      }
      if (e.k === 'idx') {
        const path = [];
        let x = e;
        while (x.k === 'idx') { path.unshift(x.i); x = x.a; }
        if (x.k === 'id') {
          const f = lookup(x.name);
          if (!f) throw CError('"' + x.name + '" is not declared', curLine);
          const cell = resolve(f.cell);
          if (cell.base === 'string' && !cell.dims) {
            const i = evalE(path[0]).v;
            return {
              get: () => ({ v: (cell.val.charCodeAt(i) || 0), t: 'char' }),
              set: v => { const s = cell.val; cell.val = s.slice(0, i) + String.fromCharCode(v) + s.slice(i + 1); changed.add(cell.key); },
              base: 'char', label: x.name + '[' + i + ']'
            };
          }
          const idx = path.map(pe => evalE(pe).v);
          let arr = cell.val;
          for (let d = 0; d < idx.length - 1; d++) {
            if (idx[d] < 0 || idx[d] >= arr.length) throw CError('index ' + idx[d] + ' is out of bounds for ' + x.name + ' (size ' + arr.length + ')', curLine);
            arr = arr[idx[d]];
          }
          const last = idx[idx.length - 1];
          if (!Array.isArray(arr) || last < 0 || last >= arr.length) throw CError('index ' + last + ' is out of bounds for ' + x.name + ' (size ' + (arr ? arr.length : 0) + ')', curLine);
          return {
            get: () => ({ v: arr[last] === undefined ? 0 : arr[last], t: cell.base }),
            set: v => { arr[last] = coerce(v, cell.base); changed.add(cell.key); (arrHl[cell.key] = arrHl[cell.key] || []).push(idx); },
            base: cell.base, label: x.name + idx.map(i => '[' + i + ']').join(''),
            touch: () => { (arrHl[cell.key] = arrHl[cell.key] || []).push(idx); }
          };
        }
      }
      throw CError('this expression cannot be assigned to', curLine);
    }

    // ---------- expression evaluation
    let curLine = 0;
    let pendingCallNote = null;
    function truthy(r) { return r.t === 'string' ? true : !!r.v; }

    function evalE(e) {
      switch (e.k) {
        case 'num': return { v: e.v, t: e.t };
        case 'str': return { v: e.v, t: 'str' };
        case 'paren': return evalE(e.a);
        case 'id': {
          if (e.name === 'cout' || e.name === 'cin' || e.name === 'cerr') return { v: e.name, t: 'stream' };
          if (e.name === 'endl') return { v: '\n', t: 'str' };
          const f = lookup(e.name);
          if (!f) {
            if (CONSTS[e.name]) return { v: CONSTS[e.name][0], t: CONSTS[e.name][1] };
            throw CError('"' + e.name + '" is not declared', curLine);
          }
          const cell = resolve(f.cell);
          if (cell.dims) return { v: cell.val, t: 'arr', cell };
          return { v: cell.val === undefined ? 0 : cell.val, t: cell.base };
        }
        case 'idx': {
          const base = evalE(e.a);
          if (base.t === 'string' || base.t === 'str') { const i = evalE(e.i).v; return { v: base.v.charCodeAt(i) || 0, t: 'char' }; }
          const ref = lref(e);
          if (ref.touch) ref.touch();
          return ref.get();
        }
        case 'assign': {
          const ref = lref(e.target);
          const rv = evalE(e.value);
          let v;
          if (e.op === '=') v = rv.v;
          else {
            const cur = ref.get();
            v = binop(e.op.slice(0, -1), cur, rv).v;
          }
          if (ref.base === 'string') v = String(rv.t === 'char' && e.op === '+=' ? ref.get().v + String.fromCharCode(rv.v) : (e.op === '+=' ? ref.get().v + rv.v : v));
          ref.set(v);
          return ref.get();
        }
        case 'pre': case 'post': {
          const ref = lref(e.a);
          const old = ref.get();
          ref.set(old.v + (e.op === '++' ? 1 : -1));
          return e.k === 'pre' ? ref.get() : old;
        }
        case 'un': {
          const a = evalE(e.a);
          if (e.op === '!') return { v: truthy(a) ? 0 : 1, t: 'int' };
          if (e.op === '-') { const t = a.t === 'char' || a.t === 'bool' ? 'int' : a.t; return { v: coerce(-a.v, t), t }; }
          if (e.op === '+') return { v: a.v, t: a.t === 'char' ? 'int' : a.t };
          if (e.op === '~') return { v: ~a.v, t: 'int' };
          break;
        }
        case 'bin': {
          if (e.op === '&&') { const a = evalE(e.a); if (!truthy(a)) return { v: 0, t: 'int' }; return { v: truthy(evalE(e.b)) ? 1 : 0, t: 'int' }; }
          if (e.op === '||') { const a = evalE(e.a); if (truthy(a)) return { v: 1, t: 'int' }; return { v: truthy(evalE(e.b)) ? 1 : 0, t: 'int' }; }
          const a = evalE(e.a);
          if (a.t === 'stream') return streamOp(a, e);
          return binop(e.op, a, evalE(e.b));
        }
        case 'tern': return truthy(evalE(e.c)) ? evalE(e.a) : evalE(e.b);
        case 'comma': evalE(e.a); return evalE(e.b);
        case 'cast': { const a = evalE(e.a); return { v: coerce(a.v, e.type.base), t: e.type.base }; }
        case 'sizeof': {
          const b = e.type ? e.type.base : null;
          const sz = { char: 1, bool: 1, int: 4, long: 8, double: 8 };
          if (b) return { v: e.type.name.includes('float') ? 4 : sz[b] || 4, t: 'long' };
          const a = evalE(e.a);
          if (a.t === 'arr') { const flat = (x) => Array.isArray(x) ? x.reduce((s, y) => s + flat(y), 0) : 1; return { v: flat(a.v) * (sz[a.cell.base] || 4), t: 'long' }; }
          return { v: sz[a.t] || 4, t: 'long' };
        }
        case 'addr': return { v: e.a, t: 'addr' };
        case 'call': return callE(e);
        case 'member': {
          const a = evalE(e.a);
          if (a.t === 'string' && (e.m === 'size' || e.m === 'length')) return { v: a.v.length, t: 'int', method: true };
          throw CError('.' + e.m + ' is not supported', curLine);
        }
      }
      throw CError('cannot evaluate expression', curLine);
    }

    function streamOp(a, e) {
      if (a.v === 'cout' || a.v === 'cerr') {
        if (e.op !== '<<') throw CError('use << with cout', curLine);
        const b = evalE(e.b);
        let s;
        if (b.t === 'char') s = String.fromCharCode(b.v);
        else if (b.t === 'double') s = String(+(+b.v).toPrecision(6));
        else if (b.t === 'bool') s = String(b.v);
        else s = String(b.v);
        out += s;
        return a;
      }
      if (e.op !== '>>') throw CError('use >> with cin', curLine);
      readInto(lref(e.b), 'auto');
      return a;
    }

    function readInto(ref, spec) {
      if (inPos >= inTokens.length) throw CError('the program wants more input — add a value in the input box', curLine);
      let tok = inTokens[inPos++];
      let v;
      if (ref.base === 'char' || spec === 'c') { v = tok.charCodeAt(0); if (tok.length > 1) { inTokens.splice(inPos, 0, tok.slice(1)); } tok = tok[0]; }
      else if (ref.base === 'string') v = tok;
      else if (ref.base === 'double') v = parseFloat(tok);
      else v = parseInt(tok, 10);
      if (typeof v === 'number' && isNaN(v)) v = 0;
      ref.set(v);
      const s = out.length;
      out += tok + '\n';
      inputMarks.push([s, out.length]);
      gridStart = out.length;
      return tok;
    }

    function binop(op, a, b) {
      if (a.t === 'string' || a.t === 'str' || b.t === 'string' || b.t === 'str') {
        const sa = a.t === 'char' ? String.fromCharCode(a.v) : a.v, sb = b.t === 'char' ? String.fromCharCode(b.v) : b.v;
        if (op === '+') return { v: sa + sb, t: 'string' };
        if (op === '==') return { v: sa === sb ? 1 : 0, t: 'int' };
        if (op === '!=') return { v: sa !== sb ? 1 : 0, t: 'int' };
        if (op === '<') return { v: sa < sb ? 1 : 0, t: 'int' };
        if (op === '>') return { v: sa > sb ? 1 : 0, t: 'int' };
      }
      const t = arith(a.t, b.t);
      const x = a.v, y = b.v;
      switch (op) {
        case '+': return { v: coerce(x + y, t), t };
        case '-': return { v: coerce(x - y, t), t };
        case '*': return { v: t === 'int' ? Math.imul(x, y) : coerce(x * y, t), t };
        case '/':
          if (!isFloat(t) && y === 0) throw CError('division by zero', curLine);
          return { v: isFloat(t) ? x / y : coerce(Math.trunc(x / y), t), t };
        case '%':
          if (isFloat(t)) throw CError('% needs integers', curLine);
          if (y === 0) throw CError('modulo by zero', curLine);
          return { v: coerce(x % y, t), t };
        case '<': return { v: x < y ? 1 : 0, t: 'int' };
        case '>': return { v: x > y ? 1 : 0, t: 'int' };
        case '<=': return { v: x <= y ? 1 : 0, t: 'int' };
        case '>=': return { v: x >= y ? 1 : 0, t: 'int' };
        case '==': return { v: x === y ? 1 : 0, t: 'int' };
        case '!=': return { v: x !== y ? 1 : 0, t: 'int' };
        case '&': return { v: x & y, t };
        case '|': return { v: x | y, t };
        case '^': return { v: x ^ y, t };
        case '<<': return { v: t === 'int' ? x << y : x * Math.pow(2, y), t };
        case '>>': return { v: t === 'int' ? x >> y : Math.floor(x / Math.pow(2, y)), t };
      }
      throw CError('unknown operator ' + op, curLine);
    }

    const MATH = {
      abs: a => ({ v: Math.abs(a[0].v), t: a[0].t === 'double' ? 'double' : 'int' }),
      labs: a => ({ v: Math.abs(a[0].v), t: 'long' }),
      llabs: a => ({ v: Math.abs(a[0].v), t: 'long' }),
      fabs: a => ({ v: Math.abs(a[0].v), t: 'double' }),
      sqrt: a => ({ v: Math.sqrt(a[0].v), t: 'double' }),
      cbrt: a => ({ v: Math.cbrt(a[0].v), t: 'double' }),
      pow: a => ({ v: Math.pow(a[0].v, a[1].v), t: 'double' }),
      floor: a => ({ v: Math.floor(a[0].v), t: 'double' }),
      ceil: a => ({ v: Math.ceil(a[0].v), t: 'double' }),
      round: a => ({ v: Math.round(a[0].v), t: 'double' }),
      log10: a => ({ v: Math.log10(a[0].v), t: 'double' }),
      log2: a => ({ v: Math.log2(a[0].v), t: 'double' }),
      log: a => ({ v: Math.log(a[0].v), t: 'double' }),
      max: a => (a[0].v >= a[1].v ? a[0] : a[1]),
      min: a => (a[0].v <= a[1].v ? a[0] : a[1]),
      fmax: a => ({ v: Math.max(a[0].v, a[1].v), t: 'double' }),
      fmin: a => ({ v: Math.min(a[0].v, a[1].v), t: 'double' }),
      toupper: a => ({ v: a[0].v >= 97 && a[0].v <= 122 ? a[0].v - 32 : a[0].v, t: 'int' }),
      tolower: a => ({ v: a[0].v >= 65 && a[0].v <= 90 ? a[0].v + 32 : a[0].v, t: 'int' }),
      isdigit: a => ({ v: a[0].v >= 48 && a[0].v <= 57 ? 1 : 0, t: 'int' }),
      isalpha: a => ({ v: /[A-Za-z]/.test(String.fromCharCode(a[0].v)) ? 1 : 0, t: 'int' }),
      isupper: a => ({ v: a[0].v >= 65 && a[0].v <= 90 ? 1 : 0, t: 'int' }),
      islower: a => ({ v: a[0].v >= 97 && a[0].v <= 122 ? 1 : 0, t: 'int' }),
      to_string: a => ({ v: String(a[0].v), t: 'string' }),
    };

    function callE(e) {
      const name = e.f.k === 'id' ? e.f.name : (e.f.k === 'member' ? e.f.m : null);
      if (e.f.k === 'member') return evalE(e.f);
      if (name === 'printf') {
        const fmt = evalE(e.args[0]);
        const args = e.args.slice(1).map(evalE);
        const s = cformat(String(fmt.v), args, curLine);
        out += s;
        return { v: s.length, t: 'int' };
      }
      if (name === 'scanf') {
        const fmt = String(evalE(e.args[0]).v);
        const specs = (fmt.match(/%l*[a-z]/g) || []).map(s => s.slice(-1));
        let got = 0;
        e.args.slice(1).forEach((a, i) => {
          if (a.k !== 'addr' && !(a.k === 'id')) throw CError('scanf needs &variable', curLine);
          readInto(lref(a.k === 'addr' ? a.a : a), specs[i]);
          got++;
        });
        return { v: got, t: 'int' };
      }
      if (name === 'putchar') { const a = evalE(e.args[0]); out += String.fromCharCode(a.v); return a; }
      if (name === 'puts') { const a = evalE(e.args[0]); out += a.v + '\n'; return { v: 1, t: 'int' }; }
      if (name === 'swap') {
        const r1 = lref(e.args[0]), r2 = lref(e.args[1]);
        const a = r1.get().v, b = r2.get().v; r1.set(b); r2.set(a);
        return { v: 0, t: 'void' };
      }
      if (MATH[name] && !(ast.funcs[name])) return MATH[name](e.args.map(evalE));
      const fn = ast.funcs[name];
      if (!fn) throw CError('function "' + name + '" is not defined', curLine);
      return invoke(fn, e.args, e);
    }

    function invoke(fn, argExprs, callNode) {
      if (frames.length > 200) throw CError('recursion is too deep (missing base case?)', curLine);
      const fi = frames.length;
      const scope = new Map();
      const shown = [];
      fn.params.forEach((pdef, i) => {
        const ae = argExprs[i];
        if (!ae) throw CError(fn.name + '() expects ' + fn.params.length + ' arguments', curLine);
        if (pdef.dims || pdef.byRef) {
          // arrays (and C++ references) are shared with the caller
          let x = ae; while (x.k === 'paren') x = x.a;
          if (x.k !== 'id') throw CError('pass a variable name here', curLine);
          const f = lookup(x.name);
          if (!f) throw CError('"' + x.name + '" is not declared', curLine);
          const target = resolve(f.cell);
          scope.set(pdef.name, { ref: target, order: orderCounter++, key: fi + ':' + pdef.name, refKey: target.key });
          shown.push(pdef.name + ' → ' + x.name);
        } else {
          const v = evalE(ae);
          const cell = { base: pdef.type.base, typeName: pdef.type.name, dims: 0, order: orderCounter++, key: fi + ':' + pdef.name, name: pdef.name, owner: fn.name, val: pdef.type.base === 'string' ? String(v.v) : coerce(v.v, pdef.type.base) };
          scope.set(pdef.name, cell);
          shown.push(pdef.name + ' = ' + showVal(cell.val, cell.base));
        }
      });
      const callerLine = curLine;
      frames.push({ name: fn.name + '(' + fn.params.map(p => p.name).join(', ') + ')', scopes: [scope], fn });
      scope.forEach((_, k) => changed.add(fi + ':' + k));
      step({ line: fn.line, end: fn.line }, 'Enter <b>' + esc(fn.name) + '()</b> — a new stack frame' + (shown.length ? ' with ' + shown.map(code).join(', ') : '') + '.', 'call');
      let ret = { v: 0, t: fn.type.base };
      try { execBlockBody(fn.body.body); }
      catch (x) { if (x instanceof Return) ret = x.v; else throw x; }
      frames.pop();
      curLine = callerLine;
      const rv = fn.type.base === 'void' ? { v: 0, t: 'void' } : { v: fn.type.base === 'string' ? ret.v : coerce(ret.v, fn.type.base), t: fn.type.base };
      pendingCallNote = (pendingCallNote ? pendingCallNote + ' ' : '') + 'Back from ' + code(fn.name + '()') + (fn.type.base === 'void' ? '' : ' with ' + code(showVal(rv.v, rv.t))) + '.';
      return rv;
    }

    // ---------- explaining expressions
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function code(s) { return '<code>' + esc(s) + '</code>'; }
    const PREC = { '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '<=': 7, '>': 7, '>=': 7, '<<': 8, '>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10 };
    function src(e) { // source text of an expression
      switch (e.k) {
        case 'num': return e.text;
        case 'str': return JSON.stringify(e.v);
        case 'id': return e.name;
        case 'paren': return '(' + src(e.a) + ')';
        case 'idx': return src(e.a) + '[' + src(e.i) + ']';
        case 'assign': return src(e.target) + ' ' + e.op + ' ' + src(e.value);
        case 'pre': return e.op + src(e.a);
        case 'post': return src(e.a) + e.op;
        case 'un': return e.op + src(e.a);
        case 'bin': return src(e.a) + ' ' + e.op + ' ' + src(e.b);
        case 'tern': return src(e.c) + ' ? ' + src(e.a) + ' : ' + src(e.b);
        case 'comma': return src(e.a) + ', ' + src(e.b);
        case 'cast': return '(' + e.type.name + ')' + src(e.a);
        case 'call': return src(e.f) + '(' + e.args.map(src).join(', ') + ')';
        case 'addr': return '&' + src(e.a);
        case 'member': return src(e.a) + '.' + e.m;
        case 'sizeof': return 'sizeof(' + (e.type ? e.type.name : src(e.a)) + ')';
      }
      return '?';
    }
    // the same expression with variables replaced by their current values (no side effects)
    function sub(e) {
      try {
        switch (e.k) {
          case 'id': {
            const f = lookup(e.name);
            if (!f) return CONSTS[e.name] ? String(CONSTS[e.name][0]) : e.name;
            const c = resolve(f.cell);
            if (c.dims) return e.name;
            return showVal(c.val, c.base);
          }
          case 'idx': {
            let x = e; const path = [];
            while (x.k === 'idx') { path.unshift(x.i); x = x.a; }
            if (x.k !== 'id') return src(e);
            const f = lookup(x.name); if (!f) return src(e);
            const c = resolve(f.cell);
            if (c.base === 'string' && !c.dims) { const i = pureEval(path[0]); return showVal(c.val.charCodeAt(i) || 0, 'char'); }
            let a = c.val;
            for (const pe of path) { const i = pureEval(pe); if (!Array.isArray(a) || i == null || i < 0 || i >= a.length) return src(e); a = a[i]; }
            return showVal(a, c.base);
          }
          case 'paren': return '(' + sub(e.a) + ')';
          case 'bin': return sub(e.a) + ' ' + e.op + ' ' + sub(e.b);
          case 'un': return e.op + sub(e.a);
          case 'tern': return sub(e.c) + ' ? ' + sub(e.a) + ' : ' + sub(e.b);
          case 'cast': return '(' + e.type.name + ')' + sub(e.a);
          case 'call': return src(e.f) + '(' + e.args.map(sub).join(', ') + ')';
          default: return src(e);
        }
      } catch (_) { return src(e); }
    }
    function pureEval(e) { // evaluate an index expression without side effects (ids, numbers, + - * /)
      if (e.k === 'num') return e.v;
      if (e.k === 'id') { const f = lookup(e.name); if (!f) return null; const c = resolve(f.cell); return c.dims ? null : c.val; }
      if (e.k === 'paren') return pureEval(e.a);
      if (e.k === 'bin' && '+-*/%'.includes(e.op)) {
        const a = pureEval(e.a), b = pureEval(e.b);
        if (a == null || b == null) return null;
        return e.op === '+' ? a + b : e.op === '-' ? a - b : e.op === '*' ? a * b : e.op === '/' ? (b ? Math.trunc(a / b) : null) : (b ? a % b : null);
      }
      return null;
    }
    function hasCall(e) {
      if (!e || typeof e !== 'object') return false;
      if (e.k === 'call' && e.f.k === 'id' && ast.funcs[e.f.name]) return true;
      return ['a', 'b', 'c', 'i', 'value', 'target'].some(k => e[k] && hasCall(e[k])) || (e.args || []).some(hasCall);
    }
    function condNote(e) {
      const s = src(e), sb = sub(e);
      return code(s) + (sb !== s && !hasCall(e) ? ' → ' + code(sb) : '');
    }
    function showOut(s) {
      return '<span class="outq">' + esc(s).replace(/ /g, '<span class="sp">·</span>').replace(/\n/g, '<span class="nl">↵</span>') + '</span>';
    }

    // describe an expression statement after it ran
    function describeExpr(e, before, printed) {
      let x = e; while (x.k === 'paren') x = x.a;
      const pr = printed ? ' Printed ' + showOut(printed) + '.' : '';
      if (x.k === 'call' && x.f.k === 'id') {
        const n = x.f.name;
        if (n === 'printf' || n === 'putchar' || n === 'puts') return (printed ? 'Print ' + showOut(printed) : 'Prints nothing') + (x.args.length > 1 && n === 'printf' ? ' (the % placeholders are filled with ' + x.args.slice(1).map(a => code(src(a))).join(', ') + ')' : '') + '.';
        if (n === 'scanf') return 'Read input into ' + x.args.slice(1).map(a => code(src(a.k === 'addr' ? a.a : a) + ' = ' + after(a.k === 'addr' ? a.a : a))).join(', ') + '.';
        return 'Call ' + code(src(x)) + '.' + pr;
      }
      if (x.k === 'bin' && (x.op === '<<' || x.op === '>>')) {
        let root = x; while (root.k === 'bin') root = root.a;
        if (root.k === 'id' && root.name === 'cout') return printed ? 'Print ' + showOut(printed) + '.' : 'cout prints nothing.';
        if (root.k === 'id' && root.name === 'cin') return 'Read input from the keyboard (stdin).';
      }
      if (x.k === 'assign') {
        const t = src(x.target);
        if (x.op === '=') return code(t + ' = ' + src(x.value)) + (before.v !== sub(x.value) && !hasCall(x.value) ? ' → ' + code(before.v) : '') + ' → ' + code(t) + ' is now ' + code(after(x.target)) + '.' + pr;
        return code(t + ' ' + x.op + ' ' + src(x.value)) + ' means ' + code(t + ' = ' + t + ' ' + x.op.slice(0, -1) + ' ' + src(x.value)) + ' → ' + code(t) + ' is now ' + code(after(x.target)) + '.' + pr;
      }
      if (x.k === 'pre' || x.k === 'post') return code(src(x)) + ' → ' + code(src(x.a)) + ' is now ' + code(after(x.a)) + '.';
      if (x.k === 'comma') return 'Run ' + code(src(x)) + '.' + pr;
      return 'Evaluate ' + code(src(x)) + '.' + pr;
    }
    function after(e) { return sub(e); }
    function exprBefore(e) {
      let x = e; while (x.k === 'paren') x = x.a;
      return { v: x.k === 'assign' ? sub(x.value) : '' };
    }

    // ---------- statements
    function execBlockBody(list) {
      const f = curFrame();
      f.scopes.push(new Map());
      try { for (const s of list) exec(s); }
      finally { f.scopes.pop(); }
    }

    function exec(s) {
      curLine = s.line;
      switch (s.k) {
        case 'block': execBlockBody(s.body); return;
        case 'empty': return;
        case 'decl': {
          const f = curFrame();
          const scope = f.scopes[f.scopes.length - 1];
          const parts = [];
          const outBefore = out.length;
          for (const v of s.vars) {
            const cell = declare(scope, frames.length - 1, s.type, v, f.fn ? f.fn.name : 'main');
            if (cell.dims) parts.push(code(s.type.name + ' ' + v.name + v.dims.map((d, i) => '[' + (Array.isArray(cell.val) && i === 0 ? cell.val.length : (Array.isArray(cell.val[0]) ? cell.val[0].length : '')) + ']').join('')) + (v.init ? ' filled from the initialiser' : ' (contents are garbage until you assign them)'));
            else if (v.init) parts.push(code(s.type.name + ' ' + v.name) + ' = ' + (v.init.k === 'num' || hasCall(v.init) ? '' : code(src(v.init)) + ' → ') + code(showVal(cell.val, cell.base)));
            else parts.push(code(s.type.name + ' ' + v.name) + (cell.val === undefined ? ' (no value yet — holds garbage)' : ''));
          }
          const extra = pendingCallNote ? ' ' + pendingCallNote : ''; pendingCallNote = null;
          step(s, 'Create ' + parts.join(', ') + '.' + extra + (out.length > outBefore ? ' Printed ' + showOut(out.slice(outBefore)) + '.' : ''), 'decl');
          return;
        }
        case 'expr': {
          const before = exprBefore(s.e);
          const o0 = out.length, in0 = inputMarks.length;
          evalE(s.e);
          let printed = out.slice(o0);
          if (inputMarks.length > in0) printed = '';
          const extra = pendingCallNote ? ' ' + pendingCallNote : ''; pendingCallNote = null;
          step(s, describeExpr(s.e, before, printed) + extra, inputMarks.length > in0 ? 'input' : (printed ? 'print' : 'stmt'));
          return;
        }
        case 'if': {
          const r = truthy(evalE(s.cond));
          const extra = pendingCallNote ? ' ' + pendingCallNote : ''; pendingCallNote = null;
          step(s, 'Check ' + condNote(s.cond) + ' → <b class="' + (r ? 'yes">true' : 'no">false') + '</b>' + extra + (r ? ', so run the if-part.' : s.els ? ', so jump to the else-part.' : ', so skip the if-part.'), r ? 'true' : 'false', [s.line, s.end]);
          if (r) exec(s.then); else if (s.els) exec(s.els);
          return;
        }
        case 'while': {
          for (;;) {
            curLine = s.line;
            const before = condNote(s.cond);
            const r = truthy(evalE(s.cond));
            const extra = pendingCallNote ? ' ' + pendingCallNote : ''; pendingCallNote = null;
            step(s, 'Loop check ' + before + ' → <b class="' + (r ? 'yes">true' : 'no">false') + '</b>' + extra + (r ? ' → run the body.' : ' → the loop ends.'), r ? 'true' : 'false', [s.line, s.end]);
            if (!r) break;
            try { exec(s.body); } catch (x) { if (x instanceof Break) { break; } if (!(x instanceof Continue)) throw x; }
          }
          return;
        }
        case 'do': {
          for (;;) {
            try { exec(s.body); } catch (x) { if (x instanceof Break) break; if (!(x instanceof Continue)) throw x; }
            curLine = s.condLine;
            const before = condNote(s.cond);
            const r = truthy(evalE(s.cond));
            step({ line: s.condLine }, 'do-while check ' + before + ' → <b class="' + (r ? 'yes">true' : 'no">false') + '</b>' + (r ? ' → go back to the top of the body.' : ' → the loop ends.'), r ? 'true' : 'false', [s.condLine, s.end]);
            if (!r) break;
          }
          return;
        }
        case 'for': {
          const f = curFrame();
          f.scopes.push(new Map());
          try {
            if (s.init) {
              if (s.init.k === 'decl') {
                const scope = f.scopes[f.scopes.length - 1];
                const parts = s.init.vars.map(v => { const c = declare(scope, frames.length - 1, s.init.type, v, 'main'); return code(v.name + ' = ' + showVal(c.val, c.base)); });
                step(s, 'Loop starts: ' + parts.join(', ') + ' (this runs only once).', 'init', [s.line, s.line]);
              } else { evalE(s.init.e); step(s, 'Loop starts: ' + code(src(s.init.e)) + ' (this runs only once).', 'init', [s.line, s.line]); }
            }
            for (;;) {
              curLine = s.line;
              if (s.cond) {
                const before = condNote(s.cond);
                const r = truthy(evalE(s.cond));
                step(s, 'Check ' + before + ' → <b class="' + (r ? 'yes">true' : 'no">false') + '</b>' + (r ? ' → run the body.' : ' → the loop ends.'), r ? 'true' : 'false', [s.line, s.end]);
                if (!r) break;
              }
              try { exec(s.body); } catch (x) { if (x instanceof Break) break; if (!(x instanceof Continue)) throw x; }
              if (s.upd) {
                curLine = s.line;
                evalE(s.upd);
                const names = [];
                (function walk(e) { if (!e) return; if (e.k === 'pre' || e.k === 'post') names.push(e.a); else if (e.k === 'assign') names.push(e.target); else if (e.k === 'comma') { walk(e.a); walk(e.b); } })(s.upd);
                step(s, 'Update ' + code(src(s.upd)) + (names.length ? ' → ' + names.map(n => code(src(n) + ' = ' + sub(n))).join(', ') : '') + ', then check the condition again.', 'update', [s.line, s.end]);
              }
            }
          } finally { f.scopes.pop(); }
          return;
        }
        case 'switch': {
          const v = evalE(s.disc);
          let idx = s.cases.findIndex(c => c.test && evalE(c.test).v === v.v);
          const matched = idx >= 0;
          if (idx < 0) idx = s.cases.findIndex(c => !c.test);
          step(s, 'switch on ' + condNote(s.disc) + ' = ' + code(showVal(v.v, v.t)) + ' → ' + (matched ? 'jump to ' + code('case ' + src(s.cases[idx].test)) : idx >= 0 ? 'no case matches, jump to ' + code('default') : 'no case matches and there is no default, skip it') + '.', 'true', [s.line, s.end]);
          if (idx < 0) return;
          try {
            for (let i = idx; i < s.cases.length; i++) {
              if (i > idx) step({ line: s.cases[i].line }, 'No <code>break</code> above, so execution <b>falls through</b> into this case too.', 'stmt');
              for (const st of s.cases[i].body) exec(st);
            }
          } catch (x) { if (!(x instanceof Break)) throw x; }
          return;
        }
        case 'break': step(s, code('break') + ' → leave the nearest loop / switch immediately.', 'jump'); throw new Break();
        case 'continue': step(s, code('continue') + ' → skip the rest of this iteration and go to the next one.', 'jump'); throw new Continue();
        case 'return': {
          const fname = curFrame().fn ? curFrame().fn.name : 'main';
          const v = s.e ? evalE(s.e) : { v: 0, t: 'void' };
          const extra = pendingCallNote ? ' ' + pendingCallNote : ''; pendingCallNote = null;
          if (fname === 'main') step(s, code('return ' + (s.e ? src(s.e) : '')) + ' from main → the program ends (0 means “success”).' + extra, 'ret');
          else step(s, 'Return ' + (s.e ? condNote(s.e) + ' = ' + code(showVal(v.v, v.t)) : 'nothing') + ' from ' + code(fname + '()') + '.' + extra, 'ret');
          throw new Return(v);
        }
      }
      throw CError('unknown statement', s.line);
    }

    // ---------- go
    let error = null;
    try {
      ast = parse(program);
      const gscope = globals;
      for (const g of ast.globals) for (const v of g.vars) declare(gscope, -1, g.type, v, 'global');
      if (!ast.funcs.main) throw CError('there is no main() function', 1);
      const mainFn = ast.funcs.main;
      frames.push({ name: 'main()', scopes: [], fn: null });
      step({ line: mainFn.line }, 'The program starts running at ' + code('main()') + '. A stack frame is created for its variables.', 'call');
      try { execBlockBody(mainFn.body.body); }
      catch (x) { if (!(x instanceof Return)) throw x; }
      frames.pop();
      steps.push({ l: mainFn.body.end, e: mainFn.body.end, note: 'End of ' + code('main()') + ' — the program has finished.', kind: 'end', frames: [], outLen: out.length, depth: 0 });
    } catch (x) {
      if (x instanceof Break || x instanceof Continue) error = { msg: 'break/continue used outside a loop', line: curLine };
      else error = { msg: x.message, line: x.cline || curLine };
      if (!(x instanceof StepLimit) && !x.cline && !(x instanceof Error)) error.msg = String(x);
      steps.push({ l: error.line || 1, e: error.line || 1, note: '<b class="no">Error:</b> ' + esc(error.msg), kind: 'error', frames: snapshot(), outLen: out.length, depth: frames.length });
    }
    return { steps, out, inputs: inputMarks, error, gridStart };
  }

  const api = { run, parse, cformat };
  if (typeof window !== 'undefined') window.CTrace = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
