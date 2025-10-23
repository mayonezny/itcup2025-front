import { combineReducers, configureStore } from '@reduxjs/toolkit';

import transactionsReducer from '@/features/transactions/store/transactionSlice';

import rulesReducer from './store/rules/rulesSlice';

export const rootReducer = combineReducers({
  rulesReducer,
  transactionsReducer,
});
export const setupStore = () =>
  configureStore({
    reducer: rootReducer,
  });

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<typeof rootReducer>;
