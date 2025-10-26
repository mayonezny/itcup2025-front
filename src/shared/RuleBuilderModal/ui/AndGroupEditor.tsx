// src/components/RuleBuilderModal/AndGroupEditor.tsx
import { Plus } from 'lucide-react';
import { Button, Divider } from 'rsuite';

import type { AndGroup, JsonPredicate } from '@/shared/lang/types';

import { PredicateRow } from './PredicateRow';
import './rule-builder-modal.scss';

type Props = {
  group: AndGroup;
  onChange: (next: AndGroup) => void;
  title?: string;
};

export function AndGroupEditor({ group, onChange, title }: Props) {
  const update = (idx: number, next: JsonPredicate) => {
    const copy = group.slice();
    copy[idx] = next;
    onChange(copy);
  };
  const remove = (idx: number) => onChange(group.filter((_, i) => i !== idx));
  const add = () =>
    onChange([
      ...group,
      { name: '', type: 'double', operator: '>=', value: '0', inversion: false },
    ]);

  return (
    <div className="rb-and">
      {title && (
        <>
          <Divider>
            <span className="rb-and-title">{title}</span>
          </Divider>
        </>
      )}

      {group.map((p, i) => (
        <PredicateRow key={i} value={p} onChange={(v) => update(i, v)} onDelete={() => remove(i)} />
      ))}

      <div className="rb-and-actions">
        <Button appearance="ghost" onClick={add} startIcon={<Plus size={16} />}>
          Добавить условие (AND)
        </Button>
      </div>
    </div>
  );
}
