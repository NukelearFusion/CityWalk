import { ScrollView, View } from 'react-native';
import { Chip } from '@/components/ui/chip';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import type { Interest } from '@/types/domain';

/** The interests offered as shortcuts; "Mixed" only makes sense inside the wizard. */
const SHORTCUTS: Interest[] = ['SIGHTSEEING', 'FOOD', 'ENTERTAINMENT', 'NATURE'];

export interface InterestChipsProps {
  onSelect: (interest: Interest) => void;
  /** Wraps onto several lines instead of scrolling sideways (wide screens). */
  wrap?: boolean;
  /** Negative margin that lets the scrolling row bleed to the screen edges. */
  bleed?: number;
}

export function InterestChips({ onSelect, wrap = false, bleed = 0 }: InterestChipsProps) {
  const theme = useTheme();
  const { t } = useI18n();

  const chips = SHORTCUTS.map((interest) => (
    <Chip key={interest} label={t.interests[interest].short} onPress={() => onSelect(interest)} />
  ));

  if (wrap) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>{chips}</View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -bleed }}
      contentContainerStyle={{ paddingHorizontal: bleed, gap: theme.spacing.sm }}
    >
      {chips}
    </ScrollView>
  );
}
