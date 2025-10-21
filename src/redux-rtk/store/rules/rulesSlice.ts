import { createSlice, type PayloadAction, type Reducer } from '@reduxjs/toolkit';

import type { Rule } from '@/components/RuleElement';

export type RulesState = Rule[];
const initialState: RulesState = [];

const arrayMove = <T>(arr: T[], from: number, to: number) => {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    setRules: (_state, action: PayloadAction<Rule[]>) => action.payload,
    addRule: (_state, action: PayloadAction<Omit<Rule, 'id'>>) => {
      const nextId = (_state.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
      _state.push({
        id: nextId,
        name: action.payload.name,
        rule: action.payload.rule,
        type: action.payload.type,
      });
    },
    updateRule: (state, action: PayloadAction<{ id: number; changes: Partial<Rule> }>) => {
      const i = state.findIndex((r) => r.id === action.payload.id);
      if (i !== -1) {
        state[i] = { ...state[i], ...action.payload.changes };
      }
    },
    deleteRule: (state, action: PayloadAction<{ id: number }>) =>
      state.filter((r) => r.id !== action.payload.id),

    moveRuleByIndex: (s, a: PayloadAction<{ from: number; to: number }>) =>
      arrayMove(s, a.payload.from, a.payload.to),
    clearRules: () => initialState,
  },
});

export const { setRules, addRule, updateRule, deleteRule, moveRuleByIndex, clearRules } =
  rulesSlice.actions;
export default rulesSlice.reducer as Reducer<RulesState>;
