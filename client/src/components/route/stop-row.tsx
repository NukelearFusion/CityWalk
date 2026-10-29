import { View } from 'react-native';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Tile } from '@/components/ui/tile';
import { useTheme, type TileTone } from '@/theme';
import { StopNumber } from './stop-number';

export interface StopRowProps {
  position: number;
  name: string;
  /** "Sightseeing · 45 min" */
  meta: string;
  /** "Free", "~40 zł"; omitted when the cost is unknown. */
  price?: string;
  tone: TileTone;
  selected?: boolean;
  onPress?: () => void;
}

/** One stop of an itinerary: number, tile, name and meta, price on the right. */
export function StopRow({ position, name, meta, price, tone, selected, onPress }: StopRowProps) {
  const theme = useTheme();

  return (
    <Card
      onPress={onPress}
      selected={selected}
      accessibilityLabel={`${position}. ${name}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
      }}
    >
      <StopNumber position={position} />
      <Tile tone={tone} size={52} />

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="heading" numberOfLines={2}>
          {name}
        </Text>
        {meta ? (
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>

      {price ? <Text variant="bodyStrong">{price}</Text> : null}
    </Card>
  );
}
