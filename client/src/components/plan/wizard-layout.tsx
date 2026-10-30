import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useSelectedCity } from '@/context/city';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { layout, useTheme } from '@/theme';

export interface WizardLayoutProps {
  step: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Line above the button ("2 selected: Sightseeing, Food"). */
  note?: string;
  /** Red line above the button when the last attempt failed. */
  error?: string;
  action: { label: string; onPress: () => void; busy?: boolean };
}

const CARD_WIDTH = 640;

/** One planner step: progress header, question, options, the button at the bottom. */
export function WizardLayout({
  step,
  title,
  subtitle,
  children,
  note,
  error,
  action,
}: WizardLayoutProps) {
  const theme = useTheme();
  const { t, format } = useI18n();
  const { city } = useSelectedCity();
  const { isWide, gutter } = useLayout();
  const insets = useSafeAreaInsets();

  const header = (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="bodyStrong" style={{ fontSize: 13 }}>
        {format(t.plan.stepOf, { step, city: city?.name ?? '' })}
      </Text>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.colors.border }}>
        <View
          style={{
            width: `${(step / 4) * 100}%`,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.accent,
          }}
        />
      </View>
    </View>
  );

  const footer = (
    <View style={{ gap: theme.spacing.md }}>
      {error ? (
        <Text variant="caption" color="danger" align="center">
          {error}
        </Text>
      ) : note ? (
        <Text variant="caption" color="textMuted" align="center">
          {note}
        </Text>
      ) : null}
      <Button
        label={action.busy ? t.plan.generating : action.label}
        size="lg"
        onPress={action.onPress}
        disabled={action.busy}
      />
    </View>
  );

  const body = (
    <View style={{ gap: theme.spacing.xl }}>
      {header}
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="display">{title}</Text>
        <Text variant="body" color="textMuted">
          {subtitle}
        </Text>
      </View>
      {children}
    </View>
  );

  if (isWide) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{
          paddingTop: layout.headerHeight + theme.spacing['3xl'],
          paddingBottom: theme.spacing['4xl'],
          paddingHorizontal: gutter,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: CARD_WIDTH,
            padding: theme.spacing['3xl'],
            gap: theme.spacing['2xl'],
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...theme.elevation.card,
          }}
        >
          {body}
          {footer}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          // The stack header above already clears the status bar.
          paddingTop: theme.spacing.sm,
          paddingHorizontal: gutter,
          paddingBottom: theme.spacing['2xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {body}
      </ScrollView>
      <View
        style={{
          paddingHorizontal: gutter,
          paddingTop: theme.spacing.md,
          paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
        }}
      >
        {footer}
      </View>
    </View>
  );
}
