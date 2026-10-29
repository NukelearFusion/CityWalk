import { View } from 'react-native';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme';

export interface StatItem {
  value: string;
  label: string;
}

/** "3.5 h / duration · 3.1 km / walking · …" — the row of route figures. */
export function StatsCard({ items }: { items: StatItem[] }) {
  const theme = useTheme();

  return (
    <Card
      style={{
        flexDirection: 'row',
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.sm,
      }}
    >
      {items.map((item) => (
        <View key={item.label} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
          <Text variant="heading" style={{ fontSize: 19, lineHeight: 24 }}>
            {item.value}
          </Text>
          <Text variant="caption" color="textMuted">
            {item.label}
          </Text>
        </View>
      ))}
    </Card>
  );
}
