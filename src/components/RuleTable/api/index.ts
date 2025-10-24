import { useEffect } from 'react';

import { fetchRules } from '@/features/rules/store/rulesThunks';
import { useAppDispatch, useAppSelector } from '@/redux-rtk/hooks';

export const useRuleTable = () => {
  const dispatch = useAppDispatch();
  const rules = useAppSelector((state) => state.rulesReducer.items);
  useEffect(() => {
    dispatch(fetchRules());
  }, [dispatch]);

  return {
    rules,
  };
};
