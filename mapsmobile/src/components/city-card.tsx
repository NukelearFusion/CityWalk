import { View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import type { City } from '@/types/domain';

export interface CityCardProps {
  city: City;
}

const THUMB_SIZE = 72;

export function CityCard({ city }: CityCardProps) {
  const theme = useTheme();
  const { t, plural } = useI18n();
  const router = useRouter();

  return (
    <Card
      onPress={() => router.push(`/city/${city.slug}`)}
      accessibilityLabel={city.name}
      style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, gap: theme.spacing.lg }}
    >
      {city.coverImageUrl ? (
        <Image
          source={{ uri: city.coverImageUrl }}
          style={{ width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: theme.radius.md }}
          contentFit="cover"
          transition={180}
          accessible={false}
        />
      ) : (
        <View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="map-outline" size={28} color={theme.colors.accentSoftText} />
        </View>
      )}

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="heading" numberOfLines={1}>
          {city.name}
        </Text>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {city.country}
        </Text>
        <Text variant="caption" color="accent">
          {plural(t.cities.routeCount, city.routeCount)}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSubtle} />
    </Card>
  );
}
