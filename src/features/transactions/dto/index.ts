import type { Transaction, status } from "../types";

export type statuses = status[];

export type transactionDTO = Transaction & statuses;