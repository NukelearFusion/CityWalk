import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme';
import type { RouteMapProps } from './route-map';

/**
 * Web fallback.
 *
 * `react-native-maps` is a native module with no browser implementation, so the
 * web build renders a placeholder instead of crashing. The real web client uses
 * MapLibre and is a separate application.
 */
export function RouteMap({ stops, style }: RouteMapProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
        },
        style,
      ]}
    >
      <Ionicons name="map-outline" size={28} color={theme.colors.textSubtle} />
      <Text variant="caption" color="textMuted">
        {stops.length > 0 ? `${stops.length} × 📍` : '—'}
      </Text>
    </View>
  );
}
