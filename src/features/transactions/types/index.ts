// src/features/transactions/types.ts

export interface Transaction {
  id: number;
  correlationId: string;
  transactionId: string;
  timestamp: string; // ISO
  senderAccount: string;
  receiverAccount: string;
  amount: string; // как в схеме
  transactionType: string;
  merchantCategory: string;
  location: string;
  deviceUsed: string;
  isFraud: boolean;
  fraudType: string | null;
  timeSinceLastTransaction: number | null;
  spendingDeviationScore: number | null;
  velocityScore: number | null;
  geoAnomalyScore: number | null;
  paymentChannel: string;
  ipAddress: string;
  deviceHash: string;
}

export interface status {
  name: string;
  description: string;
  datetime: string;
}

// серверный ответ постранично
export interface Page<T> {
  items: T[];
  total: number;
  page: number; // 1-based
  pageSize: number;
}

// запрос на сервер
export interface PageQuery {
  page: number; // 1-based
  pageSize: number; // 10/20/50...
}
