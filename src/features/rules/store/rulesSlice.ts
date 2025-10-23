// src/features/transactions/transactionsSlice.ts
import { createSlice } from '@reduxjs/toolkit';


import type { RulesDTO } from '../dto';
import { addRule, deleteRule, fetchRules, updateRule } from './rulesThunks';

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
    b.addCase(addRule.fulfilled, (s, a) => {
      s.loading = false;
      s.items.push(a.payload);
    });
    b.addCase(addRule.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || 'Unknown error';
    });
    b.addCase(updateRule.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(updateRule.fulfilled, (s, a) => {
      s.loading = false;
      s.items.push(a.payload.rule);
    });
    b.addCase(updateRule.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || 'Unknown error';
    });
    b.addCase(deleteRule.pending, (s, a) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(deleteRule.fulfilled, (s, a) => {
      s.loading = false;
      s.items = a.payload;
    });
    b.addCase(deleteRule.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || 'Unknown error';
    });
  },
});

export default rulesSlice.reducer;

