import {
    Plus,
    SquareArrowDown,
    SquareArrowUp,
    SquareCheckBig,
    SquarePen,
    Trash2,
} from 'lucide-react';

import { useAppDispatch } from '@/redux-rtk/hooks';
import {
    addRule,
    changePriority,
    deleteRule,
    updateRule,
} from '@/redux-rtk/store/rules/rulesSlice';
import { InlineEditableRS } from '@/shared/InlineEditable';

import type { Rule as RuleElementProps } from '../types';

import './rule-element.scss';

import React from 'react';

type elemState = 'view' | 'edit' | 'new';

export const RuleElementHead = () => (
  <div className="head rule-element">
    <button className="num" title="Приоритет">
      #
    </button>
    <div className="rule">Правило</div>
    <div className="type">Тип</div>
    <div className="delete-icon" />
    <div className="edit-icon" />
    <div className="edit-icon" />
    <div className="priorities-icons" />
  </div>
);

export const RuleElement: React.FC<
  RuleElementProps & {
    isEditable?: boolean;
    isNew?: boolean;
    state?: elemState;
  }
> = ({ id, rule, priority, type, isEditable, isNew, state = 'view' }) => {
  const dispatch = useAppDispatch();
  const [elemState, setElemState] = React.useState<elemState>(state);
  const [editableState, setEditableState] = React.useState(isEditable || false);

  const [ruleState, setRuleState] = React.useState(rule);

  const clearInputs = () => {
    setRuleState('');
  };

  const handleAdd = () => {
    dispatch(addRule({ rule: ruleState, priority, type }));
    setElemState('new');
    clearInputs();
  };
  const handleUpdate = () => {
    dispatch(updateRule({ id, changes: { rule: ruleState } }));
    setEditableState(false);
  };

  const handlePriorityUp = () => {
    dispatch(changePriority({ id, priority: priority - 1 }));
  };

  const handlePriorityDown = () => {
    dispatch(changePriority({ id, priority: priority + 1 }));
  };

  const handleDelete = () => {
    dispatch(deleteRule({ id }));
  };

  const handleActivateEditing = () => {
    setEditableState(true);
  };

  return elemState === 'view' ? (
    <div className="rule-element">
      <div className="num">{priority}</div>
      <div className="rule" onClick={() => setEditableState(true)}>
        <InlineEditableRS
          value={ruleState}
          onCommit={(v) => setRuleState(v)}
          onClick={handleActivateEditing}
          isEditing={editableState}
        />
      </div>
      <div className="type">{type}</div>
      <div className="rule-element-icons">
        {!editableState && (
          <div className="priorities-icons">
            <button onClick={handlePriorityUp} title="Повысить приоритет">
              <SquareArrowUp />
            </button>
            <button onClick={handlePriorityDown} title="Понизить приоритет">
              <SquareArrowDown />
            </button>
          </div>
        )}

        <button className="delete-icon" onClick={handleDelete} title="Удалить правило">
          <Trash2 />
        </button>
        {!editableState && elemState === 'view' && (
          <button
            className="edit-icon"
            onClick={() => setEditableState(true)}
            title="Редактировать правило"
          >
            <SquarePen />
          </button>
        )}
        {editableState && (
          <button
            className="confirm edit-icon"
            onClick={isNew ? handleAdd : handleUpdate}
            title="Подтвердить редактирование"
          >
            <SquareCheckBig />
          </button>
        )}
      </div>
    </div>
  ) : (
    <div className="add rule-element" onClick={() => setElemState('view')}>
      <Plus size={28} strokeWidth={3} /> Добавить правило
    </div>
  );
};
