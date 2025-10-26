import type { FilterType, RuleValue } from '../types';

export interface RuleObject {
  id: number;
  is_active: boolean;
  filter_type: FilterType;
  action: string;
  rule_value: RuleValue;
  priority: number;
}

export type RuleObjectPartial = Partial<RuleObject>;
export type RulesDTO = RuleObject[];

export interface RuleSendDTO {
  rule: RuleObject;
  id: number;
}
