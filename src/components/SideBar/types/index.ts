import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  url: string;
}
export type NavItems = NavItem[];
