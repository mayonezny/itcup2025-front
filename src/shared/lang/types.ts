// src/shared/lang/types.ts
export type Operator = '>=' | '>' | '<=' | '<' | '=' | 'between';
export type ValueType = 'float' | 'time';

export interface JsonPredicate {
  name: string; // lowercased
  type: ValueType;
  inversion: boolean; // внешнее NOT или NOT BETWEEN
  operator: Operator;
  value: string; // "5000.0" | "00:00:00-12:30:00"
}

export type AndGroup = JsonPredicate[];
export type Expression = AndGroup[];

export interface BuiltRule {
  expression: Expression;
  exclusion: Expression;
}
