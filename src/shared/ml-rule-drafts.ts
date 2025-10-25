// src/shared/ml-rule-drafts.ts
export interface MlRule {
  ruleId: string;
  name: string;
  description: string;
  modelConfig: { modelName: string; inputFeatures: string[] };
  riskRange: { min: number; max: number; maxInclusive: boolean };
}

const LS_KEY = 'ml-rule-drafts:v1';

class MlDraftStore {
  private mem = new Map<string, MlRule>();

  constructor() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, MlRule>;
        Object.entries(obj).forEach(([k, v]) => this.mem.set(k, v));
      }
    } catch {
      /* ignore */
    }
  }
  private flush() {
    try {
      const obj: Record<string, MlRule> = {};
      this.mem.forEach((v, k) => (obj[k] = v));
      localStorage.setItem(LS_KEY, JSON.stringify(obj));
    } catch {
      /* ignore */
    }
  }

  get(key: string): MlRule | undefined {
    return this.mem.get(key);
  }
  set(key: string, value: MlRule): void {
    this.mem.set(key, value);
    this.flush();
  }
  delete(key: string): void {
    this.mem.delete(key);
    this.flush();
  }
  clear(): void {
    this.mem.clear();
    this.flush();
  }
}

export const MlRuleDrafts = new MlDraftStore();
