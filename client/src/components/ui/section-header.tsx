import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface SectionHeaderProps {
  title: string;
  /** Muted note on the right ("Ready-made examples"). */
  caption?: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, caption, action }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
      }}
    >
      <Text variant="heading">{title}</Text>

      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          hitSlop={theme.spacing.sm}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text variant="caption" color="accent" style={{ fontFamily: theme.fonts.semibold }}>
            {action.label}
          </Text>
        </Pressable>
      ) : caption ? (
        <Text variant="caption" color="textMuted">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
