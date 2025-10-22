// src/features/transactions/transactionsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '@/redux-rtk/index';

import type { Transaction } from '../types';
import { fetchTransactions } from './transactionThunks';

export interface TransactionsState {
  items: Transaction[];
  total: number;
  page: number; // 1-based
  pageSize: number;
  loading: boolean;
  error?: string;
}

const initialState: TransactionsState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
      state.page = 1; // сброс на первую страницу
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchTransactions.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    });
    b.addCase(fetchTransactions.fulfilled, (s, a) => {
      s.loading = false;
      s.items = a.payload.items;
      s.total = a.payload.total;
      s.page = a.payload.page;
      s.pageSize = a.payload.pageSize;
    });
    b.addCase(fetchTransactions.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || 'Unknown error';
    });
  },
});

export const { setPage, setPageSize } = transactionsSlice.actions;
export default transactionsSlice.reducer;

// селекторы
export const selectTxState = (s: RootState) => s.transactionsReducer;
export const selectPageCount = (s: RootState) =>
  Math.max(1, Math.ceil(s.transactionsReducer.total / s.transactionsReducer.pageSize));
