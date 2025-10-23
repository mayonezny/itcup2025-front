import { Activity, ChartBarDecreasing, ChartLine, FileSpreadsheet, ScrollText } from 'lucide-react';

import type { NavItems } from '../types';

export const NAV_ITEMS: NavItems = [
  {
    icon: ScrollText,
    label: 'Правила',
    url: '#rules',
  },
  {
    icon: FileSpreadsheet,
    label: 'Транзакции',
    url: '#transactions',
  },
  { icon: ChartBarDecreasing, label: 'Статистика', url: '#stats' },
  { icon: ChartLine, label: 'Graphana', url: 'graphana' },
  { icon: Activity, label: 'GrayLog', url: 'graylog' },
];
