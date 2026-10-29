import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Page } from '@/components/layout/page';
import { RouteMap } from '@/components/route-map';
import { StatsCard, type StatItem } from '@/components/route/stats-card';
import { StopRow } from '@/components/route/stop-row';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { stopTone } from '@/lib/itinerary';
import { stopMeta, stopPrice } from '@/lib/stop-format';
import { webStyle } from '@/lib/web-style';
import { layout, useTheme } from '@/theme';
import type { Itinerary } from '@/types/itinerary';

export interface RouteOverviewProps {
  itinerary: Itinerary;
  /** Kicker above the title ("YOUR ROUTE · POZNAŃ"). */
  eyebrow: string;
  summary?: string;
  description?: string;
  stats: StatItem[];
  /** Round button left of "Start Route" (e.g. regenerate a planned route). */
  secondary?: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void };
  /** Extra content under the title, e.g. a save button. */
  accessory?: ReactNode;
}

const PREVIEW_HEIGHT = 200;
const SIDE_COLUMN = 480;

/** The Route screen from the mockup, shared by ready-made and planned routes. */
export function RouteOverview({
  itinerary,
  eyebrow,
  summary,
  description,
  stats,
  secondary,
  accessory,
}: RouteOverviewProps) {
  const theme = useTheme();
  const i18n = useI18n();
  const { t } = i18n;
  const router = useRouter();
  const { isDesktop, gutter } = useLayout();
  const insets = useSafeAreaInsets();

  const { stops } = itinerary;
  const base = itinerary.backHref;
  const openMap = () => router.push(`${base}/map` as Href);
  const openStop = (position: number) => router.push(`${base}/stop/${position}` as Href);

  const header = (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="eyebrow" color="eyebrow">
        {eyebrow}
      </Text>
      <Text variant={isDesktop ? 'displayXL' : 'display'}>{itinerary.title}</Text>
      {summary ? (
        <Text variant="body" color="textMuted">
          {summary}
        </Text>
      ) : null}
      {accessory}
    </View>
  );

  const map =
    stops.length > 0 ? (
      <Pressable
        onPress={openMap}
        accessibilityRole="button"
        accessibilityLabel={t.route.mapTitle}
        style={{ borderRadius: theme.radius.lg, overflow: 'hidden' }}
      >
        <RouteMap
          points={stops}
          interactive={false}
          style={{ height: isDesktop ? 480 : PREVIEW_HEIGHT }}
        />
      </Pressable>
    ) : null;

  const itineraryList = (
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
            meta={stopMeta(stop, itinerary, i18n)}
            price={stopPrice(stop, i18n)}
            tone={stopTone(stop, itinerary)}
            onPress={() => openStop(stop.position)}
          />
        ))
      )}
    </View>
  );

  const about = description ? (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="heading">{t.route.descriptionTitle}</Text>
      <Text variant="body" color="textMuted">
        {description}
      </Text>
    </View>
  ) : null;

  const actions = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
      {secondary ? (
        <IconButton
          icon={secondary.icon}
          accessibilityLabel={secondary.label}
          onPress={secondary.onPress}
          variant="outline"
        />
      ) : null}
      <Button
        label={t.route.startRoute}
        size="lg"
        onPress={openMap}
        disabled={stops.length === 0}
        style={{ flex: 1 }}
      />
    </View>
  );

  if (isDesktop) {
    return (
      <Page>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing['4xl'] }}>
          <View style={{ flex: 1, gap: theme.spacing['2xl'] }}>
            {header}
            <StatsCard items={stats} />
            {itineraryList}
            {about}
          </View>
          <View
            style={[
              { width: SIDE_COLUMN, gap: theme.spacing.lg },
              webStyle({ position: 'sticky', top: layout.headerHeight + theme.spacing['2xl'] }),
            ]}
          >
            {map}
            {actions}
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
          {actions}
        </View>
      }
    >
      <View style={{ gap: theme.spacing.xl }}>
        {header}
        <StatsCard items={stats} />
        {map}
        {itineraryList}
        {about}
      </View>
    </Page>
  );
}
