import { useMemo, useRef } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type MapMarker } from 'react-native-maps';
import { regionForPoints } from '@/lib/geo';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui/text';
import type { RouteStop } from '@/types/domain';

export interface RouteMapProps {
  stops: RouteStop[];
  style?: StyleProp<ViewStyle>;
  /** Disables gestures for preview maps embedded in a scrolling screen. */
  interactive?: boolean;
  /** Stop currently selected elsewhere on the screen; its callout is opened. */
  focusedStopId?: string | null;
  onSelectStop?: (stop: RouteStop) => void;
}

/**
 * Route geometry on an interactive map (spec 4.1.6, 4.1.8 – 4.1.10).
 *
 * Android is pinned to the Google provider so the map looks the same on every
 * device; iOS keeps Apple Maps, which needs no API key.
 */
export function RouteMap({
  stops,
  style,
  interactive = true,
  focusedStopId = null,
  onSelectStop,
}: RouteMapProps) {
  const theme = useTheme();
  const markerRefs = useRef(new Map<string, MapMarker>());

  const region = useMemo(() => regionForPoints(stops), [stops]);
  const path = useMemo(
    () => stops.map(({ latitude, longitude }) => ({ latitude, longitude })),
    [stops],
  );

  if (!region) {
    return (
      <View
        style={[
          {
            backgroundColor: theme.colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Text variant="caption" color="textMuted">
          —
        </Text>
      </View>
    );
  }

  return (
    <MapView
      style={style}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={region}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      showsPointsOfInterests={false}
    >
      <Polyline
        coordinates={path}
        strokeColor={theme.colors.accent}
        strokeWidth={4}
        lineCap="round"
        lineJoin="round"
      />

      {stops.map((stop) => (
        <Marker
          key={stop.id}
          ref={(instance) => {
            if (instance) markerRefs.current.set(stop.id, instance);
            else markerRefs.current.delete(stop.id);
          }}
          coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
          title={`${stop.position}. ${stop.name}`}
          description={stop.description}
          pinColor={stop.id === focusedStopId ? theme.colors.accentPressed : theme.colors.accent}
          onPress={() => onSelectStop?.(stop)}
        />
      ))}
    </MapView>
  );
}
