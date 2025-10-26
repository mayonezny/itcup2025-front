import type { FieldType } from '../field-types';
import type { Conjunction, Disjunction, Model, Predicate } from './generated/ast';

type Op = '>=' | '>' | '<=' | '<' | '=' | 'between';

export function modelToJson(model: Model) {
  const expression = disjunctionToArray(model.expression);
  return { expression };
}

// OR → массив AND-групп
function disjunctionToArray(or: Disjunction) {
  return or.groups.map((conj) => conjunctionToAndGroup(conj));
}

// Conjunction → один массив предикатов (AND)
function conjunctionToAndGroup(conj: Conjunction) {
  const preds: ReturnType<typeof predicateToJson>[] = [];
  for (const term of conj.terms) {
    // term — Primary: либо скобки, либо предикат
    const anyTerm = term;
    if (anyTerm.inner) {
      // inner: Conjunction — разворачиваем предикаты и добавляем
      const innerConj: Conjunction = anyTerm.inner;
      preds.push(...innerConj.terms.map((t) => predicateToJson(t.atom as Predicate)));
    } else {
      preds.push(predicateToJson(anyTerm.atom as Predicate, (anyTerm.nots?.length ?? 0) % 2 === 1));
    }
  }
  return preds;
}

function predicateToJson(p: Predicate, outerNot = false) {
  const name = (p.name ?? '').toLowerCase();
  const opTok = (p.op ?? '') as Op | '';
  const isBetween = Boolean(p.neg) || String(p.neg) === 'NOT' || hasBetween(p);
  if (isBetween) {
    const a = getValue(p.a);
    const b = getValue(p.b);
    const t = valueType(a);
    return {
      name,
      type: t,
      inversion: outerNot || Boolean(p.neg), // NOT или NOT BETWEEN
      operator: 'between' as const,
      value: t === 'double' ? `${toFloat(a)}-${toFloat(b)}` : `${a}-${b}`,
    };
  } else {
    const v = getValue(p.value);
    const t = valueType(v);
    return {
      name,
      type: t,
      inversion: outerNot,
      operator: (opTok || '=') as Op,
      value: t === 'double' ? toFloat(v) : v,
    };
  }
}

/* helpers */
const getValue = (n: string | undefined) => String(n ?? '');
const valueType = (s: string): FieldType =>
  /^\d{2}:\d{2}:\d{2}$/.test(s) ? 'timestamp' : 'double';
const toFloat = (s: string) => (/\./.test(s) ? s : `${s}.0`);
const hasBetween = (p: Predicate) =>
  // в AST от infer будет поле, связанное с веткой BETWEEN; проверяем наличие a/b
  p.a !== undefined && p.b !== undefined;
