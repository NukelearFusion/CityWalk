import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RouteMap } from '@/components/route-map';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { formatHours } from '@/lib/format';
import { isHovered } from '@/lib/interaction';
import { walkingDirectionsUrl } from '@/lib/maps-link';
import { stopPrice } from '@/lib/stop-format';
import { layout, useTheme } from '@/theme';
import type { Itinerary } from '@/types/itinerary';

const SIDE_PANEL = 400;
/** Height the phone bottom sheet covers, so the map keeps markers above it. */
const SHEET_INSET = 290;

/**
 * Walking mode: the route on a full map with the current stop in a sheet
 * (phone) or a side panel (desktop), stepping through stops one by one.
 */
export function MapScreen({
  itinerary,
  initialIndex = 0,
}: {
  itinerary: Itinerary;
  initialIndex?: number;
}) {
  const theme = useTheme();
  const i18n = useI18n();
  const { t, format } = i18n;
  const router = useRouter();
  const { isWide, isDesktop } = useLayout();
  const insets = useSafeAreaInsets();

  const { stops } = itinerary;
  const [index, setIndex] = useState(Math.min(initialIndex, Math.max(0, stops.length - 1)));
  const [fitKey, setFitKey] = useState(0);
  const [following, setFollowing] = useState(initialIndex > 0);

  const current = stops[index];
  const next = stops[index + 1];
  const isLast = index >= stops.length - 1;

  const goTo = (target: number) => {
    setIndex(target);
    setFollowing(true);
  };

  const recenter = () => {
    setFollowing(false);
    setFitKey((key) => key + 1);
  };

  const openInMaps = () => {
    if (!current) return;
    // From the current stop to the end of the route.
    const url = walkingDirectionsUrl(stops.slice(index));
    const single = `https://www.google.com/maps/search/?api=1&query=${current.latitude},${current.longitude}`;
    void Linking.openURL(url && stops.length - index > 1 ? url : single);
  };

  const back = () => router.replace(itinerary.backHref as Href);

  const map = (
    <RouteMap
      points={stops}
      focusedId={following ? (current?.id ?? null) : null}
      onSelect={(point) => goTo(stops.findIndex((stop) => stop.id === point.id))}
      fitKey={fitKey}
      inset={isDesktop ? undefined : { top: insets.top + 56, bottom: SHEET_INSET }}
      style={{ flex: 1 }}
    />
  );

  const meta = current
    ? [
        current.address,
        current.visitMinutes ? formatHours(current.visitMinutes, i18n) : null,
        stopPrice(current, i18n),
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const panel = current ? (
    <View style={{ gap: theme.spacing.md }}>
      {/* One segment per stop; the ones walked so far are filled. */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
        {stops.map((stop, position) => (
          <View
            key={stop.id}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: position <= index ? theme.colors.accent : theme.colors.border,
            }}
          />
        ))}
      </View>

      <Text variant="eyebrow" color="eyebrow">
        {format(t.route.stopCounter, { position: index + 1, total: stops.length })}
        {current.walkMinutesFromPrevious
          ? ` · ${format(t.route.walk, { minutes: current.walkMinutesFromPrevious })}`
          : ''}
      </Text>

      <Pressable
        onPress={() => router.push(`${itinerary.backHref}/stop/${current.position}` as Href)}
        accessibilityRole="link"
        accessibilityLabel={`${t.route.details}: ${current.name}`}
        style={(state) => ({ opacity: state.pressed || isHovered(state) ? 0.7 : 1, gap: 2 })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <Text variant="title" style={{ flexShrink: 1 }}>
            {current.name}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </View>
        {meta ? (
          <Text variant="caption" color="textMuted">
            {meta}
          </Text>
        ) : null}
      </Pressable>

      <View
        style={{
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.background,
        }}
      >
        <Text variant="caption" color="textMuted">
          {next ? (
            <>
              {t.route.next}{' '}
              <Text variant="caption" style={{ fontFamily: theme.fonts.semibold }}>
                {next.name}
              </Text>
            </>
          ) : (
            t.route.lastStop
          )}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Button label={t.route.openInMaps} onPress={openInMaps} style={{ flex: 1 }} />
        <Button
          label={isLast ? t.route.finish : t.route.nextStop}
          variant="outline"
          onPress={isLast ? back : () => goTo(index + 1)}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  ) : null;

  const itineraryPill = (
    <Pressable
      onPress={back}
      accessibilityRole="button"
      accessibilityLabel={t.route.backToRoute}
      style={(state) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        height: 44,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radius.full,
        backgroundColor: isHovered(state) ? theme.colors.surfaceMuted : theme.colors.surface,
        ...theme.elevation.card,
      })}
    >
      {isWide ? <Ionicons name="chevron-back" size={16} color={theme.colors.text} /> : null}
      <Text variant="bodyStrong">{t.route.itinerary}</Text>
    </Pressable>
  );

  const recenterButton = (
    <IconButton icon="locate-outline" accessibilityLabel={t.route.recenter} onPress={recenter} />
  );

  if (isDesktop) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          paddingTop: layout.headerHeight,
          backgroundColor: theme.colors.background,
        }}
      >
        <View style={{ flex: 1 }}>
          {map}
          <View
            style={{
              position: 'absolute',
              top: theme.spacing.lg,
              left: theme.spacing.lg,
              right: theme.spacing.lg,
              flexDirection: 'row',
              justifyContent: 'space-between',
              zIndex: 1000,
            }}
          >
            {itineraryPill}
            {recenterButton}
          </View>
        </View>
        <View
          style={{
            width: SIDE_PANEL,
            padding: theme.spacing['2xl'],
            gap: theme.spacing.xl,
            backgroundColor: theme.colors.surface,
            borderLeftWidth: 1,
            borderLeftColor: theme.colors.border,
          }}
        >
          <View style={{ gap: 2 }}>
            <Text variant="caption" color="textMuted">
              {itinerary.cityName}
            </Text>
            <Text variant="heading">{itinerary.title}</Text>
          </View>
          {panel}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {map}

      <View
        style={{
          position: 'absolute',
          top: (isWide ? layout.headerHeight : insets.top) + theme.spacing.md,
          left: theme.spacing.lg,
          right: theme.spacing.lg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          zIndex: 1000,
        }}
      >
        {itineraryPill}
        {recenterButton}
      </View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius.xl,
          borderTopRightRadius: theme.radius.xl,
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.md,
          paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
          gap: theme.spacing.md,
          ...theme.elevation.raised,
        }}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.border,
          }}
        />
        {panel}
      </View>
    </View>
  );
}
