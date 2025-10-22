import { useEffect, useRef, useState } from 'react';
import { Input } from 'rsuite';
import './inline-editable.scss';

import { validateRule } from '@/shared/lang/api';
import { getCompletionsAt } from '@/shared/lang/completion';

export function InlineEditableRS({
  value,
  onCommit,
  placeholder = '—',
  className,
  onClick,
  isEditing,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  className?: string;
  onClick: () => void;
  isEditing?: boolean;
}) {
  const [editing, setEditing] = useState(isEditing);
  const [draft, setDraft] = useState(value);
  const [errors, setErrors] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sel, setSel] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  // валидация + подсказки с дебаунсом
  useEffect(() => {
    if (!editing) {
      return;
    }
    if (timer.current) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(async () => {
      const diags = await validateRule(draft);
      setErrors(diags.filter((d) => d.severity === 'error').map((d) => d.message));

      const caret = ref.current?.selectionStart ?? draft.length;
      const s = await getCompletionsAt(draft, caret);
      setSuggestions(s.slice(0, 8));
      setSel(0);
    }, 180);
    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
    };
  }, [draft, editing]);

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

  const applySuggestion = (s: string) => {
    const el = ref.current!;
    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;
    const nd = draft.slice(0, start) + s + draft.slice(end);
    setDraft(nd);
    // вернуть каретку
    setTimeout(() => {
      const pos = start + s.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const invalid = errors.length > 0;

  return (
    <div className="ie-wrap" style={{ position: 'relative' }}>
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
          if (suggestions.length) {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, suggestions.length - 1));
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            }
            if (e.key === 'Tab') {
              e.preventDefault();
              applySuggestion(suggestions[sel]);
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              applySuggestion(suggestions[sel]);
            }
          }
        }}
        className={`${className ?? ''} ${invalid ? 'ie-invalid' : ''}`}
      />
      {invalid && <div style={{ color: '#dc2626', marginTop: 6, fontSize: 12 }}>{errors[0]}</div>}
      {editing && suggestions.length > 0 && (
        <ul className="ie-suggest">
          {suggestions.map((s, i) => (
            <li
              key={`${s}-${i}`}
              className={i === sel ? 'active' : ''}
              onMouseDown={(e) => {
                e.preventDefault();
                applySuggestion(s);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
