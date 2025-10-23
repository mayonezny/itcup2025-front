import type { RuleValue } from "../types";

export interface RuleObject {
    id: number;
    isActive: boolean;
    filterType: string;
    action: string;
    ruleValue: RuleValue;
    priority: number;
}

export type RulesDTO = RuleObject[];

export interface RuleSendDTO {
    rule: RuleObject;
    id: number;
};