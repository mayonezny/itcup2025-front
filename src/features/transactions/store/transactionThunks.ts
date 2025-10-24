import { createAsyncThunk } from '@reduxjs/toolkit';

import type { RootState } from '@/redux-rtk';
import { api, axiosErrorMessage } from '@/shared/axios.config';
import { API_TRANSACTIONS } from '@/shared/endpoints';

import type { unionStatus } from '../dto';
import type { Page, PageQuery } from '../types';

export const fetchTransactions = createAsyncThunk<
  Page<unionStatus>,
  PageQuery,
  { state: RootState }
>('transactions/fetch', async (q, { rejectWithValue }) => {
  try {
    const res = await api.get<Page<unionStatus>>(API_TRANSACTIONS, {
      params: { page: q.page, pageSize: q.pageSize },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(axiosErrorMessage(err));
  }
});
