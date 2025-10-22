// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';

import { transactionsHandlers } from './transactions';

export const worker = setupWorker(...transactionsHandlers);
