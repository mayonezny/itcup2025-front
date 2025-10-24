// src/components/RuleBuilderModal/PredicateRow.tsx
import { Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Checkbox, IconButton, Input, InputGroup, SelectPicker, Tooltip, Whisper } from 'rsuite';

import type { JsonPredicate, Operator, ValueType } from '@/shared/lang/types';

import './rule-builder-modal.scss';

const TYPE_OPTIONS: { label: string; value: ValueType }[] = [
  { label: 'float', value: 'float' },
  { label: 'time', value: 'time' },
];

const OP_OPTIONS_BASE: Operator[] = ['>=', '>', '<=', '<', '=', 'between'];

type Props = {
  value: JsonPredicate;
  onChange: (next: JsonPredicate) => void;
  onDelete: () => void;
};

export function PredicateRow({ value, onChange, onDelete }: Props) {
  const opOptions = useMemo(
    () =>
      // для time разрешаем только between и равенство? — оставим все, но подправим UX
      OP_OPTIONS_BASE.map((o) => ({ label: o, value: o })),
    [],
  );

  const [from, to] = value.operator === 'between' ? value.value.split('-') : [value.value, ''];

  return (
    <div className="rb-row">
      {/* name */}
      <Input
        className="rb-cell rb-name"
        placeholder="name"
        value={value.name}
        onChange={(v) => onChange({ ...value, name: String(v) })}
      />

      {/* type */}
      <SelectPicker
        className="rb-cell"
        cleanable={false}
        data={TYPE_OPTIONS}
        placeholder="type"
        value={value.type}
        onChange={(v) => {
          const nextType = (v ?? 'float') as ValueType;
          const nextOp = nextType === 'time' ? 'between' : value.operator;
          const nextVal =
            nextType === 'time'
              ? value.operator === 'between'
                ? value.value
                : '00:00:00-12:00:00'
              : value.operator === 'between'
                ? '0-1'
                : value.value || '0';
          onChange({ ...value, type: nextType, operator: nextOp, value: nextVal });
        }}
        searchable={false}
        style={{ width: 120 }}
      />

      {/* operator */}
      <SelectPicker
        className="rb-cell"
        cleanable={false}
        data={opOptions}
        placeholder="operator"
        value={value.operator}
        disabled={value.type === 'time'} // time → только between
        onChange={(v) => {
          const nextOp = (v ?? '>=') as Operator;
          const nextVal =
            nextOp === 'between'
              ? value.type === 'time'
                ? '00:00:00-12:00:00'
                : '0-1'
              : value.type === 'time'
                ? '00:00:00'
                : '0';
          onChange({ ...value, operator: nextOp, value: nextVal });
        }}
        searchable={false}
        style={{ width: 120 }}
      />

      {/* value */}
      {value.operator === 'between' ? (
        <InputGroup className="rb-cell rb-value">
          <Input
            value={from ?? ''}
            onChange={(v) => onChange({ ...value, value: `${v}-${to ?? ''}` })}
            placeholder={value.type === 'time' ? 'HH:MM:SS' : 'from'}
          />
          <InputGroup.Addon>—</InputGroup.Addon>
          <Input
            value={to ?? ''}
            onChange={(v) => onChange({ ...value, value: `${from ?? ''}-${v}` })}
            placeholder={value.type === 'time' ? 'HH:MM:SS' : 'to'}
          />
        </InputGroup>
      ) : (
        <Input
          className="rb-cell rb-value"
          value={value.value}
          onChange={(v) => onChange({ ...value, value: String(v) })}
          placeholder={value.type === 'time' ? 'HH:MM:SS' : 'value'}
        />
      )}

      {/* inversion */}
      <Checkbox
        className="rb-cell rb-inversion"
        checked={value.inversion}
        onChange={(checked) => onChange({ ...value, inversion: Boolean(checked) })}
      >
        NOT
      </Checkbox>

      {/* delete */}
      <Whisper placement="top" trigger="hover" speaker={<Tooltip>Удалить предикат</Tooltip>}>
        <IconButton
          className="rb-cell"
          onClick={onDelete}
          appearance="subtle"
          icon={<Trash2 size={18} />}
        />
      </Whisper>
    </div>
  );
}
