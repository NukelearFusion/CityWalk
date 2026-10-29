import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/i18n';
import { formatDistance, formatDuration } from '@/lib/format';
import { useTheme } from '@/theme';
import type { RouteStats } from '@/types/domain';

export interface StatRowProps {
  stats: RouteStats;
  /** Larger presentation for the route detail header. */
  size?: 'compact' | 'regular';
}

/** Duration, distance and stop count — the three numbers shown for every route. */
export function StatRow({ stats, size = 'compact' }: StatRowProps) {
  const theme = useTheme();
  const i18n = useI18n();
  const isCompact = size === 'compact';

  const iconSize = isCompact ? 14 : 16;
  const variant = isCompact ? 'caption' : 'bodyStrong';

  const items = [
    { icon: 'time-outline', label: formatDuration(stats.durationMinutes, i18n) },
    { icon: 'walk-outline', label: formatDistance(stats.distanceMeters, i18n) },
    { icon: 'location-outline', label: i18n.plural(i18n.t.units.stops, stats.stopCount) },
  ] as const;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
      {items.map((item) => (
        <View
          key={item.icon}
          style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}
        >
          <Ionicons name={item.icon} size={iconSize} color={theme.colors.textMuted} />
          <Text variant={variant} color="textMuted">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
