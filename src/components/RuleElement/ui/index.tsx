import { GripVertical, Trash2 } from 'lucide-react';

import type { RuleElementProps } from '../types';
import './rule-element.scss';

export const RuleElementHead = () => (
  <div className="rule-element head">
    <div className="num">#</div>
    <div className="name">Имя правила</div>
    <div className="rule">Правило</div>
    <div className="type">Тип</div>
    <div className="delete-icon" />
    <div className="drag-icon" />
  </div>
);

export const RuleElement: React.FC<RuleElementProps> = ({ id, name, rule, type }) => (
  <div className="rule-element">
    <div className="num">{id}</div>
    <div className="name">{name}</div>
    <div className="rule">
      <div>{rule}</div>
    </div>
    <div className="type">{type}</div>
    <button className="delete-icon">
      <Trash2 />
    </button>
    <button className="drag-icon">
      <GripVertical />
    </button>
  </div>
);
