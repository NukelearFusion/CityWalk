import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme';
import type { RouteStop } from '@/types/domain';

export interface StopItemProps {
  stop: RouteStop;
  /** Hides the connecting line below the last entry. */
  isLast: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}

const MARKER_SIZE = 28;

/**
 * One entry of the route itinerary, drawn as a numbered timeline
 * (spec 4.1.5 — View Route Stops).
 */
export function StopItem({ stop, isLast, isSelected = false, onPress }: StopItemProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${stop.position}. ${stop.name}`}
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: theme.spacing.lg,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {/* Timeline gutter: numbered marker plus the connector to the next stop. */}
      <View style={{ alignItems: 'center', width: MARKER_SIZE }}>
        <View
          style={{
            width: MARKER_SIZE,
            height: MARKER_SIZE,
            borderRadius: theme.radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSelected ? theme.colors.accent : theme.colors.accentSoft,
          }}
        >
          <Text variant="label" color={isSelected ? 'onAccent' : 'accent'}>
            {stop.position}
          </Text>
        </View>

        {!isLast ? (
          <View style={{ flex: 1, width: 2, backgroundColor: theme.colors.border }} />
        ) : null}
      </View>

      <View style={{ flex: 1, paddingBottom: isLast ? 0 : theme.spacing['2xl'], gap: 2 }}>
        <Text variant="bodyStrong">{stop.name}</Text>
        {stop.description ? (
          <Text variant="caption" color="textMuted">
            {stop.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
