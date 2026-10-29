import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { isHovered } from '@/lib/interaction';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface ChipProps {
  label: string;
  /** Green fill — the active option in a filter group. */
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Outlined pill for interests and filter options. */
export function Chip({ label, selected = false, onPress, style }: ChipProps) {
  const theme = useTheme();

  const container: ViewStyle = {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.full,
    backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
    borderWidth: 1,
    borderColor: selected ? theme.colors.accent : theme.colors.border,
  };

  const content = (
    <Text variant="bodyStrong" color={selected ? 'onAccent' : 'text'} numberOfLines={1}>
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
      style={(state) => [
        container,
        isHovered(state) && !selected && { borderColor: theme.colors.accent },
        state.pressed && { opacity: 0.75 },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}
