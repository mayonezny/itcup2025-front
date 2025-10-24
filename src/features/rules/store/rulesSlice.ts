// src/features/transactions/transactionsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RuleObject, RulesDTO } from '../dto';
import { addRule, deleteRule, fetchRules, normalizeRules, updateRule } from './rulesThunks';

export interface RulesState {
  items: RulesDTO;
  total: number;
  loading: boolean;
  error?: string;
}

const initialState: RulesState = {
  items: [],
  total: 0,
  loading: false,
};

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<RuleObject[]>) {
      state.items = normalizePriorities(action.payload);
    },
    addRuleLoc(state, action: PayloadAction<RuleObject>) {
      const arr = state.items.map((r) => ({ ...r, priority: r.priority + 1 }));
      arr.unshift({ ...action.payload, priority: 1 });
      state.items = arr;
    },
    updateRuleLoc(state, action: PayloadAction<{ id: number; changes: Partial<RuleObject> }>) {
      const { id, changes } = action.payload;
      state.items = state.items.map((r) => (r.id === id ? { ...r, ...changes } : r));
    },
    deleteRuleLoc(state, action: PayloadAction<{ id: number }>) {
      state.items = normalizePriorities(state.items.filter((r) => r.id !== action.payload.id));
    },
    changePriority(state, action: PayloadAction<{ id: number; priority: number }>) {
      const { id, priority } = action.payload;
      const n = state.items.length;
      const target = Math.max(1, Math.min(n, priority));
      const current = state.items.find((r) => r.id === id);
      if (!current || current.priority === target) {
        return;
      }

      const from = current.priority;
      state.items = state.items
        .map((r) => {
          if (r.id === id) {
            return { ...r, priority: target };
          }
          if (from < target && r.priority > from && r.priority <= target) {
            return { ...r, priority: r.priority - 1 };
          }
          if (from > target && r.priority >= target && r.priority < from) {
            return { ...r, priority: r.priority + 1 };
          }
          return r;
        })
        .sort((a, b) => a.priority - b.priority);
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchRules.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(fetchRules.fulfilled, (s, a) => {
      s.loading = false;
      s.items = a.payload;
    });
    b.addCase(fetchRules.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || 'Unknown error';
    });
    b.addCase(addRule.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(addRule.fulfilled, (s) => {
      s.loading = false;
    });
    b.addCase(addRule.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || 'Unknown error';
    });
    b.addCase(updateRule.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(updateRule.fulfilled, (s) => {
      s.loading = false;
    });
    b.addCase(updateRule.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || 'Unknown error';
    });
    b.addCase(deleteRule.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(deleteRule.fulfilled, (s) => {
      s.loading = false;
    });
    b.addCase(deleteRule.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || 'Unknown error';
    });
    b.addCase(normalizeRules.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(normalizeRules.fulfilled, (s) => {
      s.loading = false;
    });
    b.addCase(normalizeRules.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || 'Unknown error';
    });
  },
});

export const { setAll, addRuleLoc, updateRuleLoc, deleteRuleLoc, changePriority } =
  rulesSlice.actions;
export default rulesSlice.reducer;

function normalizePriorities(arr: RuleObject[]): RuleObject[] {
  return [...arr]
    .sort((a, b) => a.priority - b.priority)
    .map((r, i) => ({ ...r, priority: i + 1 }));
}
