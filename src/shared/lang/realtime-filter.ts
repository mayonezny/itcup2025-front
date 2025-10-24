// src/shared/lang/realtime-filter.ts
export function filterRealtimeErrors(text: string, messages: string[]) {
  const t = text.trimEnd();

  // Незавершённые хвосты, где ругаться рано
  const unfinished =
    /(?:>=|>|<=|<|=)\s*$/.test(t) || // "COUNT >"
    /\bNOT\s*$/.test(t) || // "NOT"
    /\b(NOT\s+)?BETWEEN\s*$/.test(t) || // "BETWEEN"
    /\[\s*$/.test(t) || // "["
    /\[\s*[^,\]]*$/.test(t) || // "[00:00" (ещё нет запятой)
    /\[\s*[^,\]]*,\s*$/.test(t) || // "[00:00:00, "
    /\d{2}:\d{0,2}$/.test(t); // "12:" или "12:3"

  if (!unfinished) {
    return messages;
  }
  // Оставляем только «жёсткие» ошибки (если захочешь — можно тоньше отбирать)
  return messages.filter((m) => !/Ожидалось значение|BETWEEN требует|должен сравниваться/.test(m));
}
