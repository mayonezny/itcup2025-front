import { createSlice, type PayloadAction, type Reducer } from '@reduxjs/toolkit';

import type { Rule } from '@/components/RuleElement';
import { changePriorityInPlace } from '@/shared/utils/priorityChanger';

export type RulesState = Rule[];
const initialState: RulesState = [];

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    setRules: (_state, action: PayloadAction<Rule[]>) => action.payload,
    addRule: (_state, action: PayloadAction<Omit<Rule, 'id'>>) => {
      const nextId = (_state.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
      // 1) всем существующим +1
      _state.forEach((it) => {
        it.priority += 1;
      });
      // 2) добавить новый с priority=1
      _state.push({ ...action.payload, priority: 1, id: nextId });
      // (опционально) держать массив отсортированным по приоритету
      _state.sort((a, b) => a.priority - b.priority);
    },
    updateRule: (state, action: PayloadAction<{ id: number; changes: Partial<Rule> }>) => {
      const i = state.findIndex((r) => r.id === action.payload.id);
      if (i !== -1) {
        state[i] = { ...state[i], ...action.payload.changes };
      }
    },
    deleteRule: (state, action: PayloadAction<{ id: number }>) =>
      state.filter((r) => r.id !== action.payload.id),

    changePriority: (state, action: PayloadAction<{ id: number; priority: number }>) =>
      changePriorityInPlace(state, action.payload.id, action.payload.priority),

    clearRules: () => initialState,
  },
});

export const { setRules, addRule, updateRule, deleteRule, changePriority, clearRules } =
  rulesSlice.actions;
export default rulesSlice.reducer as Reducer<RulesState>;
