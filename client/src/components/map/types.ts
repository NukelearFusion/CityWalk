import type { StyleProp, ViewStyle } from 'react-native';

export interface MapPoint {
  id: string;
  position: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface RouteMapProps {
  points: MapPoint[];
  style?: StyleProp<ViewStyle>;
  /** Disables gestures for previews embedded in a scrolling screen. */
  interactive?: boolean;
  /** The map flies to this point; `null` shows the whole route. */
  focusedId?: string | null;
  onSelect?: (point: MapPoint) => void;
  /**
   * Space covered by overlays (bottom sheet, side panel), so fitting the route
   * keeps every marker in the visible part of the map.
   */
  inset?: { top?: number; right?: number; bottom?: number; left?: number };
  /** Changing this value re-fits the whole route (the "recenter" button). */
  fitKey?: number;
}
