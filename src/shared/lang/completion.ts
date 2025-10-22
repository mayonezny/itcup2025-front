// src/shared/lang/completion.ts
const KEYWORDS = ['AND', 'OR', 'NOT', 'BETWEEN'];
const CMPOPS = ['>=', '>', '<=', '<', '='];
const SYMBOLS = ['(', ')', '[', ']', ','];

function lastWord(s: string) {
  const m = s.match(/[A-Z][A-Z0-9_]*$/);
  return m ? m[0] : '';
}
function lastNonSpaceChar(s: string) {
  const m = s.match(/\S(?=\s*$)/);
  return m ? m[0] : '';
}
function countBalance(s: string, open: string, close: string) {
  let bal = 0;
  for (const ch of s) {
    if (ch === open) {
      bal++;
    } else if (ch === close) {
      bal = Math.max(0, bal - 1);
    }
  }
  return bal;
}
function looksLikeTimePrefix(s: string) {
  return /(?:^|[\s,[])([01]?\d|2[0-3])?:?$/.test(s) || /\d{2}:\d{0,2}$/.test(s);
}
function looksLikeNumberPrefix(s: string) {
  return /(?:^|[\s,[])\d*\.?\d*$/.test(s);
}

/** Простые подсказки по offset каретки, без LSP */
export async function getCompletionsAt(text: string, offset: number): Promise<string[]> {
  const left = text.slice(0, offset);
  const right = text.slice(offset);

  const suggestions = new Set<string>();

  // База
  KEYWORDS.forEach((k) => suggestions.add(k));
  CMPOPS.forEach((o) => suggestions.add(o));
  SYMBOLS.forEach((s) => suggestions.add(s));

  // Баланс скобок → подсказать закрывающие
  const parenOpen = countBalance(left, '(', ')');
  if (parenOpen > 0) {
    suggestions.add(')');
  }
  const bracketOpen = countBalance(left, '[', ']');
  if (bracketOpen > 0) {
    suggestions.add(']');
  }

  const prevWord = lastWord(left);
  const prevChar = lastNonSpaceChar(left);

  // После IDENT → операторы сравнения, или NOT/BETWEEN
  if (prevWord && /^[A-Z]/.test(prevWord)) {
    CMPOPS.forEach((o) => suggestions.add(o));
    suggestions.add('NOT');
    suggestions.add('BETWEEN');
    suggestions.add('NOT BETWEEN');
  }

  // После NOT → BETWEEN
  if (/\bNOT\s*$/i.test(left)) {
    suggestions.add('BETWEEN');
  }

  // После BETWEEN → '['
  if (/\bBETWEEN\s*$/i.test(left)) {
    suggestions.add('[');
  }

  // Внутри [ ... ] → значения и запятая
  if (bracketOpen > 0) {
    if (!left.includes(',')) {
      suggestions.add(',');
    }
    // Подсказки значений
    if (looksLikeTimePrefix(left)) {
      suggestions.add('00:00:00');
    }
    if (looksLikeNumberPrefix(left)) {
      suggestions.add('0');
    }
  }

  // Если справа уже есть слово/символ — не предлагать конфликтующие пары
  if (/^\s*\)/.test(right)) {
    suggestions.delete(')');
  }
  if (/^\s*\]/.test(right)) {
    suggestions.delete(']');
  }

  // Нормализуем и отсортируем: операторы, keywords, скобки
  const order = (s: string) =>
    CMPOPS.includes(s) ? 0 : KEYWORDS.includes(s) ? 1 : SYMBOLS.includes(s) ? 2 : 3;
  return Array.from(suggestions).sort((a, b) => order(a) - order(b) || a.localeCompare(b));
}
