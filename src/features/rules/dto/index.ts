import type { FilterType, RuleValue } from '../types';

export interface RuleObject {
  id: number;
  isActive: boolean;
  filterType: FilterType;
  action: string;
  ruleValue: RuleValue;
  priority: number;
}

export type RuleObjectPartial = Partial<RuleObject>;
export type RulesDTO = RuleObject[];

export interface RuleSendDTO {
  rule: RuleObject;
  id: number;
}
