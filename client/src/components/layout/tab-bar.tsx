import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Text } from '@/components/ui/text';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import { NavIcon } from './nav-icon';
import { NAV_ITEMS } from './nav-items';

/**
 * Bottom navigation from the mockup. On wide web screens the site header takes
 * over navigation, so the bar renders nothing there.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const { t } = useI18n();
  const { isWide } = useLayout();
  const insets = useSafeAreaInsets();

  if (isWide) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: theme.spacing.sm,
        paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
      }}
    >
      {NAV_ITEMS.map((item) => {
        const index = state.routes.findIndex((route) => route.name === item.name);
        const route = state.routes[index];
        if (!route) return null;

        const focused = state.index === index;
        const color = focused ? theme.colors.accent : theme.colors.textMuted;

        return (
          <Pressable
            key={item.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={item.label(t)}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: theme.spacing.xs }}
          >
            <NavIcon name={item.icon} color={color} active={focused} />
            <Text
              variant="caption"
              style={{
                color,
                fontSize: 11,
                fontFamily: focused ? theme.fonts.semibold : theme.fonts.medium,
              }}
            >
              {item.label(t)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
