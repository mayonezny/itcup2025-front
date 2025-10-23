import type { BuiltMlRule, BuiltRule } from "@/shared/lang/types";

export type RuleValue = AlgRuleValue | MlRuleValue;

export type AlgRuleValue = BuiltRule;
export type MlRuleValue = BuiltMlRule;