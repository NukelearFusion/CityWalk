import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', style }: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          // 48pt clears the 44pt minimum touch target on both platforms.
          minHeight: 48,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isPrimary
            ? pressed
              ? theme.colors.accentPressed
              : theme.colors.accent
            : 'transparent',
          borderWidth: isPrimary ? 0 : 1,
          borderColor: theme.colors.border,
          opacity: !isPrimary && pressed ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text variant="bodyStrong" color={isPrimary ? 'onAccent' : 'text'}>
        {label}
      </Text>
    </Pressable>
  );
}
