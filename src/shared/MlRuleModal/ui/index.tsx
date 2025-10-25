// src/shared/MlRuleModal/ui/index.tsx
import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Input, InputNumber, Message, Modal, TagPicker, toaster } from 'rsuite';

import { MlRuleDrafts, type MlRule } from '@/shared/ml-rule-drafts';
import './ml-rule-modal.scss';

// ✅ добавь утилиту нормализации
function normalizeInitial(initial?: Partial<MlRule>): MlRule {
  return {
    ruleId: initial?.ruleId ?? '',
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    modelConfig: {
      modelName: initial?.modelConfig?.modelName ?? '',
      inputFeatures: Array.isArray(initial?.modelConfig?.inputFeatures)
        ? initial!.modelConfig!.inputFeatures
        : [],
    },
    riskRange: {
      min: typeof initial?.riskRange?.min === 'number' ? initial!.riskRange!.min : 0,
      max: typeof initial?.riskRange?.max === 'number' ? initial!.riskRange!.max : 0.5,
      maxInclusive: Boolean(initial?.riskRange?.maxInclusive),
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
  const [ruleId, setRuleId] = useState(draft?.ruleId ?? base.ruleId);
  const [name, setName] = useState(draft?.name ?? base.name);
  const [description, setDescription] = useState(draft?.description ?? base.description);
  const [modelName, setModelName] = useState(
    draft?.modelConfig?.modelName ?? base.modelConfig.modelName,
  );
  const [features, setFeatures] = useState<string[]>(
    draft?.modelConfig?.inputFeatures ?? base.modelConfig.inputFeatures,
  );
  const [min, setMin] = useState<number>(draft?.riskRange?.min ?? base.riskRange.min);
  const [max, setMax] = useState<number>(draft?.riskRange?.max ?? base.riskRange.max);
  const [maxIncl, setMaxIncl] = useState<boolean>(
    draft?.riskRange?.maxInclusive ?? base.riskRange.maxInclusive,
  );
  const [saving, setSaving] = useState(false);

  // ✅ при открытии — ресинк также через normalizeInitial
  useEffect(() => {
    if (!open) {
      return;
    }
    const d = MlRuleDrafts.get(ruleKey);
    const b = normalizeInitial(initial);
    setRuleId(d?.ruleId ?? b.ruleId);
    setName(d?.name ?? b.name);
    setDescription(d?.description ?? b.description);
    setModelName(d?.modelConfig?.modelName ?? b.modelConfig.modelName);
    setFeatures(d?.modelConfig?.inputFeatures ?? b.modelConfig.inputFeatures);
    setMin(d?.riskRange?.min ?? b.riskRange.min);
    setMax(d?.riskRange?.max ?? b.riskRange.max);
    setMaxIncl(d?.riskRange?.maxInclusive ?? b.riskRange.maxInclusive);
  }, [open, ruleKey, initial]);

  // автосохранение конкретного ruleKey
  useEffect(() => {
    MlRuleDrafts.set(ruleKey, {
      ruleId,
      name,
      description,
      modelConfig: { modelName, inputFeatures: features },
      riskRange: { min, max, maxInclusive: maxIncl },
    });
  }, [ruleKey, ruleId, name, description, modelName, features, min, max, maxIncl]);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!ruleId.trim()) {
      e.push('rule_id обязателен');
    }
    if (!name.trim()) {
      e.push('name обязателен');
    }
    if (!modelName.trim()) {
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
  }, [ruleId, name, modelName, min, max]);

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
        ruleId: ruleId.trim(),
        name: name.trim(),
        description: description.trim(),
        modelConfig: { modelName: modelName.trim(), inputFeatures: features },
        riskRange: { min, max, maxInclusive: maxIncl },
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
          <Input value={ruleId} onChange={(v) => setRuleId(String(v))} />

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
          <Input value={modelName} onChange={(v) => setModelName(String(v))} />

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
