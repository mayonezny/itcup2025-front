// src/features/transactions/useTransactions.ts
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux-rtk/hooks';

import { selectPageCount, selectTxState, setPage, setPageSize } from '../store/transactionSlice';
import { fetchTransactions } from '../store/transactionThunks';

export function useTransactions() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectTxState);
  const pageCount = useAppSelector(selectPageCount);

  useEffect(() => {
    dispatch(fetchTransactions({ page: state.page, pageSize: state.pageSize }));
  }, [dispatch, state.page, state.pageSize]);

  return {
    ...state,
    pageCount,
    setPage: (p: number) => dispatch(setPage(p)),
    setPageSize: (ps: number) => dispatch(setPageSize(ps)),
    refetch: () => dispatch(fetchTransactions({ page: state.page, pageSize: state.pageSize })),
  };
}
