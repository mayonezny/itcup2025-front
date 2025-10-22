import axios, { AxiosError } from 'axios';

export const api = axios.create({
  // baseURL: API_URL,
  withCredentials: true,
  timeout: 15000
});

export function axiosErrorMessage(err: unknown): string {
  const e = err as AxiosError<{ message?: string }>;
  if (e.response?.data?.message) return e.response.data.message;
  if (e.message) return e.message;
  return 'Network error';
}