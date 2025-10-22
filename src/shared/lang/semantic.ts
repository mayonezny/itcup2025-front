import { DiagnosticSeverity, type Diagnostic } from 'vscode-languageserver-types';

import type { Conjunction, Model, Predicate } from './generated/ast.js';

export function collectSemanticDiagnostics(model: Model, fullText: string): Diagnostic[] {
  const diags: Diagnostic[] = [];
  if (!model?.expression) {
    return diags;
  }

  for (const conj of model.expression.groups ?? []) {
    visitConjunction(conj, diags, fullText);
  }
  return diags;
}

function visitConjunction(conj: Conjunction, diags: Diagnostic[], fullText: string) {
  for (const term of conj.terms ?? []) {
    // Primary → либо скобки (inner), либо атом (atom)
    const any = term as any;
    if (any.inner) {
      for (const t of (any.inner as Conjunction).terms ?? []) {
        const pred = (t as any).atom as Predicate;
        checkPredicate(pred, diags, fullText);
      }
    } else if (any.atom) {
      const pred = any.atom as Predicate;
      checkPredicate(pred, diags, fullText, (any.nots?.length ?? 0) % 2 === 1);
    }
  }
}

function checkPredicate(pred: Predicate, diags: Diagnostic[], text: string, _outerNot = false) {
  const name = pred.name ?? '';

  if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
    diags.push(msg('Имя переменной должно быть в UPPER_SNAKE_CASE', pred, text));
  }

  // BETWEEN ветка?
  const isBetween = (pred as any).a !== undefined && (pred as any).b !== undefined;
  if (isBetween) {
    const a = String((pred as any).a ?? '');
    const b = String((pred as any).b ?? '');
    const ta = valueType(a);
    const tb = valueType(b);
    if (ta !== tb) {
      diags.push(
        msg('BETWEEN требует значения одного типа (оба время или оба число).', pred, text),
      );
      return;
    }
    if (eq(a, b, ta)) {
      diags.push(msg('Левый и правый операнды BETWEEN не могут быть равны.', pred, text));
    } else if (!lt(a, b, ta)) {
      diags.push(msg('Левый операнд BETWEEN должен быть строго меньше правого.', pred, text));
    }
    return;
  }

  // Обычное сравнение
  const op = String(pred.op ?? '').trim();
  const v = String((pred as any).value ?? '').trim();
  if (!op) {
    diags.push(msg('Ожидался оператор сравнения (>=, >, <=, <, =) или BETWEEN.', pred, text));
  } else if (!v) {
    diags.push(msg('Ожидалось значение для оператора сравнения.', pred, text));
  } else {
    // типобезопасность: COUNT vs TIME и т.п. — простая эвристика
    const vt = valueType(v);
    if (name === 'TIME' && vt !== 'time') {
      diags.push(msg('TIME должен сравниваться со значением времени HH:MM:SS.', pred, text));
    }
    if (name === 'COUNT' && vt !== 'float') {
      diags.push(msg('COUNT должен сравниваться с числом.', pred, text));
    }
  }
}

function toSeconds(s: string) {
  const [hh, mm, ss] = s.split(':').map((n) => Number(n));
  return hh * 3600 + mm * 60 + ss;
}
function lt(a: string, b: string, t: 'time' | 'float') {
  return t === 'time' ? toSeconds(a) < toSeconds(b) : Number(a) < Number(b);
}
function eq(a: string, b: string, t: 'time' | 'float') {
  return t === 'time' ? toSeconds(a) === toSeconds(b) : Number(a) === Number(b);
}

/* helpers */
function valueType(s: string): 'time' | 'float' {
  return /^\d{2}:\d{2}:\d{2}$/.test(s) ? 'time' : 'float';
}

function msg(message: string, node: any, fullText: string): Diagnostic {
  // Пытаемся «попасть» диапазоном в предикат (очень грубо, но достаточно для UI)
  const name = String(node?.name ?? '');
  const idx = name ? fullText.indexOf(name) : -1;
  const start = Math.max(0, idx);
  const end = start + (name ? name.length : 1);
  return {
    message,
    severity: DiagnosticSeverity.Error,
    range: {
      start: { line: 0, character: start },
      end: { line: 0, character: end },
    },
  };
}
