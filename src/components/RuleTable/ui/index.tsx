import { RuleElement, RuleElementHead, type RuleElementProps } from '@/components/RuleElement';
import './rule-table.scss';

export const RuleTable = ({ rows }: { rows: RuleElementProps[] }) => (
  <div className="rule-table">
    <h1>Текущие правила:</h1>
    <RuleElementHead />
    {rows.map((row: RuleElementProps) => (
      <RuleElement key={row.id} {...row} />
    ))}
  </div>
);
