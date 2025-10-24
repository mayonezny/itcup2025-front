// // src/redux-rtk/store/rules/rulesThunks.ts
// import { createAsyncThunk } from '@reduxjs/toolkit';

// import type { Rule } from '@/components/RuleElement';
// import type { RootState } from '@/redux-rtk/index';
// import { ruleJsonToText } from '@/shared/lang/pretty'; // опционально, для восстановления текста

// import rulesSlice from './rulesSlice';
// import type { ServerDoc, ServerRule } from './types';

// // эндпоинты подставь свои
// const API_URL = '/api/rules';

// // GET: загрузить JSON, распарсить в локальные Rule
// export const fetchRules = createAsyncThunk<Rule[]>('rules/fetch', async () => {
//   const res = await fetch(API_URL, { method: 'GET' });
//   if (!res.ok) {
//     throw new Error(`fetchRules failed: ${res.status}`);
//   }
//   const data: ServerDoc = await res.json();

//   let nextId = 1;
//   const list: Rule[] = data.rules
//     .slice()
//     .sort((a, b) => a.priority - b.priority)
//     .map((r: ServerRule) => {
//       // восстановим текст (expression/exclusion) из JSON — красиво для UI
//       const pretty = ruleJsonToText({ expression: r.expression, exclusion: r.exclusion });
//       return {
//         id: nextId++,
//         rule: pretty.expression, // если не нужен текст — можно ставить ''
//         exclusion: pretty.exclusion,
//         priority: r.priority,
//       };
//     });

//   return list;
// });

// // POST/PUT: собрать JSON из стора и отправить
// export const saveRules = createAsyncThunk<void, void, { state: RootState }>(
//   'rules/save',
//   async (_arg, thunkApi) => {
//     const state = thunkApi.getState();
//     const doc = await assembleServerDoc(state); // ← валидирует и собирает
//     const res = await fetch(API_URL, {
//       method: 'POST', // или PUT
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(doc),
//     });
//     if (!res.ok) {
//       throw new Error(`saveRules failed: ${res.status}`);
//     }
//   },
// );

// // удобный helper для init
// export const initRules = createAsyncThunk<void>('rules/init', async (_arg, thunkApi) => {
//   const list = await thunkApi.dispatch(fetchRules()).unwrap();
//   thunkApi.dispatch(rulesSlice.actions.setAll(list));
// });
