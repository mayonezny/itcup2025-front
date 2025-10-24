// src/shared/lang/pretty.ts
type Pred = {
  name: string; // 'count' | 'time' | ...
  type: 'float' | 'time';
  inversion: boolean; // NOT
  operator: '>=' | '>' | '<=' | '<' | '=' | 'between';
  value: string; // '5000.0' | '00:00:00-12:30:00'
};

export function ruleJsonToText(rule: { expression: Pred[][]; exclusion: Pred[][] }): {
  expression: string;
  exclusion: string;
} {
  const expr = groupsToText(rule.expression);
  const excl = groupsToText(rule.exclusion);
  return { expression: expr, exclusion: excl };
}

function groupsToText(groups: Pred[][]): string {
  if (!groups?.length) {
    return '';
  }
  const chunks = groups.map(andGroupToText).filter(Boolean);
  return chunks.length === 1 ? chunks[0] : chunks.map((s) => `(${s})`).join(' OR ');
}

function andGroupToText(preds: Pred[]): string {
  return preds
    .map((p) => predToText(p))
    .filter(Boolean)
    .join(' AND ');
}

function predToText(p: Pred): string {
  const NAME = p.name.toUpperCase();
  if (p.operator === 'between') {
    const [a, b] = p.value.split('-');
    return `${NAME} ${p.inversion ? 'NOT ' : ''}BETWEEN [${a}, ${b}]`;
  }
  return `${NAME} ${p.operator} ${p.type === 'float' ? p.value : p.value}`;
}
