import { useCallback, useEffect, type ReactNode } from 'react';
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useIsFocused } from 'expo-router/react-navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/hooks/use-layout';
import { layout, useTheme } from '@/theme';
import { useHeaderScroll } from './header-scroll';
import { SiteFooter } from './site-footer';

export interface PageProps {
  children: ReactNode;
  /** Apply the top safe-area inset on phones (tab screens without a stack header). */
  edgeTop?: boolean;
  /** Content column width on wide screens; narrower for forms and the wizard. */
  maxWidth?: number;
  /** Content fixed under the scroll area, e.g. the "Start Route" bar on phones. */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Scroll offset past which the site header compacts. */
const SCROLL_THRESHOLD = 8;

/**
 * Scrolling page with the content column used on every screen.
 *
 * On wide web screens it leaves room for the fixed site header, centres the
 * content at the container width, reports the scroll position to the header
 * and closes with the footer — the Apex page structure.
 */
export function Page({ children, edgeTop = false, maxWidth, footer, contentStyle }: PageProps) {
  const theme = useTheme();
  const { isWide, gutter } = useLayout();
  const insets = useSafeAreaInsets();
  const { setScrolled } = useHeaderScroll();
  const focused = useIsFocused();

  // Each page owns the header state while it is on screen; a fresh page starts
  // at the top, so the header must not stay compact from the previous one.
  useEffect(() => {
    if (focused) setScrolled(false);
  }, [focused, setScrolled]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isWide) setScrolled(event.nativeEvent.contentOffset.y > SCROLL_THRESHOLD);
    },
    [isWide, setScrolled],
  );

  const paddingTop = isWide
    ? layout.headerHeight + theme.spacing['3xl']
    : (edgeTop ? insets.top : 0) + theme.spacing.lg;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={32}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={isWide}
        contentContainerStyle={{
          paddingTop,
          paddingBottom: theme.spacing['3xl'],
          paddingHorizontal: gutter,
          alignItems: 'center',
          flexGrow: 1,
        }}
      >
        <View
          style={[
            { width: '100%', maxWidth: maxWidth ?? layout.maxWidth, flexGrow: 1 },
            contentStyle,
          ]}
        >
          {children}
          {isWide ? <SiteFooter /> : null}
        </View>
      </ScrollView>

      {footer}
    </View>
  );
}
