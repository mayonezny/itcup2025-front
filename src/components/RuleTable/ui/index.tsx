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
        <div>Правил нет</div>
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
