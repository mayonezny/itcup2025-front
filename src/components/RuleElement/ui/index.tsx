import { SquareCheckBig, SquarePen, Trash2 } from 'lucide-react';

import { useAppDispatch } from '@/redux-rtk/hooks';
import { addRule, deleteRule, updateRule } from '@/redux-rtk/store/rules/rulesSlice';
import { InlineEditableRS } from '@/shared/InlineEditable';

import type { Rule as RuleElementProps } from '../types';

import './rule-element.scss';

import React from 'react';

type elemState = 'view' | 'edit' | 'new';

export const RuleElementHead = () => (
  <div className="head rule-element">
    <div className="num">#</div>
    <div className="name">Имя правила</div>
    <div className="rule">Правило</div>
    <div className="type">Тип</div>
    <div className="delete-icon" />
    <div className="edit-icon" />
    <div className="edit-icon" />
    <div className="edit-icon" />
  </div>
);

export const RuleElement: React.FC<
  RuleElementProps & {
    isEditable?: boolean;
    isNew?: boolean;
    state?: elemState;
  }
> = ({ id, name, rule, type, isEditable, isNew, state = 'view' }) => {
  const dispatch = useAppDispatch();
  const [elemState, setElemState] = React.useState<elemState>(state);
  const [editableState, setEditableState] = React.useState(isEditable || false);

  const [nameState, setNameState] = React.useState(name);
  const [ruleState, setRuleState] = React.useState(rule);

  const clearInputs = () => {
    setNameState('');
    setRuleState('');
  };

  const handleAdd = () => {
    dispatch(addRule({ name: nameState, rule: ruleState, type }));
    setElemState('new');
    clearInputs();
  };
  const handleUpdate = () => {
    dispatch(updateRule({ id, changes: { name: nameState, rule: ruleState } }));
    setEditableState(false);
  };

  const handleDelete = () => {
    dispatch(deleteRule({ id }));
  };

  const handleActivateEditing = () => {
    setEditableState(true);
  };

  return elemState === 'view' ? (
    <div className="rule-element">
      <div className="num">{id}</div>
      <div className="name" onClick={() => setEditableState(true)}>
        <InlineEditableRS
          value={nameState}
          onCommit={(v) => setNameState(v)}
          onClick={handleActivateEditing}
        />
      </div>
      <div className="rule" onClick={() => setEditableState(true)}>
        <InlineEditableRS
          value={ruleState}
          onCommit={(v) => setRuleState(v)}
          onClick={handleActivateEditing}
        />
      </div>
      <div className="type">{type}</div>
      <button className="delete-icon" onClick={handleDelete}>
        <Trash2 />
      </button>
      {!editableState && elemState === 'view' && (
        <button className="edit-icon" onClick={() => setEditableState(true)}>
          <SquarePen />
        </button>
      )}
      {editableState && (
        <button className="confirm edit-icon" onClick={isNew ? handleAdd : handleUpdate}>
          <SquareCheckBig />
        </button>
      )}
    </div>
  ) : (
    <div className="rule-element" onClick={() => setElemState('view')}>
      Добавить еще
    </div>
  );
};
