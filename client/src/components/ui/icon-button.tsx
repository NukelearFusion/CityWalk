import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { isHovered } from '@/lib/interaction';
import { HIT_SLOP_SIZE, useTheme } from '@/theme';

export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  /** `surface` — white disc floating over content; `outline` — ringed, on a bar. */
  variant?: 'surface' | 'outline';
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  style,
}: IconButtonProps) {
  const theme = useTheme();
  const size = variant === 'outline' ? 52 : HIT_SLOP_SIZE;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={(state) => [
        {
          width: size,
          height: size,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            state.pressed || isHovered(state) ? theme.colors.surfaceMuted : theme.colors.surface,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: theme.colors.border,
          ...(variant === 'surface' ? theme.elevation.card : {}),
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={20} color={theme.colors.accent} />
    </Pressable>
  );
}
