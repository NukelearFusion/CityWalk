import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { WizardLayout } from '@/components/plan/wizard-layout';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { Tile } from '@/components/ui/tile';
import { useCities } from '@/api/queries';
import { useSelectedCity } from '@/context/city';
import { useI18n } from '@/i18n';
import { cityTone } from '@/lib/tone';
import { useTheme } from '@/theme';

/** Planner step 1: the city. */
export default function PlanCityStep() {
  const theme = useTheme();
  const { t, plural } = useI18n();
  const router = useRouter();
  const { slug, setSlug } = useSelectedCity();
  const cities = useCities();

  return (
    <WizardLayout
      step={1}
      title={t.plan.cityTitle}
      subtitle={t.plan.citySubtitle}
      action={{ label: t.plan.continue, onPress: () => router.push('/plan/interests') }}
    >
      {cities.isPending ? (
        <LoadingState />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          {(cities.data ?? []).map((city) => {
            const selected = city.slug === slug;
            return (
              <Card
                key={city.id}
                selected={selected}
                onPress={() => setSlug(city.slug)}
                accessibilityLabel={city.name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.lg,
                  padding: theme.spacing.md,
                }}
              >
                <Tile tone={cityTone(city.slug)} size={56}>
                  <Text variant="title" color="accent">
                    {city.name.charAt(0)}
                  </Text>
                </Tile>
                <View style={{ flex: 1 }}>
                  <Text variant="heading">{city.name}</Text>
                  <Text variant="caption" color="textMuted">
                    {plural(t.cities.routeCount, city.routeCount)}
                  </Text>
                </View>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={26} color={theme.colors.accent} />
                ) : null}
              </Card>
            );
          })}
        </View>
      )}
    </WizardLayout>
  );
}
