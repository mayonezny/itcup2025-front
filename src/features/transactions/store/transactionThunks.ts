import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/redux-rtk';
import { api, axiosErrorMessage } from '@/shared/axios.config';

import type { Page, PageQuery, Transaction } from '../types';
import type { transactionDTO, unionStatus } from '../dto';

const API = '/api';

export const fetchTransactions = createAsyncThunk<
  Page<unionStatus>,
  PageQuery,
  { state: RootState }
>('transactions/fetch', async (q, { rejectWithValue }) => {
  try {
    const res = await api.get<Page<unionStatus>>(API, {
      params: { page: q.page, pageSize: q.pageSize },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(axiosErrorMessage(err));
  }
});
