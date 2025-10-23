import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/redux-rtk';
import { api, axiosErrorMessage } from '@/shared/axios.config';

import type { Page, PageQuery, Transaction } from '../types';

const API = '/api';

export const fetchTransactions = createAsyncThunk<
  Page<Transaction>,
  PageQuery,
  { state: RootState }
>('transactions/fetch', async (q, { rejectWithValue }) => {
  try {
    const res = await api.get<Page<Transaction>>(API, {
      params: { page: q.page, pageSize: q.pageSize },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(axiosErrorMessage(err));
  }
});
