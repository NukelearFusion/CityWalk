import { ScrollView, View } from 'react-native';
import { Chip } from '@/components/ui/chip';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme';

export interface FilterOption<T> {
  value: T;
  label: string;
}

export interface FilterGroupProps<T> {
  title: string;
  /** Page gutter: the row scrolls edge to edge while its content stays aligned. */
  bleed?: number;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Horizontally scrolling single-choice filter row.
 * Generic over the option type so each group stays type-safe at the call site.
 */
export function FilterGroup<T>({
  title,
  bleed = 0,
  options,
  value,
  onChange,
}: FilterGroupProps<T>) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="label" color="textMuted">
        {title}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -bleed }}
        contentContainerStyle={{ paddingHorizontal: bleed, gap: theme.spacing.sm }}
      >
        {options.map((option) => (
          <Chip
            key={String(option.value)}
            label={option.label}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
