import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Tile } from '@/components/ui/tile';
import { useI18n } from '@/i18n';
import { cityTone } from '@/lib/tone';
import { useTheme } from '@/theme';
import type { City } from '@/types/domain';

export interface CityCardProps {
  city: City;
}

export function CityCard({ city }: CityCardProps) {
  const theme = useTheme();
  const { t, plural } = useI18n();
  const router = useRouter();

  return (
    <Card
      onPress={() => router.push(`/city/${city.slug}`)}
      accessibilityLabel={city.name}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        gap: theme.spacing.lg,
      }}
    >
      <Tile tone={cityTone(city.slug)} size={56}>
        <Text variant="title" color="accent">
          {city.name.charAt(0)}
        </Text>
      </Tile>

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="heading" numberOfLines={1}>
          {city.name}
        </Text>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {city.country} · {plural(t.cities.routeCount, city.routeCount)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
    </Card>
  );
}
