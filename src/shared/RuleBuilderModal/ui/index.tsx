// src/shared/RuleBuilderModal/index.tsx
/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  IconButton,
  Input,
  Message,
  Modal,
  SelectPicker,
  toaster,
} from 'rsuite';

import type { AlgRuleValue } from '@/features/rules/types';
import type {
  AndGroup,
  BuiltRule,
  Expression,
  JsonPredicate,
  Operator,
  ValueType,
} from '@/shared/lang/types';
import { RuleDrafts } from '@/shared/rule-drafts'; // <-- добавлено
import './rule-builder-modal.scss';

import { Plus, SquarePlus, Trash2 } from 'lucide-react';

// --- типы как у тебя (Operator/ValueType/JsonPredicate/.../BuiltRule) ---

export interface RuleDictionaries {
  names: string[];
  operatorsByType: Record<ValueType, Operator[]>;
  valueTypes: ValueType[];
}

export function RuleBuilderModal({
  open,
  onClose,
  dicts,
  initial,
  onSave,
  ruleKey, // <-- добавлено
  clearDraftOnSave, // <-- опция: чистить ли черновик после Save
}: {
  open: boolean;
  onClose: () => void;
  dicts: RuleDictionaries;
  initial?: AlgRuleValue;
  onSave: (rule: BuiltRule) => void;
  ruleKey: string; // ОБЯЗАТЕЛЬНО передаём из строки
  clearDraftOnSave?: boolean;
}) {
  // 1) Посев значений: черновик этого ruleKey > initial > заготовка
  const [expression, setExpression] = useState<Expression>(
    RuleDrafts.get(ruleKey)?.expression ?? initial?.expression ?? [[blankPredicate()]],
  );
  const [exclusion, setExclusion] = useState<Expression>(
    RuleDrafts.get(ruleKey)?.exclusion ?? initial?.exclusion ?? [],
  );
  const [saving, setSaving] = useState(false);

  // 2) При открытии — ещё раз синхронизировать с сейфом (на случай обновления initial извне)
  useEffect(() => {
    if (!open) {
      return;
    }
    const draft = RuleDrafts.get(ruleKey);
    if (draft) {
      setExpression(draft.expression?.length ? draft.expression : [[blankPredicate()]]);
      setExclusion(draft.exclusion ?? []);
    } else if (initial) {
      setExpression(initial.expression?.length ? initial.expression : [[blankPredicate()]]);
      setExclusion(initial.exclusion ?? []);
    } else {
      setExpression([[blankPredicate()]]);
      setExclusion([]);
    }
  }, [open, ruleKey, initial]);

  // 3) Автосохранение черновика для конкретного ruleKey
  useEffect(() => {
    const draft: AlgRuleValue = { expression, exclusion };
    RuleDrafts.set(ruleKey, draft);
  }, [ruleKey, expression, exclusion]);

  const errors = useMemo(() => validateRule(expression, exclusion), [expression, exclusion]);
  const isInvalid = errors.length > 0;

  function blankPredicate(): JsonPredicate {
    return { name: '', type: 'float', inversion: false, operator: '>=', value: '' };
  }

  // ... твои addAnd/addOr/removePredicate/updatePredicate — без изменений ...

  async function handleSave() {
    if (isInvalid) {
      toaster.push(
        <Message type="error" closable>
          Заполните обязательные поля: {errors.join('; ')}
        </Message>,
        { duration: 3000 },
      );
      return;
    }
    try {
      setSaving(true);
      const out: BuiltRule = { expression, exclusion };
      onSave(out);
      if (clearDraftOnSave) {
        RuleDrafts.delete(ruleKey); // очистить черновик только этого правила
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }
  function addAnd(groupIdx: number, isExclusion = false) {
    const set = isExclusion ? setExclusion : setExpression;
    const state = isExclusion ? exclusion : expression;
    const next = state.map((g, i) => (i === groupIdx ? [...g, blankPredicate()] : g));
    set(next);
  }

  function addOr(isExclusion = false) {
    const set = isExclusion ? setExclusion : setExpression;
    const state = isExclusion ? exclusion : expression;
    set([...state, [blankPredicate()]]);
  }

  function removePredicate(groupIdx: number, termIdx: number, isExclusion = false) {
    const set = isExclusion ? setExclusion : setExpression;
    const state = isExclusion ? exclusion : expression;
    const g = [...state[groupIdx]];
    g.splice(termIdx, 1);
    const next = [...state];
    // если группа опустела — удалим всю группу
    if (g.length === 0) {
      next.splice(groupIdx, 1);
    } else {
      next[groupIdx] = g;
    }
    set(next);
  }

  function updatePredicate<K extends keyof JsonPredicate>(
    groupIdx: number,
    termIdx: number,
    key: K,
    value: JsonPredicate[K],
    isExclusion = false,
  ) {
    const set = isExclusion ? setExclusion : setExpression;
    const state = isExclusion ? exclusion : expression;
    const next = state.map((g, gi) =>
      gi !== groupIdx
        ? g
        : g.map((p, pi) => {
            if (pi !== termIdx) {
              return p;
            }
            const updated: JsonPredicate = { ...p, [key]: value };
            // Бизнес-правила: если type=time → operator=between и value → маска A-B
            if (key === 'type') {
              if (value === 'time') {
                updated.operator = 'between';
                // если не похоже на диапазон, сбросим value
                if (!/^\d{2}:\d{2}:\d{2}-\d{2}:\d{2}:\d{2}$/.test(updated.value)) {
                  updated.value = '';
                }
              } else {
                // float — если был between, можно оставить, но чаще НЕ between
                if (updated.operator === 'between') {
                  updated.operator = '>=';
                  updated.value = '';
                }
              }
            }
            // Если operator сменился на between — обнулим value под диапазон
            if (key === 'operator' && value === 'between') {
              updated.value = '';
            }
            return updated;
          }),
    );
    set(next);
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" className="rb-modal">
      <Modal.Header>
        <Modal.Title>Конструктор правила</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* EXPRESSION */}
        <Section
          title="Expression"
          groups={expression}
          dicts={dicts}
          onAddAnd={(gi) => addAnd(gi, false)}
          onAddOr={() => addOr(false)}
          onRemove={(gi, ti) => removePredicate(gi, ti, false)}
          onChange={(gi, ti, key, val) => updatePredicate(gi, ti, key, val, false)}
        />

        <Divider />

        {/* EXCLUSION */}
        <Section
          title="Exclusion (опционально)"
          groups={exclusion}
          dicts={dicts}
          onAddAnd={(gi) => addAnd(gi, true)}
          onAddOr={() => addOr(true)}
          onRemove={(gi, ti) => removePredicate(gi, ti, true)}
          onChange={(gi, ti, key, val) => updatePredicate(gi, ti, key, val, true)}
        />

        {errors.length > 0 && (
          <div className="rb-errors">
            {errors.map((e, i) => (
              <div key={i} className="rb-error">
                {e}
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button appearance="subtle" onClick={onClose}>
          Отмена
        </Button>
        <Button appearance="primary" loading={saving} disabled={isInvalid} onClick={handleSave}>
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // ----- ниже — Section/PredicateRow/TimeRangeInput/validateRule без изменений -----
}

/* ---------- Подсекция: список OR-групп; внутри — AND-элементы ---------- */

function Section({
  title,
  groups,
  dicts,
  onAddAnd,
  onAddOr,
  onRemove,
  onChange,
}: {
  title: string;
  groups: Expression;
  dicts: RuleDictionaries;
  onAddAnd: (groupIdx: number) => void;
  onAddOr: () => void;
  onRemove: (groupIdx: number, termIdx: number) => void;
  onChange: <K extends keyof JsonPredicate>(
    groupIdx: number,
    termIdx: number,
    key: K,
    value: JsonPredicate[K],
  ) => void;
}) {
  return (
    <div className="rb-section">
      <h4>{title}</h4>
      {groups.map((andGroup, gi) => (
        <div key={gi} className="rb-or-group">
          <div className="rb-and-list">
            {andGroup.map((p, ti) => (
              <PredicateRow
                key={ti}
                pred={p}
                dicts={dicts}
                onChange={(k, v) => onChange(gi, ti, k, v)}
                onRemove={() => onRemove(gi, ti)}
              />
            ))}
            <IconButton
              size="sm"
              appearance="subtle"
              onClick={() => onAddAnd(gi)}
              title="Добавить AND"
              className="plus-and"
            >
              <Plus size={16} />
              &nbsp;AND
            </IconButton>
          </div>
          {gi < groups.length - 1 && <div className="rb-or-sep">OR</div>}
        </div>
      ))}
      <Button appearance="ghost" onClick={onAddOr} startIcon={<SquarePlus size={16} />}>
        Добавить OR-группу
      </Button>
    </div>
  );
}

/* ---------- Строка предиката ---------- */

function PredicateRow({
  pred,
  dicts,
  onChange,
  onRemove,
}: {
  pred: JsonPredicate;
  dicts: RuleDictionaries;
  onChange: <K extends keyof JsonPredicate>(key: K, value: JsonPredicate[K]) => void;
  onRemove: () => void;
}) {
  const ops = dicts.operatorsByType[pred.type];

  // для time — редактор диапазона "HH:MM:SS-HH:MM:SS"
  const isTime = pred.type === 'time';
  const isBetween = pred.operator === 'between';

  return (
    <div className="rb-row">
      {/* name */}
      <SelectPicker
        data={dicts.names.map((n) => ({ label: n, value: n }))}
        value={pred.name || undefined}
        onChange={(v) => onChange('name', v ?? '')}
        placeholder="name"
        style={{ width: 180 }}
        cleanable
        searchable
      />
      {/* type */}
      <SelectPicker
        data={dicts.valueTypes.map((t) => ({ label: t, value: t }))}
        value={pred.type}
        onChange={(v) => onChange('type', (v ?? 'float') as ValueType)}
        style={{ width: 120 }}
      />
      {/* operator */}
      <SelectPicker
        data={ops.map((o) => ({ label: o, value: o }))}
        value={pred.operator}
        onChange={(v) => onChange('operator', (v ?? ops[0]) as Operator)}
        style={{ width: 130 }}
        disabled={isTime} // по ТЗ для time — только between
      />

      {/* value */}
      {isTime && isBetween ? (
        <TimeRangeInput value={pred.value} onChange={(v) => onChange('value', v)} />
      ) : (
        <Input
          placeholder="value"
          value={pred.value}
          onChange={(v) => onChange('value', String(v))}
          style={{ width: 220 }}
        />
      )}

      {/* inversion */}
      <Checkbox checked={pred.inversion} onChange={(v, checked) => onChange('inversion', checked)}>
        NOT
      </Checkbox>

      <IconButton appearance="subtle" onClick={onRemove} title="Удалить предикат">
        <Trash2 size={16} />
      </IconButton>
    </div>
  );
}

/* ---------- Простой ввод диапазона времени ---------- */

function TimeRangeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // value в формате "HH:MM:SS-HH:MM:SS"
  const [a, b] = value.split('-');
  return (
    <div className="rb-time">
      <TimeInput
        value={a ?? ''}
        onChange={(v) => onChange(`${v || ''}-${b || ''}`)}
        placeholder="HH:MM:SS"
      />
      <span>—</span>
      <TimeInput
        value={b ?? ''}
        onChange={(v) => onChange(`${a || ''}-${v || ''}`)}
        placeholder="HH:MM:SS"
      />
    </div>
  );
}

function TimeInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(v) => {
        const s = String(v)
          .replace(/[^\d:]/g, '')
          .slice(0, 8);
        onChange(s);
      }}
      placeholder={placeholder}
      style={{ width: 120 }}
    />
  );
}

/* ---------- Валидация ---------- */

function validateRule(expr: Expression, excl: Expression): string[] {
  const errs: string[] = [];
  const checkGroup = (g: AndGroup, gi: number, kind: 'expr' | 'excl') => {
    if (g.length === 0) {
      errs.push(`${kind === 'expr' ? 'Expression' : 'Exclusion'}: пустая AND-группа #${gi + 1}`);
    }
    g.forEach((p, ti) => {
      if (!p.name) {
        errs.push(`Не заполнено name (группа ${gi + 1}, терм ${ti + 1})`);
      }
      if (!p.type) {
        errs.push(`Не заполнен type (группа ${gi + 1}, терм ${ti + 1})`);
      }
      if (!p.operator) {
        errs.push(`Не заполнен operator (группа ${gi + 1}, терм ${ti + 1})`);
      }
      if (!p.value) {
        errs.push(`Не заполнен value (группа ${gi + 1}, терм ${ti + 1})`);
      }

      if (p.type === 'time') {
        if (p.operator !== 'between') {
          errs.push(`Для типа time оператор всегда BETWEEN (группа ${gi + 1}, терм ${ti + 1})`);
        }
        if (p.value && !/^\d{2}:\d{2}:\d{2}-\d{2}:\d{2}:\d{2}$/.test(p.value)) {
          errs.push(
            `Некорректный формат времени HH:MM:SS-HH:MM:SS (группа ${gi + 1}, терм ${ti + 1})`,
          );
        } else if (p.value) {
          const [A, B] = p.value.split('-');
          if (!isTimeLt(A, B)) {
            errs.push(
              `Левая граница времени должна быть меньше правой (группа ${gi + 1}, терм ${ti + 1})`,
            );
          }
        }
      } else {
        // float
        if (p.operator === 'between') {
          // допустим и между числами "a-b"
          if (!/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(p.value)) {
            errs.push(
              `Для float BETWEEN ожидается "a-b" (числа) (группа ${gi + 1}, терм ${ti + 1})`,
            );
          } else {
            const [a, b] = p.value.split('-').map(Number);
            if (!(a < b)) {
              errs.push(
                `Для float BETWEEN левый операнд должен быть < правого (группа ${gi + 1}, терм ${ti + 1})`,
              );
            }
          }
        } else {
          if (!/^\d+(\.\d+)?$/.test(p.value)) {
            errs.push(`Для float ожидается число (группа ${gi + 1}, терм ${ti + 1})`);
          }
        }
      }
    });
  };

  if (expr.length === 0) {
    errs.push('Нужно задать хотя бы одну OR-группу в Expression');
  }
  expr.forEach((g, i) => checkGroup(g, i, 'expr'));
  excl.forEach((g, i) => checkGroup(g, i, 'excl'));
  return errs;
}

function isTimeLt(a: string, b: string) {
  const toSec = (s: string) => {
    const [hh, mm, ss] = s.split(':').map(Number);
    return hh * 3600 + mm * 60 + ss;
  };
  return toSec(a) < toSec(b);
}
