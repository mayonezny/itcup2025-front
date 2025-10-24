import type { Transaction, status } from '../types';

export interface statuses {
  statuses: status[];
}

export type unionStatus = Transaction & statuses;
export type transactionDTO = unionStatus[];
