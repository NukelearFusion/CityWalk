import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '@/api/client';
import { useRegister, useSignIn } from '@/api/account';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { layout, useTheme } from '@/theme';
import { TextField } from './text-field';

const CARD_WIDTH = 460;
const MIN_PASSWORD = 8;

/** Sign in and Create account share one screen; `mode` picks the form. */
export function AuthScreen({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const theme = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { isWide, gutter } = useLayout();
  const insets = useSafeAreaInsets();
  const signIn = useSignIn();
  const signUp = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === 'sign-up';
  const busy = signIn.isPending || signUp.isPending;

  const done = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/saved');
  };

  const explain = (cause: unknown) => {
    if (cause instanceof ApiError) {
      if (cause.code === 'TWO_FACTOR') return t.auth.adminOnly;
      if (cause.status === 401) return t.auth.invalid;
      if (cause.status === 409) return t.auth.exists;
      if (cause.status === 400) return t.auth.weakPassword;
    }
    return t.auth.failed;
  };

  const submit = () => {
    setError(null);
    if (!email.trim() || !password || (isSignUp && !name.trim())) {
      setError(t.auth.missing);
      return;
    }
    if (isSignUp && password.length < MIN_PASSWORD) {
      setError(t.auth.weakPassword);
      return;
    }

    const request = isSignUp
      ? signUp.mutateAsync({ displayName: name.trim(), email: email.trim(), password })
      : signIn.mutateAsync({ email: email.trim(), password });
    request.then(done, (cause: unknown) => setError(explain(cause)));
  };

  const form = (
    <View style={{ gap: theme.spacing.xl }}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="display">{isSignUp ? t.auth.signUpTitle : t.auth.signInTitle}</Text>
        <Text variant="body" color="textMuted">
          {isSignUp ? t.auth.signUpSubtitle : t.auth.signInSubtitle}
        </Text>
      </View>

      <View style={{ gap: theme.spacing.lg }}>
        {isSignUp ? (
          <TextField
            label={t.auth.name}
            value={name}
            onChangeText={setName}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
          />
        ) : null}
        <TextField
          label={t.auth.email}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <TextField
          label={t.auth.password}
          hint={isSignUp ? t.auth.passwordHint : undefined}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          textContentType={isSignUp ? 'newPassword' : 'password'}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
      </View>

      {error ? (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button
        label={isSignUp ? t.auth.signUp : t.auth.signIn}
        size="lg"
        onPress={submit}
        disabled={busy}
      />

      <Pressable
        onPress={() => router.replace((isSignUp ? '/auth/sign-in' : '/auth/sign-up') as Href)}
        accessibilityRole="link"
        style={{ alignSelf: 'center', padding: theme.spacing.sm }}
      >
        <Text variant="bodyStrong" color="accent">
          {isSignUp ? t.auth.toSignIn : t.auth.toSignUp}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: isWide ? 'center' : 'flex-start',
          alignItems: 'center',
          paddingTop: isWide ? layout.headerHeight + theme.spacing['3xl'] : theme.spacing.lg,
          paddingBottom: Math.max(insets.bottom, theme.spacing['3xl']),
          paddingHorizontal: gutter,
        }}
      >
        <View
          style={[
            { width: '100%', maxWidth: CARD_WIDTH },
            isWide && {
              padding: theme.spacing['3xl'],
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              ...theme.elevation.card,
            },
          ]}
        >
          {form}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
