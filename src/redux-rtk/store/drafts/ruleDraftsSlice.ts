// redux-rtk/store/rules/ruleDraftsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { BuiltRule } from '@/shared/lang/types';

type Key = string; // `${id}` или временный ключ
type DraftsState = Record<Key, BuiltRule | undefined>;

const initialState: DraftsState = {};

const ruleDraftsSlice = createSlice({
  name: 'ruleDrafts',
  initialState,
  reducers: {
    setDraft(state, action: PayloadAction<{ key: Key; data: BuiltRule }>) {
      state[action.payload.key] = action.payload.data;
    },
    clearDraft(state, action: PayloadAction<{ key: Key }>) {
      delete state[action.payload.key];
    },
  },
});

export const { setDraft, clearDraft } = ruleDraftsSlice.actions;
export default ruleDraftsSlice.reducer;
