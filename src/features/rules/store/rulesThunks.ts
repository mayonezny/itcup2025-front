import { createAsyncThunk } from '@reduxjs/toolkit';

import { api, axiosErrorMessage } from '@/shared/axios.config';
import { API_RULES } from '@/shared/endpoints';

import type { RuleObject, RulesDTO } from '../dto';

export const fetchRules = createAsyncThunk<RulesDTO>(
  'rules/fetch',
  async (_q, { rejectWithValue }) => {
    try {
      const res = await api.get<RulesDTO>(API_RULES);
      const arr = Array.isArray(res.data) ? res.data : [];
      return arr;
    } catch (err) {
      return rejectWithValue(axiosErrorMessage(err));
    }
  },
);
export interface addRuleDTO {
  rule: Omit<RuleObject, 'id'>;
  login: string;
}
export const addRule = createAsyncThunk<unknown, addRuleDTO>(
  'rules/add',
  async (obj, { rejectWithValue }) => {
    const { rule, login } = obj;
    try {
      const res = await api.post<Omit<RuleObject, 'id'>>(API_RULES, rule, { params: { login } });
      return res.data;
    } catch (err) {
      return rejectWithValue(axiosErrorMessage(err));
    }
  },
);
export interface updateRuleDTO {
  rule: RuleObject;
  login: string;
}
export const updateRule = createAsyncThunk<unknown, updateRuleDTO>(
  'rules/update',
  async (obj, { rejectWithValue }) => {
    const { rule, login } = obj;
    try {
      const res = await api.put<RuleObject>(`${API_RULES}/${rule.id}`, { params: { login } });
      return res.data;
    } catch (err) {
      return rejectWithValue(axiosErrorMessage(err));
    }
  },
);
export interface deleteRuleDTO {
  id: number;
  login: string;
}
export const deleteRule = createAsyncThunk<
  number, // что вернём из thunk (полезно вернуть id)
  deleteRuleDTO
>('rules/delete', async (obj) => {
  try {
    const { id, login } = obj;
    const res = await api.delete(`${API_RULES}/${id}`, { params: { login } });
    return res.data;
  } catch (err) {
    return axiosErrorMessage(err);
  }
});
