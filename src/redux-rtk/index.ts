import { combineReducers, configureStore } from '@reduxjs/toolkit';

import rulesReducer from '@/features/rules/store/rulesSlice';
import transactionsReducer from '@/features/transactions/store/transactionSlice';

import ruleDraftsReducer from './store/drafts/ruleDraftsSlice';

export const rootReducer = combineReducers({
  rulesReducer,
  transactionsReducer,
  ruleDraftsReducer,
});
export const setupStore = () =>
  configureStore({
    reducer: rootReducer,
  });

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<typeof rootReducer>;
