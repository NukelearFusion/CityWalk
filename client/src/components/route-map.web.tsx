import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLayout } from '@/hooks/use-layout';
import { colors } from '@/theme';
import type { MapPoint, RouteMapProps } from './map/types';

export type { MapPoint, RouteMapProps } from './map/types';

/**
 * OpenStreetMap's standard tiles: no key, usable under the OSM tile policy
 * with attribution. A CSS filter (see GlobalStyles) mutes them towards the
 * app's sage and paper tones so the route carries the picture.
 */
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const EDGE = 48;

function markerIcon(point: MapPoint, focused: boolean): L.DivIcon {
  const size = focused ? 40 : 32;
  // The label goes into raw HTML, so only a whole number may reach it: a
  // tampered API response must not be able to inject markup.
  const label = Math.trunc(Number(point.position)) || 0;
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${colors.cta};
      border:2px solid #fff;box-sizing:border-box;display:flex;align-items:center;justify-content:center;
      font:600 ${Math.round(size * 0.44)}px DMSans_600SemiBold, system-ui, sans-serif;color:${colors.onCta};
      box-shadow:0 4px 12px rgba(31,40,32,0.18)">${label}</div>`,
  });
}

/**
 * Route on an interactive web map (spec 4.1.6, 4.1.8 – 4.1.10), drawn with
 * Leaflet: the same dotted green path and numbered terracotta stops as the
 * native map.
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
  // Phones zoom with gestures; the +/- buttons would sit under the overlays.
  const showZoom = useLayout().isDesktop;
  const containerRef = useRef<View>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  /** Fits the whole route into view; replaced whenever points or insets change. */
  const fitRef = useRef<(animate: boolean) => void>(() => undefined);
  // Markers are rebuilt only when points change; the latest handler is read through a ref.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Create the map once; React Native Web hands out the DOM node as the ref.
  useEffect(() => {
    const element = containerRef.current as unknown as HTMLElement | null;
    if (!element || mapRef.current) return;

    const map = L.map(element, {
      zoomControl: false,
      // Fractional zoom lets a route fill the map instead of the next whole level out.
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      keyboard: interactive,
      attributionControl: true,
    });
    L.tileLayer(TILE_URL, {
      attribution: ATTRIBUTION,
      maxZoom: 19,
      className: 'trasa-tiles',
    }).addTo(map);
    if (interactive && showZoom) L.control.zoom({ position: 'bottomright' }).addTo(map);
    map.attributionControl.setPrefix(false);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // The container is often still 0 px tall when the map is created; fitting
    // then picks a far-out zoom. Re-fit once it has a real size, and keep the
    // map in sync with later resizes.
    let fitted = false;
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      if (!fitted && element.clientHeight > 0) {
        fitted = true;
        fitRef.current(false);
      }
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // Interactivity is fixed for the life of a map instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Path and markers.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();

    const latLngs = points.map((point) => L.latLng(point.latitude, point.longitude));
    L.polyline(latLngs, {
      color: colors.accent,
      weight: 5,
      lineCap: 'round',
      dashArray: '1 11',
    }).addTo(layer);

    for (const point of points) {
      L.marker([point.latitude, point.longitude], {
        icon: markerIcon(point, point.id === focusedId),
        title: `${point.position}. ${point.name}`,
        keyboard: true,
        zIndexOffset: point.id === focusedId ? 1000 : 0,
      })
        .on('click', () => onSelectRef.current?.(point))
        .addTo(layer);
    }
  }, [points, focusedId]);

  // Whole route on first layout (see the resize observer) and on "recenter".
  useEffect(() => {
    fitRef.current = (animate) => {
      const map = mapRef.current;
      if (!map || points.length === 0) return;
      const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude]));
      map.fitBounds(bounds, {
        paddingTopLeft: L.point(EDGE + (inset?.left ?? 0), EDGE + (inset?.top ?? 0)),
        paddingBottomRight: L.point(EDGE + (inset?.right ?? 0), EDGE + (inset?.bottom ?? 0)),
        maxZoom: 16,
        animate,
      });
    };
  }, [points, inset?.top, inset?.right, inset?.bottom, inset?.left]);

  useEffect(() => {
    fitRef.current(fitKey > 0);
  }, [fitKey, points]);

  useEffect(() => {
    const map = mapRef.current;
    const target = points.find((point) => point.id === focusedId);
    if (!map || !target) return;
    map.flyTo([target.latitude, target.longitude], Math.max(map.getZoom(), 16), {
      duration: 0.6,
    });
  }, [focusedId, points]);

  return (
    <View
      ref={containerRef}
      style={[{ backgroundColor: colors.surfaceMuted, overflow: 'hidden', zIndex: 0 }, style]}
    />
  );
}
