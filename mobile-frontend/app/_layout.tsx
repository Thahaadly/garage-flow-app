import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getToken, getRole } from '@/src/lib/token';
import { VehicleProvider } from '@/src/context/VehicleContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = await getToken();
      const role = await getRole();
      const isOnLogin = segments[0] === 'login';

      if (!token && !isOnLogin) {
        router.replace('/login');
      }

      if (token && isOnLogin) {
        if (role === 'Mekanik' || role === 'Admin') {
            router.replace('/(mechanic)');
        } else {
            router.replace('/(tabs)');
        }
      }

      if (isMounted) {
        setIsReady(true);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [segments]);

  if (!isReady) {
    return null;
  }

  return (
    <VehicleProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="payment" options={{ title: 'Pembayaran' }} />
          <Stack.Screen name="service/[id]" options={{ title: 'Booking Servis' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(mechanic)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </VehicleProvider>
  );
}
