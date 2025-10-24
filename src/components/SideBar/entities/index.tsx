import { Activity, ChartLine, ScrollText } from 'lucide-react';

import { graphanaLink, graylogLink } from '@/shared/constants';

import type { NavItems } from '../types';

export const NAV_ITEMS: NavItems = [
  {
    icon: ScrollText,
    label: 'Правила',
    url: '#rules',
  },
  { icon: ChartLine, label: 'Graphana', url: graphanaLink },
  { icon: Activity, label: 'GrayLog', url: graylogLink },
];
