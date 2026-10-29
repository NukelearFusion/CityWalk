import type { Translations } from '@/i18n';

export type NavIcon = 'home' | 'explore' | 'route' | 'saved';

export interface NavItem {
  /** Tab route name inside `app/(tabs)`. */
  name: 'index' | 'explore' | 'my-route' | 'saved';
  href: '/' | '/explore' | '/my-route' | '/saved';
  icon: NavIcon;
  label: (t: Translations) => string;
}

/** One list for both the bottom tab bar and the desktop header, so they never disagree. */
export const NAV_ITEMS: readonly NavItem[] = [
  { name: 'index', href: '/', icon: 'home', label: (t) => t.tabs.home },
  { name: 'explore', href: '/explore', icon: 'explore', label: (t) => t.tabs.explore },
  { name: 'my-route', href: '/my-route', icon: 'route', label: (t) => t.tabs.myRoute },
  { name: 'saved', href: '/saved', icon: 'saved', label: (t) => t.tabs.saved },
];

/** Whether a pathname belongs to a nav item: "/" only matches exactly. */
export function isActivePath(href: NavItem['href'], pathname: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
