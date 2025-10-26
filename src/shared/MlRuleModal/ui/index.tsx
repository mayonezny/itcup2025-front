// src/shared/MlRuleModal/ui/index.tsx
import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Input, InputNumber, Message, Modal, TagPicker, toaster } from 'rsuite';

import { MlRuleDrafts, type MlRule } from '@/shared/ml-rule-drafts';
import './ml-rule-modal.scss';

// ✅ добавь утилиту нормализации
function normalizeInitial(initial?: Partial<MlRule>): MlRule {
  return {
    rule_id: initial?.rule_id ?? '',
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    model_config: {
      model_name: initial?.model_config?.model_name ?? '',
      input_features: Array.isArray(initial?.model_config?.input_features)
        ? initial!.model_config!.input_features
        : [],
    },
    risk_range: {
      min: typeof initial?.risk_range?.min === 'number' ? initial!.risk_range!.min : 0,
      max: typeof initial?.risk_range?.max === 'number' ? initial!.risk_range!.max : 0.5,
      max_inclusive: Boolean(initial?.risk_range?.max_inclusive),
    },
  };
}

export function MlRuleModal({
  open,
  onClose,
  initial,
  availableFeatures,
  onSave,
  ruleKey,
  clearDraftOnSave = false,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<MlRule>;
  availableFeatures: string[];
  onSave: (rule: MlRule) => void;
  ruleKey: string;
  clearDraftOnSave?: boolean;
}) {
  // ✅ нормализуем initial один раз
  const base = normalizeInitial(initial);
  const draft = MlRuleDrafts.get(ruleKey);

  // ✅ посев из draft > base
  const [rule_id, setRuleId] = useState(draft?.rule_id ?? base.rule_id);
  const [name, setName] = useState(draft?.name ?? base.name);
  const [description, setDescription] = useState(draft?.description ?? base.description);
  const [model_name, setModelName] = useState(
    draft?.model_config?.model_name ?? base.model_config.model_name,
  );
  const [features, setFeatures] = useState<string[]>(
    draft?.model_config?.input_features ?? base.model_config.input_features,
  );
  const [min, setMin] = useState<number>(draft?.risk_range?.min ?? base.risk_range.min);
  const [max, setMax] = useState<number>(draft?.risk_range?.max ?? base.risk_range.max);
  const [maxIncl, setMaxIncl] = useState<boolean>(
    draft?.risk_range?.max_inclusive ?? base.risk_range.max_inclusive,
  );
  const [saving, setSaving] = useState(false);

  // ✅ при открытии — ресинк также через normalizeInitial
  useEffect(() => {
    if (!open) {
      return;
    }
    const d = MlRuleDrafts.get(ruleKey);
    const b = normalizeInitial(initial);
    setRuleId(d?.rule_id ?? b.rule_id);
    setName(d?.name ?? b.name);
    setDescription(d?.description ?? b.description);
    setModelName(d?.model_config?.model_name ?? b.model_config.model_name);
    setFeatures(d?.model_config?.input_features ?? b.model_config.input_features);
    setMin(d?.risk_range?.min ?? b.risk_range.min);
    setMax(d?.risk_range?.max ?? b.risk_range.max);
    setMaxIncl(d?.risk_range?.max_inclusive ?? b.risk_range.max_inclusive);
  }, [open, ruleKey, initial]);

  // автосохранение конкретного ruleKey
  useEffect(() => {
    MlRuleDrafts.set(ruleKey, {
      rule_id,
      name,
      description,
      model_config: { model_name, input_features: features },
      risk_range: { min, max, max_inclusive: maxIncl },
    });
  }, [ruleKey, rule_id, name, description, model_name, features, min, max, maxIncl]);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!rule_id.trim()) {
      e.push('rule_id обязателен');
    }
    if (!name.trim()) {
      e.push('name обязателен');
    }
    if (!model_name.trim()) {
      e.push('model_name обязателен');
    }
    if (min < 0 || min > 1) {
      e.push('risk.min в [0..1]');
    }
    if (max < 0 || max > 1) {
      e.push('risk.max в [0..1]');
    }
    if (!(min < max)) {
      e.push('risk.min должен быть < risk.max');
    }
    return e;
  }, [rule_id, name, model_name, min, max]);

  const save = () => {
    if (errors.length) {
      toaster.push(
        <Message type="error" closable>
          {errors.join('; ')}
        </Message>,
        { duration: 3000 },
      );
      return;
    }
    setSaving(true);
    try {
      const out: MlRule = {
        rule_id: rule_id.trim(),
        name: name.trim(),
        description: description.trim(),
        model_config: { model_name: model_name.trim(), input_features: features },
        risk_range: { min, max, max_inclusive: maxIncl },
      };
      onSave(out);
      if (clearDraftOnSave) {
        MlRuleDrafts.delete(ruleKey);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const featureOptions = availableFeatures.map((f) => ({ label: f, value: f }));

  return (
    <Modal open={open} onClose={onClose} size="md" className="ml-modal">
      <Modal.Header>
        <Modal.Title>Конструктор ML-правила</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="ml-form">
          <label>rule_id</label>
          <Input value={rule_id} onChange={(v) => setRuleId(String(v))} />

          <label>name</label>
          <Input value={name} onChange={(v) => setName(String(v))} />

          <label>description</label>
          <Input
            as="textarea"
            rows={3}
            value={description}
            onChange={(v) => setDescription(String(v))}
          />

          <label>model_name</label>
          <Input value={model_name} onChange={(v) => setModelName(String(v))} />

          <label>input_features</label>
          <TagPicker
            data={featureOptions}
            value={features}
            onChange={(vals) => setFeatures((vals ?? []) as string[])}
            block
          />

          <div className="ml-range">
            <div>
              <label>risk.min</label>
              <InputNumber
                step={0.1}
                min={0}
                max={1}
                value={min}
                onChange={(v) => setMin(Number(v ?? 0))}
              />
            </div>
            <div>
              <label>risk.max</label>
              <InputNumber
                step={0.1}
                min={0}
                max={1}
                value={max}
                onChange={(v) => setMax(Number(v ?? 0))}
              />
            </div>
            <div className="ml-range__incl">
              <Checkbox checked={maxIncl} onChange={(_, c) => setMaxIncl(c)}>
                max_inclusive
              </Checkbox>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="ml-errors">
              {errors.map((e, i) => (
                <div key={i} className="ml-error">
                  {e}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button appearance="subtle" onClick={onClose}>
          Отмена
        </Button>
        <Button appearance="primary" loading={saving} onClick={save}>
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
