import axios, { AxiosError } from 'axios';
import { API_URL } from './constants';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

export function axiosErrorMessage(err: unknown): string {
  const e = err as AxiosError<{ message?: string }>;
  if (e.response?.data?.message) return e.response.data.message;
  if (e.message) return e.message;
  return 'Network error';
}
