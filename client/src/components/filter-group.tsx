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
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Horizontally scrolling single-choice filter row.
 * Generic over the option type so each group stays type-safe at the call site.
 */
export function FilterGroup<T>({ title, options, value, onChange }: FilterGroupProps<T>) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="label" color="textMuted" style={{ paddingHorizontal: theme.spacing.xl }}>
        {title.toUpperCase()}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, gap: theme.spacing.sm }}
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
