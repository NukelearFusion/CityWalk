import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Text } from '@/components/ui/text';
import { CategoryCover } from './category-cover';
import { StatRow } from './stat-row';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import type { RouteSummary } from '@/types/domain';

export interface RouteCardProps {
  route: RouteSummary;
  /** `wide` fills the list column, `compact` is used in horizontal carousels. */
  layout?: 'wide' | 'compact';
}

const COMPACT_WIDTH = 260;

export function RouteCard({ route, layout = 'wide' }: RouteCardProps) {
  const theme = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  const isCompact = layout === 'compact';

  return (
    <Card
      onPress={() => router.push(`/route/${route.slug}`)}
      accessibilityLabel={`${route.name}, ${route.city.name}`}
      style={isCompact ? { width: COMPACT_WIDTH } : undefined}
    >
      <CategoryCover
        category={route.category}
        imageUrl={route.coverImageUrl}
        height={isCompact ? 116 : 148}
      >
        <View style={{ position: 'absolute', top: theme.spacing.md, left: theme.spacing.md }}>
          <Chip label={t.categories[route.category]} />
        </View>
      </CategoryCover>

      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.xs }}>
        <Text variant="label" color="accent" numberOfLines={1}>
          {route.city.name.toUpperCase()}
        </Text>

        <Text variant="heading" numberOfLines={2}>
          {route.name}
        </Text>

        {route.summary ? (
          <Text variant="caption" color="textMuted" numberOfLines={2}>
            {route.summary}
          </Text>
        ) : null}

        <View style={{ marginTop: theme.spacing.sm }}>
          <StatRow stats={route.stats} />
        </View>
      </View>
    </Card>
  );
}
