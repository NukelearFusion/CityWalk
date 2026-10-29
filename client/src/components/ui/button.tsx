import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { isHovered } from '@/lib/interaction';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  /**
   * `primary` — forest green, the default action.
   * `cta` — terracotta, the single headline action of a screen.
   * `outline` — secondary action next to a primary one.
   */
  variant?: 'primary' | 'cta' | 'outline';
  size?: 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const { colors } = theme;

  const palette = {
    primary: {
      bg: colors.accent,
      active: colors.accentPressed,
      fg: 'onAccent' as const,
    },
    cta: { bg: colors.cta, active: colors.ctaPressed, fg: 'onCta' as const },
    outline: {
      bg: colors.surface,
      active: colors.accentSoft,
      fg: 'accent' as const,
    },
  }[variant];

  const iconColor = colors[palette.fg];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={(state) => [
        {
          minHeight: size === 'lg' ? 56 : 52,
          paddingHorizontal: theme.spacing['2xl'],
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: state.pressed || isHovered(state) ? palette.active : palette.bg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: colors.accent,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        {icon ? <Ionicons name={icon} size={18} color={iconColor} /> : null}
        <Text variant="button" color={palette.fg}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
