import { CardSim, Diff, MessageCircle, UserRound } from 'lucide-react';

import type { NavItems } from '../types';

export const NAV_ITEMS: NavItems = [
  {
    icon: UserRound,
    label: 'Правила',
    url: 'rules',
  },
  {
    icon: CardSim,
    label: 'Транзакции',
    url: 'transactions',
  },
  { icon: MessageCircle, label: 'Статистика', url: 'stats' },
  { icon: MessageCircle, label: 'Graphana', url: 'graphana' },
  { icon: MessageCircle, label: 'GrayLog', url: 'graylog' },
];
