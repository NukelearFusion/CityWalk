import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Tile } from '@/components/ui/tile';
import { useI18n } from '@/i18n';
import { formatDistance, formatHours } from '@/lib/format';
import { routeTone } from '@/lib/tone';
import { useTheme } from '@/theme';
import type { RouteSummary } from '@/types/domain';

export interface RouteRowProps {
  route: RouteSummary;
  /** Shows the "Example" badge used for ready-made routes on Home. */
  showExampleBadge?: boolean;
  /** Prefixes the meta line with the city, for lists that mix cities. */
  showCity?: boolean;
}

/** A ready-made route as a compact row: tile, name, "3.5 h · 3 km". */
export function RouteRow({ route, showExampleBadge = false, showCity = false }: RouteRowProps) {
  const theme = useTheme();
  const i18n = useI18n();
  const router = useRouter();

  const meta = [
    showCity ? route.city.name : null,
    formatHours(route.stats.durationMinutes, i18n),
    formatDistance(route.stats.distanceMeters, i18n),
    i18n.plural(i18n.t.units.stops, route.stats.stopCount),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card
      onPress={() => router.push(`/route/${route.slug}`)}
      accessibilityLabel={`${route.name}, ${route.city.name}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
        padding: theme.spacing.md,
      }}
    >
      <Tile tone={routeTone(route.category)} size={56} />

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="heading" numberOfLines={2}>
          {route.name}
        </Text>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {meta}
        </Text>
      </View>

      {showExampleBadge ? <Badge label={i18n.t.home.example} /> : null}
    </Card>
  );
}
