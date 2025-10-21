import type { Rule } from '@/components/RuleElement';

export function changePriorityInPlace<T extends Rule>(
  items: T[],
  id: T['id'],
  newPriorityRaw: number,
) {
  const n = items.length;
  if (n <= 1) {
    return;
  }

  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) {
    return;
  }

  const oldP = items[idx].priority;
  const newP = Math.max(1, Math.min(n, Math.round(newPriorityRaw)));
  if (newP === oldP) {
    return;
  }

  if (newP < oldP) {
    // поднимаем элемент: все из [newP .. oldP-1] сдвигаются вниз (+1)
    for (const it of items) {
      if (it.id !== id && it.priority >= newP && it.priority <= oldP - 1) {
        it.priority += 1;
      }
    }
  } else {
    // опускаем элемент: все из [oldP+1 .. newP] сдвигаются вверх (-1)
    for (const it of items) {
      if (it.id !== id && it.priority >= oldP + 1 && it.priority <= newP) {
        it.priority -= 1;
      }
    }
  }

  items[idx].priority = newP;
  items.sort((a, b) => a.priority - b.priority);
}
