// src/mocks/handlers.ts
import { delay, http, HttpResponse } from 'msw';

import type { RuleObject } from '@/features/rules/dto';

import { nextId, normalizePriorities, rulesDb } from './rulesDb';

const API = '/api/rules';

// GET /api/rules  → массив правил
export const getRules = http.get(API, async () => {
  await delay(150); // чуть-чуть реализма
  return HttpResponse.json(normalizePriorities(rulesDb));
});

// POST /api/rules → создать правило (в начало, priority=1; остальных сдвинуть)
export const postRule = http.post(API, async ({ request }) => {
  const body = (await request.json()) as Partial<RuleObject>;
  if (!body || !body.filterType || !body.ruleValue) {
    return HttpResponse.json({ message: 'Bad request' }, { status: 400 });
  }

  const created: RuleObject = {
    id: nextId(rulesDb),
    isActive: body.isActive ?? true,
    filterType: body.filterType,
    action: body.filterType === 'alg' ? 'action' : (body.action ?? ''),
    ruleValue: body.ruleValue as RuleObject['ruleValue'],
    priority: 1,
  };

  // сдвигаем остальные вниз и вставляем
  rulesDb = rulesDb.map((r) => ({ ...r, priority: r.priority + 1 }));
  rulesDb.unshift(created);
  rulesDb = normalizePriorities(rulesDb);

  await delay(150);
  return HttpResponse.json(created, { status: 201 });
});

// PUT /api/rules/:id → полное/частичное обновление
export const putRule = http.put(`${API}/:id`, async ({ params, request }) => {
  const id = Number(params.id);
  const patch = (await request.json()) as Partial<RuleObject>;
  const idx = rulesDb.findIndex((r) => r.id === id);
  if (idx === -1) {
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const curr = rulesDb[idx];
  const next: RuleObject = {
    ...curr,
    ...patch,
    action:
      (patch.filterType ?? curr.filterType) === 'alg' ? 'action' : (patch.action ?? curr.action),
  };

  rulesDb[idx] = next;
  await delay(120);
  return HttpResponse.json(next);
});

// PUT /api/rules/:id/priority { priority }
export const putPriority = http.put(`${API}/:id/priority`, async ({ params, request }) => {
  const id = Number(params.id);
  const body = (await request.json()) as { priority: number };
  const target = Math.max(1, Math.min(rulesDb.length, Number(body?.priority ?? 0)));

  const me = rulesDb.find((r) => r.id === id);
  if (!me) {
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }
  if (me.priority === target) {
    return HttpResponse.json(me);
  }

  const from = me.priority;
  rulesDb = rulesDb.map((r) => {
    if (r.id === id) {
      return { ...r, priority: target };
    }
    if (from < target && r.priority > from && r.priority <= target) {
      return { ...r, priority: r.priority - 1 };
    }
    if (from > target && r.priority >= target && r.priority < from) {
      return { ...r, priority: r.priority + 1 };
    }
    return r;
  });
  rulesDb = normalizePriorities(rulesDb);

  const updated = rulesDb.find((r) => r.id === id)!;
  await delay(100);
  return HttpResponse.json(updated);
});

// DELETE /api/rules/:id
export const deleteRule = http.delete(`${API}/:id`, async ({ params }) => {
  const id = Number(params.id);
  const before = rulesDb.length;
  rulesDb = rulesDb.filter((r) => r.id !== id);
  if (rulesDb.length === before) {
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }

  rulesDb = normalizePriorities(rulesDb);
  await delay(120);
  return new HttpResponse(null, { status: 204 });
});

export const handlers = [getRules, postRule, putRule, putPriority, deleteRule];
