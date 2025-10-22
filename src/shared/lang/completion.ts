const KEYWORDS = ['AND', 'OR', 'NOT', 'BETWEEN'] as const;
const CMPOPS = ['>=', '>', '<=', '<', '='] as const;
const SYMBOLS = ['(', ')', '[', ']', ','] as const;
const VARS = ['COUNT', 'TIME'] as const; // можно расширить из конфига

type Suggest = string;

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

  const s = new Set<Suggest>();

  const tok = lastToken(left);
  const insideBr = inBracket(left);
  const insidePar = inParen(left);

  // базовые закрывающие
  if (insidePar && !/^\s*\)/.test(right)) {
    s.add(')');
  }
  if (insideBr && !/^\s*\]/.test(right)) {
    s.add(']');
  }

  // внутри скобок-values
  if (insideBr) {
    // если ещё нет запятой — предложить запятую
    if (!/\[[^\]]*,/.test(left)) {
      s.add(',');
    }
    // значения
    s.add('00:00:00');
    s.add('0');
    return sort(Array.from(s));
  }

  // контекст по токену
  if (!tok) {
    // начало
    VARS.forEach((v) => s.add(v));
    s.add('(');
    return sort(Array.from(s));
  }

  if (VARS.includes(tok as any)) {
    // после переменной — сравнение или (NOT) BETWEEN
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

  if (CMPOPS.includes(tok as any)) {
    // после оператора — значения
    s.add('0');
    s.add('00:00:00');
    return sort(Array.from(s));
  }

  if (tok === ')' || tok === ']' || /^[0-9]|^\d{2}:\d{2}:?$/.test(tok)) {
    // после закрытия группы/значения — логические операторы
    s.add('AND');
    s.add('OR');
    return sort(Array.from(s));
  }

  // дефолт
  KEYWORDS.forEach((k) => s.add(k));
  SYMBOLS.forEach((k) => s.add(k));
  VARS.forEach((v) => s.add(v));
  return sort(Array.from(s));
}

function sort(arr: string[]) {
  const score = (x: string) =>
    CMPOPS.includes(x as any)
      ? 0
      : KEYWORDS.includes(x as any)
        ? 1
        : SYMBOLS.includes(x as any)
          ? 2
          : VARS.includes(x as any)
            ? 3
            : 4;
  return arr.sort((a, b) => score(a) - score(b) || a.localeCompare(b));
}
