import {
    RuleElement,
    RuleElementHead,
    type Rule as RuleElementProps,
} from '@/components/RuleElement';

import { useRuleTable } from '../api';

import './rule-table.scss';

export const RuleTable = () => {
  const { rules } = useRuleTable();
  return (
    <div className="rule-table">
      <h1>Текущие правила:</h1>
      <RuleElementHead />
      {rules.length > 0 ? (
        rules.map((row: RuleElementProps) => <RuleElement key={row.id} {...row} />)
      ) : (
        <div className="norules">
          <img src="/not-for-production.jpg" width={320} height={320} />
          <h2>На данный момент никаких правил не задано {':(('}</h2>
        </div>
      )}
      <RuleElement
        isEditable
        isNew
        state={'new'}
        id={rules.length + 1}
        name={''}
        rule={''}
        type={'Composite'}
      />
    </div>
  );
};
