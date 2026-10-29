import { useEffect, useMemo, useRef } from 'react';
import { Platform, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { StopNumber } from '@/components/route/stop-number';
import { regionForPoints } from '@/lib/geo';
import { useTheme } from '@/theme';
import { MUTED_MAP_STYLE } from './map/google-style';
import type { RouteMapProps } from './map/types';

export type { MapPoint, RouteMapProps } from './map/types';

const EDGE = 48;

/**
 * Route on an interactive native map (spec 4.1.6, 4.1.8 – 4.1.10): a dotted
 * green path through numbered terracotta stops.
 *
 * Android uses Google Maps with a muted style that matches the app's paper
 * tones; iOS keeps Apple Maps, which needs no API key.
 */
export function RouteMap({
  points,
  style,
  interactive = true,
  focusedId = null,
  onSelect,
  inset,
  fitKey = 0,
}: RouteMapProps) {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);

  const region = useMemo(() => regionForPoints(points), [points]);
  const path = useMemo(
    () => points.map(({ latitude, longitude }) => ({ latitude, longitude })),
    [points],
  );

  const padding = useMemo(
    () => ({
      top: EDGE + (inset?.top ?? 0),
      right: EDGE + (inset?.right ?? 0),
      bottom: EDGE + (inset?.bottom ?? 0),
      left: EDGE + (inset?.left ?? 0),
    }),
    [inset?.top, inset?.right, inset?.bottom, inset?.left],
  );

  // Whole route on first layout and whenever "recenter" is pressed.
  useEffect(() => {
    if (path.length === 0) return;
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(path, { edgePadding: padding, animated: fitKey > 0 });
    }, 250);
    return () => clearTimeout(timer);
  }, [fitKey, path, padding]);

  useEffect(() => {
    const target = points.find((point) => point.id === focusedId);
    if (!target) return;
    mapRef.current?.animateCamera(
      { center: { latitude: target.latitude, longitude: target.longitude }, zoom: 16 },
      { duration: theme.motion.slow },
    );
  }, [focusedId, points, theme.motion.slow]);

  if (!region) {
    return <View style={[{ backgroundColor: theme.colors.surfaceMuted }, style]} />;
  }

  return (
    <MapView
      ref={mapRef}
      style={style}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      customMapStyle={MUTED_MAP_STYLE}
      initialRegion={region}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      showsPointsOfInterests={false}
      mapPadding={inset ? { top: 0, right: 0, bottom: inset.bottom ?? 0, left: 0 } : undefined}
    >
      <Polyline
        coordinates={path}
        strokeColor={theme.colors.accent}
        strokeWidth={5}
        lineCap="round"
        lineJoin="round"
        lineDashPattern={[1, 10]}
      />

      {points.map((point) => (
        <Marker
          key={point.id}
          coordinate={{ latitude: point.latitude, longitude: point.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => onSelect?.(point)}
          accessibilityLabel={`${point.position}. ${point.name}`}
        >
          <StopNumber position={point.position} size={point.id === focusedId ? 40 : 32} ringed />
        </Marker>
      ))}
    </MapView>
  );
}
