import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  /** Accessibility label, required whenever the card is interactive. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Raised surface used for every list item in the app.
 * Renders a plain `View` when it has no press handler, so non-interactive cards
 * stay out of the accessibility focus order.
 */
export function Card({ children, onPress, accessibilityLabel, style }: CardProps) {
  const theme = useTheme();

  const base: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
      // Android draws its own ripple; iOS gets a subtle opacity change instead.
      android_ripple={{ color: theme.colors.border }}
      style={({ pressed }) => [base, pressed && { opacity: 0.85 }, style]}
    >
      {children}
    </Pressable>
  );
}
