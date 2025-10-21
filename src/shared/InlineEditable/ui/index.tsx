import { useEffect, useRef, useState } from 'react';
import { Input } from 'rsuite';
import './inline-editable.scss';

export function InlineEditableRS({
  value,
  onCommit,
  placeholder = '—',
  className,
  onClick,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  className?: string;
  onClick: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  const commit = () => {
    if (draft !== value) {
      onCommit(draft);
    }
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        type="button"
        className={`${className ?? ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
          onClick();
        }}
        title="Нажмите, чтобы изменить"
      >
        {value || placeholder}
      </button>
    );
  }

  return (
    <Input
      inputRef={ref}
      value={draft}
      placeholder={placeholder}
      onChange={(v) => setDraft(String(v))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        }
      }}
      className={className}
    />
  );
}
