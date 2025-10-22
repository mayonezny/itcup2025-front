// src/shared/lang/completion.ts
const KEYWORDS = ['AND', 'OR', 'NOT', 'BETWEEN'] as const;
const CMPOPS = ['>=', '>', '<=', '<', '='] as const;
const SYMBOLS = ['(', ')', '[', ']', ','] as const;
const VARS = ['COUNT', 'TIME'] as const;

export type Suggest = string;

function lastToken(src: string): string {
  const m = src.match(/([A-Z][A-Z0-9_]*|>=|<=|=|>|<|\(|\)|\[|\]|,)\s*$/);
  return m ? m[1] : '';
}
function inBracket(src: string): boolean {
  const open = (src.match(/\[/g) || []).length;
  const close = (src.match(/\]/g) || []).length;
  return open > close;
}
function inParen(src: string): boolean {
  const open = (src.match(/\(/g) || []).length;
  const close = (src.match(/\)/g) || []).length;
  return open > close;
}

export async function getCompletionsAt(text: string, offset: number): Promise<Suggest[]> {
  const left = text.slice(0, offset);
  const right = text.slice(offset);

  // не подсказываем прямо перед явным числом/временем
  if (/^\d|\d{2}:\d{0,2}/.test(right)) {
    return [];
  }

  const s = new Set<Suggest>();

  const tok = lastToken(left);
  const insideBr = inBracket(left);
  const insidePar = inParen(left);

  if (insidePar && !/^\s*\)/.test(right)) {
    s.add(')');
  }
  if (insideBr && !/^\s*\]/.test(right)) {
    s.add(']');
  }

  if (insideBr) {
    if (!/\[[^\]]*,/.test(left)) {
      s.add(',');
    }
    s.add('00:00:00');
    s.add('0');
    return sort(Array.from(s));
  }

  if (!tok) {
    VARS.forEach((v) => s.add(v));
    s.add('(');
    return sort(Array.from(s));
  }

  if (VARS.includes(tok as (typeof VARS)[number])) {
    CMPOPS.forEach((o) => s.add(o));
    s.add('BETWEEN');
    s.add('NOT BETWEEN');
    return sort(Array.from(s));
  }

  if (tok === 'NOT') {
    s.add('BETWEEN');
    return sort(Array.from(s));
  }

  if (tok === 'BETWEEN' || tok === 'NOT BETWEEN') {
    s.add('[');
    return sort(Array.from(s));
  }

  if (CMPOPS.includes(tok as (typeof CMPOPS)[number])) {
    s.add('0');
    s.add('00:00:00');
    return sort(Array.from(s));
  }

  if (tok === ')' || tok === ']' || /^[0-9]|\d{2}:\d{2}:?$/.test(tok)) {
    s.add('AND');
    s.add('OR');
    return sort(Array.from(s));
  }

  KEYWORDS.forEach((k) => s.add(k));
  SYMBOLS.forEach((k) => s.add(k));
  VARS.forEach((v) => s.add(v));
  return sort(Array.from(s));
}

function sort(arr: string[]): string[] {
  const score = (x: string) =>
    (CMPOPS as readonly string[]).includes(x)
      ? 0
      : (KEYWORDS as readonly string[]).includes(x)
        ? 1
        : (SYMBOLS as readonly string[]).includes(x)
          ? 2
          : (VARS as readonly string[]).includes(x)
            ? 3
            : 4;
  return arr.sort((a, b) => score(a) - score(b) || a.localeCompare(b));
}
