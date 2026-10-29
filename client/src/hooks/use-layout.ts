import { Platform, useWindowDimensions } from 'react-native';
import { breakpoints, spacing } from '@/theme';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export interface Layout {
  breakpoint: Breakpoint;
  /** Web at tablet width or wider: site header instead of the bottom tab bar. */
  isWide: boolean;
  /** Two-column screens (Home, Route) switch on at desktop width. */
  isDesktop: boolean;
  /** Horizontal padding of the content column. */
  gutter: number;
}

/**
 * Layout decisions derived from the window width.
 *
 * Native apps always use the phone layout: a tablet running the app is still a
 * touch device with a tab bar, and the desktop chrome only makes sense in a
 * browser.
 */
export function useLayout(): Layout {
  const { width } = useWindowDimensions();

  if (Platform.OS !== 'web' || width < breakpoints.tablet) {
    return { breakpoint: 'phone', isWide: false, isDesktop: false, gutter: spacing.xl };
  }

  if (width < breakpoints.desktop) {
    return { breakpoint: 'tablet', isWide: true, isDesktop: false, gutter: spacing['2xl'] };
  }

  return { breakpoint: 'desktop', isWide: true, isDesktop: true, gutter: spacing['3xl'] };
}
