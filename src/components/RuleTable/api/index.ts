import { useAppSelector } from '@/redux-rtk/hooks';

export const useRuleTable = () => {
  //   const dispatch = useAppDispatch();
  const rules = useAppSelector((state) => state.rulesReducer);
  //   useEffect(() => {
  //     dispatch(getHistory());
  //   }, [dispatch]);
  //     ^
  //     |        вот этот виноват если все сломалось

  return {
    rules,
  };
};
