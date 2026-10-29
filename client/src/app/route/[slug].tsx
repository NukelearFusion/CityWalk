import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Page } from '@/components/layout/page';
import { RouteMap } from '@/components/route-map';
import { StatsCard } from '@/components/route/stats-card';
import { StopRow } from '@/components/route/stop-row';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { useRoute } from '@/api/queries';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { formatDistance, formatHours } from '@/lib/format';
import { walkingDirectionsUrl } from '@/lib/maps-link';
import { routeTone } from '@/lib/tone';
import { webStyle } from '@/lib/web-style';
import { layout, useTheme } from '@/theme';

const MAP_HEIGHT_PHONE = 200;
const SIDE_COLUMN = 480;

/**
 * Route detail: figures, map and itinerary
 * (spec 4.1.3 – 4.1.7, 4.1.16 – 4.1.20).
 */
export default function RouteScreen() {
  const theme = useTheme();
  const i18n = useI18n();
  const { t, format } = i18n;
  const { isDesktop, gutter } = useLayout();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const { data, isPending, error, refetch } = useRoute(slug ?? '');

  if (isPending) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (error) {
    const missing = error.name === 'NotFoundError';
    return (
      <Page>
        <ErrorState
          title={missing ? t.common.notFoundTitle : t.common.errorTitle}
          body={missing ? t.common.notFoundBody : t.common.errorBody}
          retryLabel={t.common.retry}
          onRetry={() => void refetch()}
        />
      </Page>
    );
  }

  const { stops } = data;
  const directions = walkingDirectionsUrl(stops);
  const startRoute = () => {
    if (directions) void Linking.openURL(directions);
  };

  const header = (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="eyebrow" color="eyebrow">
        {format(t.route.eyebrow, { city: data.city.name })}
      </Text>
      <Text variant={isDesktop ? 'displayXL' : 'display'}>{data.name}</Text>
      {data.summary ? (
        <Text variant="body" color="textMuted">
          {data.summary}
        </Text>
      ) : null}
    </View>
  );

  const stats = (
    <StatsCard
      items={[
        { value: formatHours(data.stats.durationMinutes, i18n), label: t.route.statDuration },
        { value: formatDistance(data.stats.distanceMeters, i18n), label: t.route.statWalking },
        { value: String(data.stats.stopCount), label: t.route.statStops },
      ]}
    />
  );

  const map =
    stops.length > 0 ? (
      <RouteMap
        stops={stops}
        focusedStopId={selectedStopId}
        onSelectStop={(stop) => setSelectedStopId(stop.id)}
        style={{
          height: isDesktop ? 520 : MAP_HEIGHT_PHONE,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
        }}
      />
    ) : null;

  const itinerary = (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="heading">{t.route.stopsTitle}</Text>
      {stops.length === 0 ? (
        <Text variant="body" color="textMuted">
          {t.route.emptyStops}
        </Text>
      ) : (
        stops.map((stop) => (
          <StopRow
            key={stop.id}
            position={stop.position}
            name={stop.name}
            meta={stop.description}
            tone={routeTone(data.category)}
            selected={stop.id === selectedStopId}
            onPress={() => setSelectedStopId((current) => (current === stop.id ? null : stop.id))}
          />
        ))
      )}
    </View>
  );

  const about = data.description ? (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="heading">{t.route.descriptionTitle}</Text>
      <Text variant="body" color="textMuted">
        {data.description}
      </Text>
    </View>
  ) : null;

  const startButton = (
    <Button label={t.route.startRoute} size="lg" onPress={startRoute} disabled={!directions} />
  );

  if (isDesktop) {
    return (
      <Page>
        <Stack.Screen options={{ title: data.city.name }} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing['4xl'] }}>
          <View style={{ flex: 1, gap: theme.spacing['2xl'] }}>
            {header}
            {stats}
            {itinerary}
            {about}
          </View>
          <View
            style={[
              { width: SIDE_COLUMN, gap: theme.spacing.lg },
              webStyle({ position: 'sticky', top: layout.headerHeight + theme.spacing['2xl'] }),
            ]}
          >
            {map}
            {startButton}
          </View>
        </View>
      </Page>
    );
  }

  return (
    <Page
      footer={
        <View
          style={{
            paddingHorizontal: gutter,
            paddingTop: theme.spacing.md,
            paddingBottom: Math.max(insets.bottom, theme.spacing.md),
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          {startButton}
        </View>
      }
    >
      <Stack.Screen options={{ title: data.city.name }} />
      <View style={{ gap: theme.spacing.xl }}>
        {header}
        {stats}
        {map}
        {itinerary}
        {about}
      </View>
    </Page>
  );
}
