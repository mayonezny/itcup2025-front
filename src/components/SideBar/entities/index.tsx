import { ChartLine, ScrollText } from 'lucide-react';

import { graphanaLink } from '@/shared/constants';

import type { NavItems } from '../types';

export const NAV_ITEMS: NavItems = [
  {
    icon: ScrollText,
    label: 'Правила',
    url: '#rules',
  },
  { icon: ChartLine, label: 'Graphana', url: graphanaLink },
];
