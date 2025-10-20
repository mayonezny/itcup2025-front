import type { RuleElementProps } from '@/components/RuleElement';

export const rules: RuleElementProps[] = [
  {
    id: 1,
    name: 'Большие бабки',
    rule: '(COUNT >= 50000 AND TIME IN [00:00:00, 12:30:00]) OR (COUNT <= 500)',
    type: 'Composite',
  },
  {
    id: 2,
    name: 'Маленькие бабки',
    rule: 'COUNT < 1000 AND TIME IN [14:00:00, 18:00:00]',
    type: 'Simple',
  },
  { id: 3, name: 'Средние бабки', rule: 'COUNT >= 1000 AND COUNT <= 50000', type: 'Simple' },
  { id: 4, name: 'Рабочее время', rule: 'TIME IN [09:00:00, 18:00:00]', type: 'Simple' },
  { id: 5, name: 'Выходные дни', rule: 'DAY IN [Saturday, Sunday]', type: 'Simple' },
];
