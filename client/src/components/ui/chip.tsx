import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface ChipProps {
  label: string;
  /** Filled accent styling — used for the active option in a filter group. */
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Compact pill used for categories and filter options. */
export function Chip({ label, selected = false, onPress, style }: ChipProps) {
  const theme = useTheme();

  const container: ViewStyle = {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm - 2,
    borderRadius: theme.radius.full,
    backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: selected ? theme.colors.accent : theme.colors.border,
  };

  const content = (
    <Text variant="label" color={selected ? 'onAccent' : 'textMuted'} numberOfLines={1}>
      {label}
    </Text>
  );

  if (!onPress) {
    return <View style={[container, style]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [container, pressed && { opacity: 0.7 }, style]}
    >
      {content}
    </Pressable>
  );
}
