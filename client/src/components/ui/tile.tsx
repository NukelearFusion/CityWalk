import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, type TileTone } from '@/theme';

export interface TileProps {
  tone: TileTone;
  size: number;
  /** Overrides the default corner radius, e.g. for full-bleed headers. */
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * Pastel square standing in for a photograph. The tone encodes the kind of
 * place, so a list of stops is readable at a glance even without images.
 */
export function Tile({ tone, size, radius, style, children }: TileProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius ?? theme.radius.md,
          backgroundColor: theme.tiles[tone],
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
