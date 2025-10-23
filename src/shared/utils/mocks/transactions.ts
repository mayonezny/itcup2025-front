// src/mocks/transactions.ts
import { faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw';

import type { unionStatus } from '@/features/transactions/dto';
import type { Page, Transaction } from '@/features/transactions/types';
import { API_TRANSACTIONS } from '@/shared/endpoints';

const API = '/api';

// сгенерим фиксированный пул "больших" данных
const ALL: unionStatus[] = Array.from({ length: 1234 }, (_, i) => ({
  id: i + 1,
  correlationId: faker.string.uuid(),
  transactionId: faker.string.alphanumeric(16),
  timestamp: faker.date.recent({ days: 14 }).toISOString(),
  senderAccount: faker.finance.accountNumber(12),
  receiverAccount: faker.finance.accountNumber(12),
  amount: faker.finance.amount({ min: 1, max: 5000, dec: 2 }),
  transactionType: faker.helpers.arrayElement(['transfer', 'purchase', 'withdrawal']),
  merchantCategory: faker.commerce.department(),
  location: `${faker.location.city()}, ${faker.location.countryCode()}`,
  deviceUsed: faker.helpers.arrayElement(['web', 'ios', 'android']),
  isFraud: faker.datatype.boolean({ probability: 0.07 }),
  fraudType: null,
  timeSinceLastTransaction: faker.number.float({ min: 0, max: 86400, multipleOf: 0.1 }),
  spendingDeviationScore: faker.number.float({ min: -3, max: 3, multipleOf: 0.01 }),
  velocityScore: faker.number.int({ min: 0, max: 100 }),
  geoAnomalyScore: faker.number.float({ min: 0, max: 1, multipleOf: 0.001 }),
  paymentChannel: faker.helpers.arrayElement(['card', 'bank', 'p2p']),
  ipAddress: faker.internet.ip(),
  deviceHash: faker.string.alphanumeric(24),
  statuses: [{ name: '', datetime: new Date().toString(), description: '' }],
}));

export const transactionsHandlers = [
  http.get(API_TRANSACTIONS, ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
    const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? '20'));

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const items = ALL.slice(start, end);
    const body: Page<Transaction> = {
      items,
      total: ALL.length,
      page,
      pageSize,
    };
    return HttpResponse.json(body);
  }),
];
