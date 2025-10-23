import { createAsyncThunk } from '@reduxjs/toolkit';

import { api, axiosErrorMessage } from '@/shared/axios.config';

import { API_RULES } from '@/shared/endpoints';
import type { AxiosResponse } from 'axios';
import type { RuleObject, RulesDTO, RuleSendDTO } from '../dto';


export const fetchRules = createAsyncThunk<
  RulesDTO
>('rules/fetch', async (q, { rejectWithValue }) => {
  try {
    const res = await api.get<RulesDTO>(API_RULES);
    return res.data;
  } catch (err) {
    return rejectWithValue(axiosErrorMessage(err));
  }
});

export const addRule = createAsyncThunk<
  RuleObject,
  AxiosResponse
>('rules/add', async (rule, { rejectWithValue }) => {
  try {
    const res = await api.post<RuleObject>(API_RULES, rule);
    return res.data;
  } catch (err) {
    return rejectWithValue(axiosErrorMessage(err));
  }
});

export const updateRule = createAsyncThunk<
  RuleSendDTO,
  AxiosResponse
>('rules/update', async (obj, { rejectWithValue }) => {
  try {
    const res = await api.put<RuleSendDTO>(API_RULES, obj);
    return res.data;
  } catch (err) {
    return rejectWithValue(axiosErrorMessage(err));
  }
});

export const deleteRule = createAsyncThunk('rules/delete', async () => {
  try {
    const res = await api.delete(API_RULES);
    return res.data;
  } catch (err) {
    return axiosErrorMessage(err);
  }
});
