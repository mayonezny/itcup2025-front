import { useState } from 'react';
import { Button, Panel } from 'rsuite';

import { InlineEditableRS } from '@/shared/InlineEditable/ui';
import { buildRules, type Diagnostic } from '@/shared/lang/api';

export function RulePlayground() {
  const [expr, setExpr] = useState(
    '(COUNT >= 50000 AND TIME BETWEEN [00:00:00, 12:30:00]) OR (COUNT <= 500)',
  );
  const [excl, setExcl] = useState('TIME NOT BETWEEN [00:00:00, 06:00:00]');
  const [errors, setErrors] = useState<Diagnostic[]>([]);
  const [json, setJson] = useState<unknown>();
  const [loading, setLoading] = useState(false);

  const build = async () => {
    setLoading(true);
    const res = await buildRules(expr, excl);
    if (res.ok) {
      setJson(res.json);
      setErrors([]);
    } else {
      setJson(undefined);
      setErrors(res.errors);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 980, margin: '40px auto', display: 'grid', gap: 16 }}>
      <h2>Fraud Rules Playground</h2>

      <Panel bordered header="Expression">
        <InlineEditableRS
          value={expr}
          onCommit={setExpr}
          placeholder="Введите правило…"
          className="w-full"
          onClick={() => {}}
          isEditing
        />
      </Panel>

      <Panel bordered header="Exclusion (опционально)">
        <InlineEditableRS
          value={excl}
          onCommit={setExcl}
          placeholder="Введите исключение…"
          className="w-full"
          onClick={() => {}}
          isEditing
        />
      </Panel>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {errors.length > 0 && (
          <div style={{ color: '#dc2626', fontSize: 13 }}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errors.map((e, i) => (
                <li key={i} style={{ color: '#dc2626', fontSize: 13, lineHeight: 1.35 }}>
                  {e.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button appearance="primary" onClick={build} loading={loading}>
          Собрать JSON
        </Button>
      </div>

      <Panel bordered header="Результат">
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {json ? JSON.stringify(json, null, 2) : 'Нажми «Собрать JSON»'}
        </pre>
      </Panel>
    </div>
  );
}
