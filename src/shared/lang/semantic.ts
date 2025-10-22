// src/shared/lang/semantic.ts
import { DiagnosticSeverity, type Diagnostic } from 'vscode-languageserver-types';

import type { Conjunction, Model, Predicate } from './generated/ast.js';

type PrimaryLike = { inner?: Conjunction; atom?: Predicate; nots?: unknown[] };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const hasInner = (v: unknown): v is { inner: Conjunction } =>
  isObject(v) && 'inner' in v && v.inner !== undefined;

const hasAtom = (v: unknown): v is { atom: Predicate; nots?: unknown[] } =>
  isObject(v) && 'atom' in v && v.atom !== undefined;

const isBetweenPredicate = (
  p: Predicate,
): p is Predicate & { a: unknown; b: unknown; neg?: unknown } =>
  isObject(p) && 'a' in p && 'b' in p;

const hasCompare = (p: Predicate): p is Predicate & { op: unknown; value: unknown } =>
  isObject(p) && 'op' in p && 'value' in p;

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

function visitConjunction(conj: Conjunction, diags: Diagnostic[], fullText: string): void {
  for (const term of conj.terms ?? []) {
    const t = term as unknown as PrimaryLike;
    if (hasInner(t)) {
      for (const inner of t.inner.terms ?? []) {
        if (hasAtom(inner)) {
          checkPredicate(inner.atom, diags, fullText, (inner.nots?.length ?? 0) % 2 === 1);
        }
      }
    } else if (hasAtom(t)) {
      checkPredicate(t.atom, diags, fullText, (t.nots?.length ?? 0) % 2 === 1);
    }
  }
}

function checkPredicate(
  pred: Predicate,
  diags: Diagnostic[],
  text: string,
  _outerNot: boolean,
): void {
  const rawName = (pred as unknown as Record<string, unknown>)?.name;
  const name = typeof rawName === 'string' ? rawName : '';

  if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
    diags.push(msg('Имя переменной должно быть в UPPER_SNAKE_CASE', pred, text));
  }

  if (isBetweenPredicate(pred)) {
    const a = toStringSafe(pred.a);
    const b = toStringSafe(pred.b);
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

  if (hasCompare(pred)) {
    const op = String(pred.op ?? '').trim();
    const v = toStringSafe(pred.value).trim();
    if (!op) {
      diags.push(msg('Ожидался оператор сравнения (>=, >, <=, <, =) или BETWEEN.', pred, text));
      return;
    }
    if (!v) {
      diags.push(msg('Ожидалось значение для оператора сравнения.', pred, text));
      return;
    }
    const vt = valueType(v);
    if (name === 'TIME' && vt !== 'time') {
      diags.push(msg('TIME должен сравниваться со значением времени HH:MM:SS.', pred, text));
    }
    if (name === 'COUNT' && vt !== 'float') {
      diags.push(msg('COUNT должен сравниваться с числом.', pred, text));
    }
    return;
  }

  // незавершённый предикат — ничего не добавляем, это поймает синтаксис
}

/* helpers */

function toStringSafe(v: unknown): string {
  return typeof v === 'string' ? v : String(v ?? '');
}

function valueType(s: string): 'time' | 'float' {
  return /^\d{2}:\d{2}:\d{2}$/.test(s) ? 'time' : 'float';
}

function toSeconds(s: string): number {
  const [hh, mm, ss] = s.split(':').map(Number);
  return hh * 3600 + mm * 60 + ss;
}
function lt(a: string, b: string, t: 'time' | 'float'): boolean {
  return t === 'time' ? toSeconds(a) < toSeconds(b) : Number(a) < Number(b);
}
function eq(a: string, b: string, t: 'time' | 'float'): boolean {
  return t === 'time' ? toSeconds(a) === toSeconds(b) : Number(a) === Number(b);
}

function msg(message: string, node: Predicate, fullText: string): Diagnostic {
  // грубо определяем диапазон по имени
  const name = String((node as unknown as Record<string, unknown>)?.name ?? '');
  const idx = name ? fullText.indexOf(name) : -1;
  const start = Math.max(0, idx);
  const end = start + (name ? name.length : 1);
  return {
    message,
    severity: DiagnosticSeverity.Error,
    range: { start: { line: 0, character: start }, end: { line: 0, character: end } },
  };
}
