import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CategoryCover } from '@/components/category-cover';
import { RouteMap } from '@/components/route-map';
import { StatRow } from '@/components/stat-row';
import { StopItem } from '@/components/stop-item';
import { Chip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { ErrorState, LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { useRoute } from '@/api/queries';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

const COVER_HEIGHT = 200;
const MAP_HEIGHT = 260;

/**
 * Route detail screen: description, statistics, map and itinerary
 * (spec 4.1.3 – 4.1.7, 4.1.16 – 4.1.20).
 */
export default function RouteScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const { data, isPending, error, refetch } = useRoute(slug ?? '');

  if (isPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error) {
    const missing = error.name === 'NotFoundError';
    return (
      <Screen>
        <ErrorState
          title={missing ? t.common.notFoundTitle : t.common.errorTitle}
          body={missing ? t.common.notFoundBody : t.common.errorBody}
          retryLabel={t.common.retry}
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  const { stops, startingPoint } = data;

  return (
    <Screen>
      <Stack.Screen options={{ title: data.city.name }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <CategoryCover
          category={data.category}
          imageUrl={data.coverImageUrl}
          height={COVER_HEIGHT}
        />

        <View style={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}>
          <View style={{ gap: theme.spacing.sm }}>
            <View style={{ flexDirection: 'row' }}>
              <Chip label={t.categories[data.category]} />
            </View>

            <Text variant="display">{data.name}</Text>

            {data.summary ? (
              <Text variant="body" color="textMuted">
                {data.summary}
              </Text>
            ) : null}
          </View>

          <View
            style={{
              paddingVertical: theme.spacing.lg,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <StatRow stats={data.stats} size="regular" />
          </View>

          {data.description ? (
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="title">{t.route.descriptionTitle}</Text>
              <Text variant="body" color="textMuted">
                {data.description}
              </Text>
            </View>
          ) : null}

          {startingPoint ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.md,
                padding: theme.spacing.lg,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.accentSoft,
              }}
            >
              <Ionicons name="flag-outline" size={20} color={theme.colors.accentSoftText} />
              <View style={{ flex: 1 }}>
                <Text variant="label" color="accent">
                  {t.route.startingPoint.toUpperCase()}
                </Text>
                <Text variant="bodyStrong">{startingPoint.name}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {stops.length > 0 ? (
          <>
            <View style={{ paddingHorizontal: theme.spacing.xl, gap: theme.spacing.md }}>
              <Text variant="title">{t.route.mapTitle}</Text>
              <RouteMap
                stops={stops}
                focusedStopId={selectedStopId}
                onSelectStop={(stop) => setSelectedStopId(stop.id)}
                style={{
                  height: MAP_HEIGHT,
                  borderRadius: theme.radius.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  overflow: 'hidden',
                }}
              />
            </View>

            <View
              style={{
                padding: theme.spacing.xl,
                paddingTop: theme.spacing['3xl'],
                gap: theme.spacing.lg,
              }}
            >
              <Text variant="title">{t.route.stopsTitle}</Text>

              <View>
                {stops.map((stop, index) => (
                  <StopItem
                    key={stop.id}
                    stop={stop}
                    isLast={index === stops.length - 1}
                    isSelected={stop.id === selectedStopId}
                    onPress={() =>
                      setSelectedStopId((current) => (current === stop.id ? null : stop.id))
                    }
                  />
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={{ paddingHorizontal: theme.spacing.xl }}>
            <Text variant="body" color="textMuted">
              {t.route.emptyStops}
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
