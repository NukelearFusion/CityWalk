import { ScrollView, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Page } from '@/components/layout/page';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { EmptyState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { formatHours } from '@/lib/format';
import { stopTone } from '@/lib/itinerary';
import { stopKind, stopPrice } from '@/lib/stop-format';
import { useTheme } from '@/theme';
import type { Itinerary } from '@/types/itinerary';

const HERO_HEIGHT = 300;

/** Detail of one stop (spec 4.1.7 — View Point of Interest), per the mockup. */
export function StopScreen({ itinerary, position }: { itinerary: Itinerary; position: number }) {
  const theme = useTheme();
  const i18n = useI18n();
  const { t, format } = i18n;
  const router = useRouter();
  const { isDesktop } = useLayout();
  const insets = useSafeAreaInsets();

  const stop = itinerary.stops.find((candidate) => candidate.position === position);
  const back = () => router.replace(itinerary.backHref as Href);

  if (!stop) {
    return (
      <Page edgeTop>
        <EmptyState
          icon="help-circle-outline"
          title={t.common.notFoundTitle}
          body={t.common.notFoundBody}
          action={{ label: t.route.backToRoute, onPress: back }}
        />
      </Page>
    );
  }

  const tone = theme.tiles[stopTone(stop, itinerary)];
  const kind = stopKind(stop, itinerary, i18n);
  const eyebrow = [
    kind,
    format(t.route.stopCounter, { position: stop.position, total: itinerary.stops.length }),
  ]
    .filter(Boolean)
    .join(' · ');
  const pills = [
    stop.visitMinutes ? formatHours(stop.visitMinutes, i18n) : null,
    stopPrice(stop, i18n),
  ].filter((pill): pill is string => Boolean(pill));

  const body = (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="eyebrow" color="eyebrow">
        {eyebrow}
      </Text>
      <Text variant={isDesktop ? 'displayXL' : 'display'}>{stop.name}</Text>
      {stop.address ? (
        <Text variant="body" color="textMuted">
          {stop.address}
        </Text>
      ) : null}

      {pills.length > 0 ? (
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {pills.map((pill) => (
            <View
              key={pill}
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.surface,
                ...theme.elevation.card,
              }}
            >
              <Text variant="bodyStrong">{pill}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {stop.description ? (
        <Text variant="body" style={{ fontSize: 16, lineHeight: 24 }}>
          {stop.description}
        </Text>
      ) : null}

      {stop.reason ? (
        <View
          style={{
            padding: theme.spacing.lg,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surfaceMuted,
            gap: theme.spacing.xs,
          }}
        >
          <Text variant="bodyStrong">{t.route.whyTitle}</Text>
          <Text variant="body" color="textMuted">
            {stop.reason}
          </Text>
        </View>
      ) : null}
    </View>
  );

  if (isDesktop) {
    return (
      <Page>
        <View style={{ flexDirection: 'row', gap: theme.spacing['4xl'], alignItems: 'stretch' }}>
          <View
            style={{
              width: 440,
              minHeight: 440,
              borderRadius: theme.radius.xl,
              backgroundColor: tone,
              padding: theme.spacing.lg,
            }}
          >
            <IconButton
              icon="chevron-back"
              accessibilityLabel={t.route.backToRoute}
              onPress={back}
            />
          </View>
          <View style={{ flex: 1, gap: theme.spacing['2xl'], justifyContent: 'space-between' }}>
            {body}
            <Button
              label={t.route.backToRoute}
              size="lg"
              onPress={back}
              style={{ maxWidth: 360 }}
            />
          </View>
        </View>
      </Page>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: HERO_HEIGHT, backgroundColor: tone }}>
          <IconButton
            icon="chevron-back"
            accessibilityLabel={t.route.backToRoute}
            onPress={back}
            style={{
              position: 'absolute',
              top: insets.top + theme.spacing.md,
              left: theme.spacing.xl,
            }}
          />
        </View>
        <View
          style={{
            flexGrow: 1,
            marginTop: -theme.spacing['2xl'],
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            backgroundColor: theme.colors.background,
            padding: theme.spacing.xl,
            paddingTop: theme.spacing['2xl'],
          }}
        >
          {body}
        </View>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.md,
          paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
        }}
      >
        <Button label={t.route.backToRoute} size="lg" onPress={back} />
      </View>
    </View>
  );
}
