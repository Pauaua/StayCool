import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { RootNavigator } from "@/navigation/RootNavigator";
import { initSentry } from "@/lib/sentry";
import { initAnalytics } from "@/analytics/posthog";
import { initRevenueCat } from "@/lib/revenuecat";
import { PremiumProvider } from "@/features/premium/hooks/usePremium";
import { ensureNotificationPermissions } from "@/notifications/notifications";

initSentry();

export default function App() {
  useEffect(() => {
    initAnalytics();
    initRevenueCat();
    ensureNotificationPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PremiumProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </PremiumProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
