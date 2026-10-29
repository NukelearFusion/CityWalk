import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme';

export interface StopNumberProps {
  position: number;
  size?: number;
  /** White ring, used where the marker sits on a map or a coloured surface. */
  ringed?: boolean;
}

/** Terracotta numbered disc — the same mark in lists and on the map. */
export function StopNumber({ position, size = 28, ringed = false }: StopNumberProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.cta,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ringed ? 2 : 0,
        borderColor: theme.colors.surface,
      }}
    >
      <Text
        variant="bodyStrong"
        color="onCta"
        style={{ fontSize: size * 0.46, lineHeight: size * 0.6 }}
      >
        {position}
      </Text>
    </View>
  );
}
