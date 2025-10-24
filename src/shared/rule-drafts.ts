// src/shared/rule-drafts.ts
import type { AlgRuleValue } from '@/features/rules/types';

const algDrafts = new Map<string, AlgRuleValue>();

export const RuleDrafts = {
  get(key: string): AlgRuleValue | undefined {
    return algDrafts.get(key);
  },
  set(key: string, val: AlgRuleValue) {
    algDrafts.set(key, val);
  },
  delete(key: string) {
    algDrafts.delete(key);
  },
  has(key: string) {
    return algDrafts.has(key);
  },
};
