// src/features/rules/ui/RuleValueEditor.tsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { FilterType, RuleValue } from '@/features/rules/types';
import type { BuiltMlRule, BuiltRule } from '@/shared/lang/types';

type Props = {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>; // теперь можно передавать input
  filterType: FilterType;
  valueText: string; // <- строковый JSON из инпута
  onApplyText: (jsonText: string) => void; // вернём строку, чтобы сохранить в инпут и в стейт
  onClose: () => void;
};

export function PopupEditor({
  open,
  anchorRef,
  filterType,
  valueText,
  onApplyText,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 360,
  });

  // синхронизируем редактор с тем, что в инпуте
  useEffect(() => {
    if (!open) {
      return;
    }
    setDraft(valueText || '');
    setErr(null);
  }, [open, valueText]);

  // позиционирование — фиксированное
  const place = () => {
    const r = anchorRef.current?.getBoundingClientRect();
    if (!r) {
      return;
    }
    setPos({
      top: Math.round(r.bottom - r.height - 250),
      left: Math.round(r.left),
      width: Math.max(360, Math.round(r.width)),
    });
  };
  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    place();
    const onScroll = () => place();
    const onResize = () => place();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  // клик снаружи — закрываем
  useEffect(() => {
    if (!open) {
      return;
    }
    const onDown = (e: MouseEvent) => {
      const p = panelRef.current;
      const a = anchorRef.current;
      if (p && !p.contains(e.target as Node) && a && !a.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const style: React.CSSProperties = {
    position: 'absolute',
    top: pos.top,
    left: pos.left,
    width: pos.width,
    zIndex: 1000,
  };

  const insertTemplate = () => {
    setDraft(JSON.stringify(filterType === 'alg' ? algTemplate() : mlTemplate(), null, 2));
    setErr(null);
  };

  const apply = () => {
    try {
      // проверим, что это валидный JSON
      JSON.parse(draft) as RuleValue;
      onApplyText(draft);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  return createPortal(
    <div ref={panelRef} className="rv-editor" style={style}>
      <div className="rv-editor__head">
        <strong>{filterType.toUpperCase()} JSON</strong>
        <button className="btn btn--ghost" onClick={insertTemplate} style={{ marginLeft: 'auto' }}>
          Вставить шаблон
        </button>
      </div>
      <textarea
        className="rv-editor__area"
        spellCheck={false}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      {err && <div className="rv-editor__err">{err}</div>}
      <div className="rv-editor__actions">
        <button className="btn btn--ghost" onClick={onClose}>
          Отмена
        </button>
        <button className="btn btn--primary" onClick={apply}>
          Применить
        </button>
      </div>
    </div>,
    document.body,
  );
}

/* шаблоны */
function algTemplate(): BuiltRule {
  return {
    expression: [
      [
        { name: 'amount', type: 'float', inversion: false, operator: '>', value: '10.0' },
        {
          name: 'timestamp',
          type: 'time',
          inversion: true,
          operator: 'between',
          value: '00:00:00-12:00:00',
        },
      ],
    ],
    exclusion: [],
  };
}
function mlTemplate(): BuiltMlRule {
  return {
    ruleId: 'ml_rule_low_risk',
    name: 'Низкий риск',
    description: 'Вероятность мошенничества ниже 0.45 — транзакция не фрод',
    modelConfig: { modelName: 'fraud_model_v1.pkl', inputFeatures: ['timestamp', 'amount'] },
    riskRange: { min: 0.0, max: 0.45, maxInclusive: false },
  };
}
