// src/redux-rtk/store/rules/rulesSlice.ts
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Rule } from '@/components/RuleElement';
import type { BuiltRule, Expression } from '@/shared/lang/types';

/* ---- Доменные типы ---- */

export interface RulesState {
  list: Rule[];
  nextId: number;
}

const initialState: RulesState = {
  list: [],
  nextId: 1,
};

/* ---- Вспомогалки ---- */

// привести приоритеты к 1..N слева направо
function reindexPriorities(list: Rule[]): void {
  list
    .sort((a, b) => a.priority - b.priority)
    .forEach((item, idx) => {
      item.priority = idx + 1;
    });
}

// переместить элемент с oldP на newP, остальные сдвинуть
function movePriority(list: Rule[], id: number, newPriority: number): void {
  const n = list.length;
  if (n === 0) {
    return;
  }

  const item = list.find((r) => r.id === id);
  if (!item) {
    return;
  }

  const oldPriority = item.priority;
  const np = Math.max(1, Math.min(n, newPriority));
  if (np === oldPriority) {
    return;
  }

  for (const r of list) {
    if (r.id === item.id) {
      continue;
    }
    // если поднимаем вверх: [np, old-1] ++
    if (np < oldPriority && r.priority >= np && r.priority < oldPriority) {
      r.priority += 1;
    }
    // если опускаем вниз: [old+1, np] --
    if (np > oldPriority && r.priority <= np && r.priority > oldPriority) {
      r.priority -= 1;
    }
  }
  item.priority = np;
  // на всякий — нормализуем
  reindexPriorities(list);
}

/* ---- Слайс ---- */

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    // добавляет в начало (priority = 1), остальных сдвигает вниз
    addRule: (
      state,
      action: PayloadAction<{
        rule: string;
        exclusion?: string;
        compiled: BuiltRule; // уже собранное (валидация прошла в UI)
      }>,
    ) => {
      // сдвинуть существующие вниз
      for (const r of state.list) {
        r.priority += 1;
      }

      state.list.push({
        id: state.nextId++,
        rule: action.payload.rule,
        exclusion: action.payload.exclusion,
        priority: 1,
        compiled: action.payload.compiled,
      });

      // приводим к 1..N
      reindexPriorities(state.list);
    },

    // правки по id; compiled можно прислать заново после успешной сборки
    updateRule: (
      state,
      action: PayloadAction<{
        id: number;
        changes: {
          rule?: string;
          exclusion?: string;
          compiled?: BuiltRule;
        };
      }>,
    ) => {
      const it = state.list.find((r) => r.id === action.payload.id);
      if (!it) {
        return;
      }
      const { rule, exclusion, compiled } = action.payload.changes;
      if (typeof rule === 'string') {
        it.rule = rule;
      }
      if (typeof exclusion === 'string') {
        it.exclusion = exclusion;
      }
      if (compiled) {
        it.compiled = compiled;
      }
    },

    // удалить и переиндексировать приоритеты
    deleteRule: (state, action: PayloadAction<{ id: number }>) => {
      state.list = state.list.filter((r) => r.id !== action.payload.id);
      reindexPriorities(state.list);
    },

    // сменить приоритет с корректным сдвигом остальных
    changePriority: (state, action: PayloadAction<{ id: number; priority: number }>) => {
      movePriority(state.list, action.payload.id, action.payload.priority);
    },

    // удобные обёртки
    moveUp: (state, action: PayloadAction<{ id: number }>) => {
      const it = state.list.find((r) => r.id === action.payload.id);
      if (!it) {
        return;
      }
      movePriority(state.list, it.id, it.priority - 1);
    },

    moveDown: (state, action: PayloadAction<{ id: number }>) => {
      const it = state.list.find((r) => r.id === action.payload.id);
      if (!it) {
        return;
      }
      movePriority(state.list, it.id, it.priority + 1);
    },
  },
});

export const { addRule, updateRule, deleteRule, changePriority, moveUp, moveDown } =
  rulesSlice.actions;

export default rulesSlice.reducer;

/* ---- Селекторы ---- */

// Отсортированный список
export const selectRulesSorted = (state: { rules: RulesState }): Rule[] =>
  [...state.rules.list].sort((a, b) => a.priority - b.priority);

// Готовый документ к отправке (используем только compiled)
export const selectCompiledDocument = createSelector(
  (state: { rules: RulesState }) => state.rules.list,
  (list): { rules: Array<{ expression: Expression; exclusion: Expression; priority: number }> } => {
    const rows = [...list]
      .sort((a, b) => a.priority - b.priority)
      .map((r) => ({
        expression: r.compiled?.expression ?? ([] as Expression),
        exclusion: r.compiled?.exclusion ?? ([] as Expression),
        priority: r.priority,
      }));
    return { rules: rows };
  },
);
