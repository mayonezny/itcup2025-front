grammar FraudRules

entry Model:
    expression=Disjunction
;

/* OR имеет наименьший приоритет */
Disjunction:
    {infer Disjunction} groups+=Conjunction (OR groups+=Conjunction)*
;

/* AND – средний */
Conjunction:
    {infer Conjunction} terms+=Primary (AND terms+=Primary)*
;

/* NOT – самый высокий */
Primary:
    '(' inner=Conjunction ')'
  | nots+=NOT* atom=Predicate   // инверсии накапливаем, обработаем в трансформере
;

/* Предикат: IDENT (CmpOp Value) | (NOT? BETWEEN [Value, Value]) */
Predicate:
    {infer Predicate}
  name=Ident (
      (op=CmpOp value=Value)
    | (neg?=NOT? BETWEEN '[' a=Value ',' b=Value ']')
  )
;

/* сравнения */
CmpOp returns string:
    GE | GT | LE | LT | EQ;

/* --- Лексика --- */

terminal AND: 'AND';
terminal OR: 'OR';
terminal NOT: 'NOT';
terminal BETWEEN: 'BETWEEN';

terminal Ident: /[A-Z][A-Z0-9_]*/;
terminal TIME:  /(0\d|1\d|2[0-3]):[0-5]\d:[0-5]\d/;
terminal NUMBER: /\d+(\.\d+)?/;

terminal GE: '>=';
terminal GT: '>';
terminal LE: '<=';
terminal LT: '<';
terminal EQ: '=';

hidden terminal WS: /\s+/;

/* --- Data type rule: значение как строка --- */
Value returns string:
    TIME | NUMBER
;
