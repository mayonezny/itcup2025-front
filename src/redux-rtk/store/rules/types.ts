import type { Expression } from '@/shared/lang/types';

// ---- JSON, что хранит/возвращает сервер ----
export interface ServerRule {
  expression: Expression;
  exclusion: Expression;
  priority: number;
}
export interface ServerDoc {
  rules: ServerRule[];
}
