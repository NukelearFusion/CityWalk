import { useEffect, useMemo } from 'react';
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
import { I18nProvider } from '@/i18n';
import { useTheme } from '@/theme';

// Text set before the fonts arrive would flash in the system face and then jump.
void SplashScreen.preventAutoHideAsync();

/** Screens rendered by the navigator, styled from the design tokens. */
function RootNavigator() {
  const theme = useTheme();

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontFamily: theme.fonts.semibold, fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="city/[slug]" options={{ title: '' }} />
        <Stack.Screen name="route/[slug]" options={{ title: '' }} />
      </Stack>
    </>
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
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
        </I18nProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
