import { configureStore } from '@reduxjs/toolkit';

// сюда импортируешь редьюсеры
// import todosReducer from './todos/slice';

export const store = configureStore({
  reducer: {
    // todos: todosReducer,
  },
  // middleware: (getDefault) => getDefault().concat(api.middleware), // если потом подключишь RTK Query
});

// типы для хуков
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
