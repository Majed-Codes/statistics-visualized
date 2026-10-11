/**
 * A small, dependency-free Python tokenizer for syntax highlighting.
 * It recognises comments, strings (incl. f-strings), numbers, keywords,
 * builtins, function calls and attribute access — enough for notebook code.
 */
export type TokenKind = 'comment' | 'string' | 'number' | 'keyword' | 'builtin' | 'call' | 'attr' | 'op' | 'text';

export interface Token {
  kind: TokenKind;
  text: string;
}

const KEYWORDS = new Set([
  'import', 'from', 'as', 'def', 'return', 'for', 'in', 'if', 'elif', 'else', 'while', 'with', 'class', 'lambda', 'and', 'or', 'not', 'is', 'None', 'True', 'False', 'try', 'except', 'finally', 'raise', 'yield', 'pass', 'break', 'continue',
]);
const BUILTINS = new Set(['print', 'len', 'range', 'list', 'dict', 'set', 'tuple', 'int', 'float', 'str', 'abs', 'sum', 'min', 'max', 'sorted', 'zip', 'enumerate', 'round']);

const RULES: [TokenKind, RegExp][] = [
  ['comment', /^#[^\n]*/],
  ['string', /^[fFrRbB]{0,2}("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/],
  ['number', /^\d+(?:\.\d+)?(?:e[+-]?\d+)?/i],
  ['text', /^[A-Za-z_][A-Za-z0-9_]*/],
  ['op', /^(?:==|!=|<=|>=|\*\*|\/\/|[-+*/%=<>()[\]{}.,:;@])/],
  ['text', /^\s+/],
  ['text', /^./],
];

export function tokenizePython(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const rest = src.slice(i);
    for (const [kind, re] of RULES) {
      const m = re.exec(rest);
      if (!m) continue;
      let k: TokenKind = kind;
      const text = m[0];
      if (kind === 'text' && /^[A-Za-z_]/.test(text)) {
        const prev = out.length ? out[out.length - 1].text : '';
        const next = src[i + text.length];
        if (KEYWORDS.has(text)) k = 'keyword';
        else if (BUILTINS.has(text) && next === '(') k = 'builtin';
        else if (prev === '.' && next === '(') k = 'call';
        else if (prev === '.') k = 'attr';
        else if (next === '(') k = 'call';
      }
      out.push({ kind: k, text });
      i += text.length;
      break;
    }
  }
  return out;
}

/** Split tokens into lines (tokens never span lines except multi-line strings, which are split). */
export function tokenLines(src: string): Token[][] {
  const lines: Token[][] = [[]];
  for (const t of tokenizePython(src)) {
    const parts = t.text.split('\n');
    parts.forEach((p, j) => {
      if (j > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ kind: t.kind, text: p });
    });
  }
  return lines;
}
