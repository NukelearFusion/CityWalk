import { View } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import { NAV_ITEMS } from './nav-items';

/** Footer on wide web screens: brand line, the same nav, data credit. */
export function SiteFooter() {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <View
      style={{
        marginTop: theme.spacing['5xl'],
        paddingTop: theme.spacing['2xl'],
        paddingBottom: theme.spacing['3xl'],
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: theme.spacing.lg,
      }}
    >
      <View style={{ gap: 2 }}>
        <Text variant="title" color="accent" style={{ fontSize: 20 }}>
          Trasa
        </Text>
        <Text variant="caption" color="textMuted">
          {t.footer.tagline}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.xl }}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.name} href={item.href}>
            <Text variant="caption" color="textMuted">
              {item.label(t)}
            </Text>
          </Link>
        ))}
      </View>

      <Text variant="caption" color="textSubtle">
        {t.footer.mapCredit}
      </Text>
    </View>
  );
}
