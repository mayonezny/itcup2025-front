// src/features/rules/ui/RuleElement.tsx
import {
  Plus,
  SquareArrowDown,
  SquareArrowUp,
  SquareCheckBig,
  SquarePen,
  Trash2,
} from 'lucide-react';
import React from 'react';

import type { RuleObject } from '@/features/rules/dto';
import {
  addRuleLoc,
  changePriority,
  deleteRuleLoc,
  updateRuleLoc,
} from '@/features/rules/store/rulesSlice';
import { addRule, deleteRule, updateRule } from '@/features/rules/store/rulesThunks';
import type { FilterType, RuleValue } from '@/features/rules/types';
import { useAppDispatch } from '@/redux-rtk/hooks';
import { LOGIN } from '@/shared/constants';
import { PopupEditor } from '@/shared/PopupEditor';
import './rule-element.scss';

type ElemState = 'view' | 'edit' | 'new';

export const RuleElementHead = () => (
  <div className="rule-row rule-row--head">
    <div className="col col--prio" title="Приоритет">
      #
    </div>
    <div className="col col--type">Тип</div>
    <div className="col col--action">Action</div>
    <div className="col col--value">Значение правила (JSON)</div>
    <div className="col col--icons" />
  </div>
);

export const RuleElement: React.FC<
  RuleObject & { isEditable?: boolean; isNew?: boolean; state?: ElemState }
> = ({
  id,
  isActive,
  filterType = 'alg',
  action,
  ruleValue,
  priority,
  isEditable,
  isNew,
  state = 'view',
}) => {
  const dispatch = useAppDispatch();
  const [elemState, setElemState] = React.useState<ElemState>(state);
  const [editable, setEditable] = React.useState<boolean>(Boolean(isEditable));
  const [ft, setFt] = React.useState<FilterType>(filterType);
  const [act, setAct] = React.useState<string>(action);
  const [val, setVal] = React.useState<RuleValue>(ruleValue);
  const [submitErr, setSubmitErr] = React.useState<string | undefined>(undefined);

  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const [editorOpen, setEditorOpen] = React.useState(false);

  function preview(v: RuleValue): string {
    const s = JSON.stringify(v);
    return s.length > 80 ? `${s.slice(0, 80)}…` : s;
  }

  async function handleAdd() {
    try {
      setSubmitErr(undefined);
      const payload: RuleObject = {
        id,
        isActive,
        filterType: ft,
        action: actFor(ft, act),
        ruleValue: val,
        priority,
      };
      dispatch(addRuleLoc(payload));
      dispatch(addRule({ rule: payload, login: LOGIN }));
      setEditable(false);
      setElemState('new');
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleUpdate() {
    try {
      setSubmitErr(undefined);
      const payload: RuleObject = {
        id,
        isActive,
        filterType: ft,
        action: actFor(ft, act),
        ruleValue: val,
        priority,
      };
      dispatch(
        updateRuleLoc({ id, changes: { filterType: ft, action: actFor(ft, act), ruleValue: val } }),
      );
      dispatch(updateRule({ rule: payload, login: LOGIN }));
      setEditable(false);
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleDelete() {
    try {
      setSubmitErr(undefined);
      dispatch(deleteRuleLoc({ id }));
      dispatch(deleteRule({ id, login: LOGIN }));
      setEditable(false);
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : String(e));
    }
  }
  return elemState === 'view' ? (
    <div className="rule-row">
      <div className="col col--prio">{priority}</div>

      <div className="col col--type">
        {editable ? (
          <select className="sel" value={ft} onChange={(e) => setFt(e.target.value as FilterType)}>
            <option value="alg">ALG</option>
            <option value="ml">ML</option>
          </select>
        ) : (
          <span className="tag">{ft.toUpperCase()}</span>
        )}
      </div>

      <div className="col col--action">
        {
          ft === 'ml' ? (
            editable ? (
              <input
                className="inp"
                value={act}
                onChange={(e) => setAct(e.target.value)}
                placeholder="действие модели"
              />
            ) : (
              <span className="truncate" title={act}>
                {act || '—'}
              </span>
            )
          ) : (
            <span className="muted">action</span>
          ) /* для ALG не показываем редактирование */
        }
      </div>

      <div className="col col--value">
        <button
          ref={anchorRef}
          type="button"
          className={`btn-json ${editable ? 'btn-json--edit' : ''}`}
          onClick={() => setEditorOpen(true)}
          title="Открыть JSON редактор"
        >
          {preview(val)}
        </button>
        <PopupEditor
          open={editorOpen && editable}
          anchorRef={anchorRef}
          filterType={ft}
          valueText={JSON.stringify(val)}
          onApplyText={(v) => setVal(JSON.parse(v))}
          onClose={() => setEditorOpen(false)}
        />
      </div>

      <div className="col col--icons">
        {!editable && (
          <div className="prio">
            <button
              onClick={() => dispatch(changePriority({ id, priority: priority - 1 }))}
              title="Повысить"
            >
              <SquareArrowUp />
            </button>
            <button
              onClick={() => dispatch(changePriority({ id, priority: priority + 1 }))}
              title="Понизить"
            >
              <SquareArrowDown />
            </button>
          </div>
        )}
        <button className="danger" onClick={handleDelete} title="Удалить">
          <Trash2 />
        </button>
        {!editable ? (
          <button onClick={() => setEditable(true)} title="Редактировать">
            <SquarePen />
          </button>
        ) : (
          <button className="ok" onClick={isNew ? handleAdd : handleUpdate} title="Сохранить">
            <SquareCheckBig />
          </button>
        )}
      </div>

      {submitErr && (
        <div className="rule-errors">
          {submitErr.split('\n').map((m, i) => (
            <div key={i} className="rule-error">
              {m}
            </div>
          ))}
        </div>
      )}
    </div>
  ) : (
    <div
      className="rule-add"
      onClick={() => {
        setElemState('view');
        setEditable(true);
        setSubmitErr(undefined);
      }}
    >
      <Plus size={28} strokeWidth={3} /> Добавить правило
    </div>
  );
};

function actFor(ft: FilterType, action: string): string {
  return ft === 'alg' ? 'action' : action; // для ALG фикс
}
