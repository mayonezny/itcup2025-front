import { combineReducers, configureStore } from '@reduxjs/toolkit';

import rulesReducer from './store/rules/rulesSlice';

export const rootReducer = combineReducers({
  rulesReducer,
});
export const setupStore = () =>
  configureStore({
    reducer: rootReducer,
  });

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<typeof rootReducer>;
