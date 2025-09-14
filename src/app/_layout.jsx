import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import syncService from "@/services/syncService";
import { Toaster } from 'sonner-native';
import SyncIndicator from "@/components/SyncIndicator";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      // Run sync in the background without blocking the UI.
      syncService.autoSync().catch(error => {
        console.error('Auto-sync failed in background:', error);
      });

      // Set ready status
      setIsReady(true);
    };

    initialize();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null; // Show splash screen until ready
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <SafeAreaView style={{ flex: 1 }}>
                <Toaster position="bottom-right" richColors />
                <>
                  <SyncIndicator />
                  <Stack
                    screenOptions={{ headerShown: false }}
                    initialRouteName="(tabs)"
                    defaultOptions={{
                      animation: 'slide_from_right',
                      gestureEnabled: true,
                    }}
                  >
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="story/[id]" />
                    <Stack.Screen name="category/[id]" />
                    <Stack.Screen name="about" />
                  </Stack>
                </>
              </SafeAreaView>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
