import React from 'react';

import { RuleElement, RuleElementHead } from '@/components/RuleElement';
import { LinedText } from '@/shared/LinedText';

import { useRuleTable } from '../api';

import './rule-table.scss';

export const RuleTable = () => {
  const { rules } = useRuleTable();
  return (
    <div className="rule-table">
      <h1 id="rules">Текущие правила:</h1>
      <RuleElementHead />
      {rules.length === 0 ? (
        <div className="norules">
          <img src="/not-for-production.jpg" width={320} height={320} />
          <h2>На данный момент никаких правил не задано {':(('}</h2>
        </div>
      ) : (
        rules.map((row, i) =>
          row.is_active ? (
            <React.Fragment key={row.id}>
              <RuleElement {...row} />
              {i < rules.length - 1 && <LinedText As="h4">AND</LinedText>}
            </React.Fragment>
          ) : null,
        )
      )}
      <RuleElement
        isEditable
        isNew
        state={'new'}
        id={rules ? rules.length + 1 : 0}
        priority={1}
        is_active={true}
        filter_type={'alg'}
        action={''}
        rule_value={{
          expression: [
            [
              { name: 'amount', type: 'string', inversion: false, operator: '>', value: '10.0' },
              {
                name: 'timestamp',
                type: 'timestamp',
                inversion: true,
                operator: 'between',
                value: '00:00:00-12:00:00',
              },
            ],
          ],
          exclusion: [],
        }}
      />
    </div>
  );
};
