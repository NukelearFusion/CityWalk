import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { isHovered } from '@/lib/interaction';
import { useTheme } from '@/theme';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  /** Accessibility label, required whenever the card is interactive. */
  accessibilityLabel?: string;
  /** Green outline used for selected options in the plan wizard. */
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * White rounded surface used for list items and panels.
 * Renders a plain `View` when it has no press handler, so non-interactive cards
 * stay out of the accessibility focus order.
 */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  selected = false,
  style,
}: CardProps) {
  const theme = useTheme();

  const base: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? theme.colors.accent : theme.colors.border,
    overflow: 'hidden',
    ...theme.elevation.card,
  };

  if (!onPress) {
    return <View style={[base, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      android_ripple={{ color: theme.colors.border }}
      style={(state) => [
        base,
        isHovered(state) && !selected && { borderColor: theme.colors.textSubtle },
        state.pressed && { opacity: 0.88 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
