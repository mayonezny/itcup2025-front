import React from 'react';

import { RuleElement, RuleElementHead } from '@/components/RuleElement';
import { LinedText } from '@/shared/LinedText';

import { useRuleTable } from '../api';

import './rule-table.scss';

export const RuleTable = () => {
  const { rules } = useRuleTable();
  return (
    <div className="rule-table">
      <h1>Текущие правила:</h1>
      <RuleElementHead />
      {rules.length === 0 ? (
        <div className="norules">
          <img src="/not-for-production.jpg" width={320} height={320} />
          <h2>На данный момент никаких правил не задано {':(('}</h2>
        </div>
      ) : (
        rules.map((row, i) => (
          <React.Fragment key={row.id}>
            <RuleElement {...row} />
            {i < rules.length - 1 && <LinedText As="h4">AND</LinedText>}
          </React.Fragment>
        ))
      )}

      <RuleElement
        isEditable
        isNew
        state={'new'}
        id={rules.length + 1}
        rule={''}
        priority={0}
        type={'Composite'}
      />
    </div>
  );
};
