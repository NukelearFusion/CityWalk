import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './text';

export interface BadgeProps {
  label: string;
  /** `cta` — blush fill with terracotta text ("Example"); `neutral` — muted fill. */
  tone?: 'cta' | 'neutral';
}

export function Badge({ label, tone = 'cta' }: BadgeProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: theme.spacing.sm + 2,
        paddingVertical: 3,
        borderRadius: theme.radius.full,
        backgroundColor: tone === 'cta' ? theme.tiles.blush : theme.colors.surfaceMuted,
      }}
    >
      <Text
        variant="caption"
        color={tone === 'cta' ? 'eyebrow' : 'textMuted'}
        style={{ fontFamily: theme.fonts.semibold }}
      >
        {label}
      </Text>
    </View>
  );
}
