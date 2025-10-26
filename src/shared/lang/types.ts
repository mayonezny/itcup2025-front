import type { FieldType } from '../field-types';

// src/shared/lang/types.ts
export type Operator = '>=' | '>' | '<=' | '<' | '=' | 'between';
export type ValueType = FieldType;

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

export interface BuiltMlRule {
  rule_id: string;
  name: string;
  description: string;
  model_config: ModelConfig;
  risk_range: RiskRange;
}

export interface ModelConfig {
  model_name: string;
  input_features: string[];
}

export interface RiskRange {
  min: number;
  max: number;
  max_inclusive: boolean;
}
