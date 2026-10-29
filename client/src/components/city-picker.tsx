import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '@/components/ui/text';
import { useCities } from '@/api/queries';
import { useSelectedCity } from '@/context/city';
import { useI18n } from '@/i18n';
import { isHovered } from '@/lib/interaction';
import { useTheme } from '@/theme';

/** Two-letter label used in the pill ("Poznań, PL"). */
function countryCode(country: string): string {
  return country === 'Polska' || country === 'Poland' ? 'PL' : country.slice(0, 2).toUpperCase();
}

/** The "Poznań, PL ⌄" pill and the list it opens. */
export function CityPicker() {
  const theme = useTheme();
  const { t } = useI18n();
  const { city, setSlug } = useSelectedCity();
  const { data } = useCities();
  const [open, setOpen] = useState(false);

  const label = city ? `${city.name}, ${countryCode(city.country)}` : t.common.chooseCity;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${t.common.chooseCity}: ${label}`}
        style={(state) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          paddingHorizontal: theme.spacing.lg,
          height: 40,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: isHovered(state) ? theme.colors.accent : theme.colors.border,
          ...theme.elevation.card,
        })}
      >
        <Text variant="bodyStrong">{label}</Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          accessibilityLabel={t.common.close}
          style={{
            flex: 1,
            backgroundColor: 'rgba(30, 30, 28, 0.35)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.xl,
          }}
        >
          <Pressable
            // Stops a tap on the sheet itself from closing it.
            onPress={() => undefined}
            style={{
              width: '100%',
              maxWidth: 380,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              gap: theme.spacing.xs,
              ...theme.elevation.raised,
            }}
          >
            <Text variant="title" style={{ padding: theme.spacing.sm }}>
              {t.common.chooseCity}
            </Text>

            {(data ?? []).map((item) => {
              const active = item.slug === city?.slug;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setSlug(item.slug);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={(state) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: theme.spacing.md,
                    borderRadius: theme.radius.md,
                    backgroundColor:
                      active || isHovered(state) ? theme.colors.accentSoft : 'transparent',
                  })}
                >
                  <View>
                    <Text variant="bodyStrong">{item.name}</Text>
                    <Text variant="caption" color="textMuted">
                      {item.country}
                    </Text>
                  </View>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.accent} />
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
