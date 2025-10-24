import { useEffect, useRef, useState } from 'react';
import { Input } from 'rsuite';

import { getCompletionsAt } from '@/shared/lang/completion';
import './inline-editable.scss';

type UiDiag = { from: number; to: number; message: string };

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
  const [errors /*, setErrors*/] = useState<UiDiag[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  async function refreshSuggestions() {
    const caret = ref.current?.selectionStart ?? draft.length;
    const s = await getCompletionsAt(draft, caret);
    setSuggestions(s.slice(0, 8));
    setSel(0);
    const focused = document.activeElement === ref.current;
    const atEnd = caret === draft.length;
    setSuggestionsOpen(Boolean(focused && atEnd && draft.trim().length && s.length));
  }

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  // валидация + подсказки

  const commit = () => {
    if (draft !== value) {
      onCommit(draft);
    }
    setEditing(false);
  };

  // рендер «прозрачного» текста + волнистых подчёркиваний
  const ghostHtml = buildGhostHtml(draft, errors);

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
    <div className={`ie-wrap ${className ?? ''}`}>
      {/* Призрачный слой с подчеркиванием ошибок */}
      <div className="ie-ghost" aria-hidden dangerouslySetInnerHTML={{ __html: ghostHtml }} />

      {/* Реальный инпут поверх — текст прозрачный, курсор виден */}
      <Input
        inputRef={ref}
        value={draft}
        placeholder={placeholder}
        onChange={(v) => {
          setDraft(String(v));
          requestAnimationFrame(refreshSuggestions);
        }}
        onFocus={() => {
          requestAnimationFrame(refreshSuggestions);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            setSuggestionsOpen(false);
            return;
          }
          if (suggestionsOpen && suggestions.length) {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, suggestions.length - 1));
              return;
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
              return;
            }
            if (e.key === 'Tab' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
              e.preventDefault();
              applySuggestion(suggestions[sel]);
              return;
            }
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
            setSuggestionsOpen(false);
          }
        }}
        className={`ie-input ${errors.length ? 'ie-invalid' : ''}`}
      />

      {editing && suggestionsOpen && suggestions.length > 0 && (
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

      {/* Первая ошибка текстом под полем (на случай доступности) */}
      {errors.length > 0 && <div className="ie-error-msg">{errors[0].message}</div>}
    </div>
  );

  function needsLeadingSpace(src: string, pos: number) {
    if (pos === 0) {
      return false;
    }
    const prev = src[pos - 1];
    // пробел не нужен после открывающих скобок/начала, или если уже есть пробел
    return !/\s|\(|\[\]\)|,/.test(prev);
  }

  function applySuggestion(token: string) {
    const el = ref.current!;
    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;

    // добавим ведущий пробел, если нужно, но без удвоений
    const lead = needsLeadingSpace(draft, start) ? ' ' : '';
    const inserted = lead + token;

    const next = draft.slice(0, start) + inserted + draft.slice(end);
    const caretNext = start + inserted.length;

    setDraft(next);

    // надёжная установка каретки — в следующий кадр
    requestAnimationFrame(() => {
      try {
        el.setSelectionRange(caretNext, caretNext);
        el.focus();
      } catch {
        /* empty */
      }
    });
  }
}

/* ---------- helpers ---------- */

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (ch) =>
    ch === '&'
      ? '&amp;'
      : ch === '<'
        ? '&lt;'
        : ch === '>'
          ? '&gt;'
          : ch === '"'
            ? '&quot;'
            : '&#39;',
  );
}

function buildGhostHtml(text: string, diags: { from: number; to: number }[]) {
  if (!diags.length || !text) {
    return escapeHtml(text);
  }
  // нормализуем диапазоны (объединяем пересечения)
  const ranges = mergeRanges(
    diags.map((d) => ({
      from: clamp(d.from, 0, text.length),
      to: clamp(d.to, 0, text.length),
    })),
  );
  let html = '';
  let cursor = 0;
  for (const r of ranges) {
    if (r.from > cursor) {
      html += escapeHtml(text.slice(cursor, r.from));
    }
    const frag = escapeHtml(text.slice(r.from, r.to || r.from + 1));
    html += `<span class="ie-squiggle">${frag || '&nbsp;'}</span>`;
    cursor = r.to;
  }
  if (cursor < text.length) {
    html += escapeHtml(text.slice(cursor));
  }
  return html;
}

function mergeRanges(ranges: { from: number; to: number }[]) {
  const arr = ranges.filter((r) => r.to > r.from).sort((a, b) => a.from - b.from || a.to - b.to);
  if (!arr.length) {
    return [];
  }
  const out: { from: number; to: number }[] = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    const prev = out[out.length - 1];
    const cur = arr[i];
    if (cur.from <= prev.to) {
      prev.to = Math.max(prev.to, cur.to);
    } else {
      out.push(cur);
    }
  }
  return out;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
