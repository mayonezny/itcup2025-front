// src/components/RuleBuilderModal/ExpressionSection.tsx
import { Button } from 'rsuite';

import type { AndGroup, Expression } from '@/shared/lang/types';

import { AndGroupEditor } from './AndGroupEditor';

type Props = {
  label: string;
  section: Expression;
  onChange: (next: Expression) => void;
  optional?: boolean;
};

export function ExpressionSection({ label, section, onChange, optional }: Props) {
  const updateGroup = (idx: number, next: AndGroup) => {
    const copy = section.slice();
    copy[idx] = next;
    onChange(copy);
  };
  const addOrGroup = () => onChange([...section, []]);
  const removeEmptyTails = () => onChange(section.filter((g) => g.length > 0));

  return (
    <section className="rb-section">
      <h4 className="rb-section-title">
        {label} {optional && <span className="rb-optional">(опционально)</span>}
      </h4>

      {section.map((g, i) => (
        <div key={i} className="rb-or">
          <AndGroupEditor
            group={g}
            onChange={(next) => updateGroup(i, next)}
            title={i === 0 ? undefined : 'AND'}
          />
          {i < section.length - 1 && <div className="rb-or-sep">OR</div>}
        </div>
      ))}

      <div className="rb-or-actions">
        <Button appearance="link" onClick={addOrGroup}>
          Добавить OR-группу
        </Button>
        <Button appearance="subtle" onClick={removeEmptyTails}>
          Удалить пустые группы
        </Button>
      </div>
    </section>
  );
}
