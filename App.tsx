import React, { useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import {
  RethinkSans_400Regular,
  RethinkSans_600SemiBold,
  RethinkSans_700Bold,
} from "@expo-google-fonts/rethink-sans";
import { Parisienne_400Regular } from "@expo-google-fonts/parisienne";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { RootNavigator } from "@/navigation/RootNavigator";
import { initSentry } from "@/lib/sentry";
import { initAnalytics } from "@/analytics/posthog";
import { initRevenueCat } from "@/lib/revenuecat";
import { PremiumProvider } from "@/features/premium/hooks/usePremium";
import { ensureNotificationPermissions } from "@/notifications/notifications";
import { SparkleOverlay } from "@/components/ui/SparkleOverlay";

initSentry();
// Debe correr a nivel de módulo, no en un useEffect de App: PremiumProvider
// es un componente hijo, y los useEffect de los hijos corren ANTES que los
// del padre. Si initRevenueCat() estuviera en el useEffect de App, el
// primer getCustomerInfo() de PremiumProvider dispararía contra el SDK
// todavía sin configurar (Purchases.configure() no habría corrido aún),
// tirando un error de "no hay singleton" al intentar hacer fetch.
initRevenueCat();

export default function App() {
  const [fontsLoaded] = useFonts({
    RethinkSans_400Regular,
    RethinkSans_600SemiBold,
    RethinkSans_700Bold,
    Parisienne_400Regular,
  });

  useEffect(() => {
    initAnalytics();
    ensureNotificationPermissions();
  }, []);

  if (!fontsLoaded) {
    return <View className="flex-1 bg-white dark:bg-surface-dark" />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PremiumProvider>
            <StatusBar style="auto" />
            <RootNavigator />
            <SparkleOverlay />
          </PremiumProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
