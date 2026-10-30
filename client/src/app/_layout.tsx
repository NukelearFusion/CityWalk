import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { GlobalStyles } from '@/components/layout/global-styles';
import { HeaderScrollProvider } from '@/components/layout/header-scroll';
import { SiteHeader } from '@/components/layout/site-header';
import { CityProvider } from '@/context/city';
import { PlanProvider } from '@/context/plan';
import { useLayout } from '@/hooks/use-layout';
import { I18nProvider } from '@/i18n';
import { useTheme } from '@/theme';

// Text set before the fonts arrive would flash in the system face and then jump.
void SplashScreen.preventAutoHideAsync();

/**
 * Screens rendered by the navigator, styled from the design tokens.
 *
 * On wide web screens the site header replaces both the tab bar and the native
 * stack headers, so every page shares one piece of chrome.
 */
function RootNavigator() {
  const theme = useTheme();
  const { isWide } = useLayout();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="dark" />
      <GlobalStyles />
      <Stack
        screenOptions={{
          headerShown: !isWide,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.accent,
          headerTitleStyle: {
            fontFamily: theme.fonts.semibold,
            fontSize: 17,
            color: theme.colors.text,
          },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="city/[slug]" options={{ title: '' }} />
        <Stack.Screen name="route/[slug]/index" options={{ title: '' }} />
        <Stack.Screen name="route/[slug]/map" options={{ headerShown: false }} />
        <Stack.Screen name="route/[slug]/stop/[position]" options={{ headerShown: false }} />
        <Stack.Screen name="plan/city" options={{ title: '' }} />
        <Stack.Screen name="plan/interests" options={{ title: '' }} />
        <Stack.Screen name="plan/budget" options={{ title: '' }} />
        <Stack.Screen name="plan/time" options={{ title: '' }} />
        <Stack.Screen name="plan/route/index" options={{ title: '' }} />
        <Stack.Screen name="plan/route/map" options={{ headerShown: false }} />
        <Stack.Screen name="plan/route/stop/[position]" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-in" options={{ title: '' }} />
        <Stack.Screen name="auth/sign-up" options={{ title: '' }} />
      </Stack>
      {isWide ? <SiteHeader /> : null}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  // A font that fails to load must not keep the app behind the splash screen:
  // the system face is an acceptable fallback.
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Route content changes rarely; a minute of freshness avoids
            // refetching every time the user navigates back to a list.
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <CityProvider>
            <PlanProvider>
              <HeaderScrollProvider>
                <SafeAreaProvider>
                  <RootNavigator />
                </SafeAreaProvider>
              </HeaderScrollProvider>
            </PlanProvider>
          </CityProvider>
        </I18nProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
