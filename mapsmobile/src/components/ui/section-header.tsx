import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
      }}
    >
      <Text variant="title">{title}</Text>

      {action ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          hitSlop={theme.spacing.sm}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text variant="bodyStrong" color="accent">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
