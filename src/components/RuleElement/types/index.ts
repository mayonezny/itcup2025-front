import type { BuiltRule } from '@/shared/lang/types';

export interface Rule {
  id: number; // простой числовой id
  rule: string; // сырой текст выражения
  exclusion?: string; // сырой текст исключения
  priority: number; // 1..N без дырок
  compiled?: BuiltRule; // результат сборки (optional, если ещё не валидно)
}
