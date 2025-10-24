// src/mocks/rulesDb.ts
import type { RuleObject } from '@/features/rules/dto';

export const rulesDb: RuleObject[] = [
  {
    id: 1,
    isActive: true,
    filterType: 'alg',
    action: 'action',
    ruleValue: {
      expression: [
        [{ name: 'amount', type: 'float', inversion: false, operator: '>', value: '1000' }],
      ],
      exclusion: [],
    },
    priority: 1,
  },
  {
    id: 2,
    isActive: true,
    filterType: 'ml',
    action: 'route_to_review',
    ruleValue: {
      ruleId: 'ml_low_risk',
      name: 'Низкий риск',
      description: 'score < 0.45',
      modelConfig: { modelName: 'fraud_model_v1.pkl', inputFeatures: ['amount', 'timestamp'] },
      riskRange: { min: 0, max: 0.45, maxInclusive: false },
    },
    priority: 2,
  },
];

export function normalizePriorities(arr: RuleObject[]): RuleObject[] {
  return [...arr]
    .sort((a, b) => a.priority - b.priority)
    .map((r, i) => ({ ...r, priority: i + 1 }));
}

export function nextId(arr: RuleObject[]): number {
  return (arr.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
}
