import { useState } from 'react';
import { Pressable, View, type TextStyle } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { CityPicker } from '@/components/city-picker';
import { Text } from '@/components/ui/text';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { webStyle } from '@/lib/web-style';
import { layout, useTheme } from '@/theme';
import { useHeaderScroll } from './header-scroll';
import { NAV_ITEMS, isActivePath, type NavItem } from './nav-items';

/**
 * Desktop and tablet header (web only).
 *
 * Adapted from the Apex site header: fixed, translucent with a blur behind it,
 * shrinking and gaining a shadow once the page scrolls, with nav links whose
 * underline slides in under a mouse pointer and stays under the active page.
 */
export function SiteHeader() {
  const theme = useTheme();
  const { gutter, isDesktop } = useLayout();
  const { scrolled } = useHeaderScroll();
  const pathname = usePathname();

  const height = scrolled ? layout.headerHeightCompact : layout.headerHeight;

  return (
    <View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height,
          zIndex: 10,
          backgroundColor: theme.colors.headerGlass,
          borderBottomWidth: 1,
          borderBottomColor: scrolled ? theme.colors.border : 'transparent',
          alignItems: 'center',
        },
        webStyle({
          backdropFilter: 'blur(12px)',
          transitionProperty: 'height, box-shadow, border-color',
          transitionDuration: `${theme.motion.base}ms`,
          boxShadow: scrolled ? '0 6px 20px rgba(31, 40, 32, 0.08)' : 'none',
        }),
      ]}
    >
      <View
        style={{
          flex: 1,
          width: '100%',
          // Same edges as the page column: the container plus its gutters.
          maxWidth: layout.maxWidth + gutter * 2,
          paddingHorizontal: gutter,
          flexDirection: 'row',
          alignItems: 'center',
          gap: isDesktop ? theme.spacing['4xl'] : theme.spacing['2xl'],
        }}
      >
        <Link href="/" accessibilityLabel="Trasa">
          <Text variant="title" color="accent" style={{ fontSize: scrolled ? 24 : 28 }}>
            Trasa
          </Text>
        </Link>

        <View
          accessibilityRole="menubar"
          style={{
            flexDirection: 'row',
            gap: isDesktop ? theme.spacing['3xl'] : theme.spacing.xl,
            flex: 1,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.name} item={item} active={isActivePath(item.href, pathname)} />
          ))}
        </View>

        <CityPicker />
      </View>
    </View>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const theme = useTheme();
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);

  const lit = active || hovered;

  return (
    <Link href={item.href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityState={{ selected: active }}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={{ paddingVertical: theme.spacing.sm }}
      >
        <Text
          variant="bodyStrong"
          style={[
            { color: lit ? theme.colors.accent : theme.colors.textMuted },
            webStyle<TextStyle>({
              transitionProperty: 'color',
              transitionDuration: `${theme.motion.fast}ms`,
            }),
          ]}
        >
          {item.label(t)}
        </Text>
        <View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 2,
              borderRadius: 1,
              backgroundColor: theme.colors.accent,
              transform: [{ scaleX: lit ? 1 : 0 }],
            },
            webStyle({
              transformOrigin: hovered && !active ? 'left' : 'right',
              transitionProperty: 'transform',
              transitionDuration: `${theme.motion.base}ms`,
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }),
          ]}
        />
      </Pressable>
    </Link>
  );
}
