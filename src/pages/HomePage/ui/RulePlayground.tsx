import { useEffect, useState } from 'react';
import { Button, Panel } from 'rsuite';

import { InlineEditableRS } from '@/shared/InlineEditable/ui';
import { parseRuleToJson, validateRule } from '@/shared/lang/api';

export function RulePlayground() {
  const [expr, setExpr] = useState(
    '(COUNT >= 50000 AND TIME BETWEEN [00:00:00, 12:30:00]) OR (COUNT <= 500)',
  );
  const [excl, setExcl] = useState('TIME NOT BETWEEN [00:00:00, 06:00:00]');
  const [errors, setErrors] = useState<string[]>([]);
  const [json, setJson] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  // валидируем expression на лету
  useEffect(() => {
    let keep = true;
    (async () => {
      const diags = await validateRule(expr);
      if (!keep) {
        return;
      }
      setErrors(diags.filter((d) => d.severity === 'error').map((d) => d.message));
    })();
    return () => {
      keep = false;
    };
  }, [expr]);

  const hasErrors = errors.length > 0;

  const build = async () => {
    setLoading(true);
    try {
      const out = await parseRuleToJson(expr, excl);
      setJson(out);
    } catch (e: unknown) {
      setJson({
        error:
          typeof e === 'object' && e !== null && 'message' in e
            ? (e as { message: string }).message
            : String(e),
      });
    } finally {
      setLoading(false);
    }
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
        {hasErrors && <div style={{ color: '#dc2626', marginTop: 8 }}>{errors[0]}</div>}
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

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
