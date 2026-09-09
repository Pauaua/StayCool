import React, { useEffect } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { useDashboardSummary } from "@/features/home/hooks/useDashboard";
import { useSyncReminders } from "@/features/home/hooks/useProfile";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useSyncMooney } from "@/features/premium/hooks/useMooney";
import { PremiumStar } from "@/features/premium/components/PremiumBadge";
import { useGoToWelcome } from "@/navigation/WelcomeNavigationContext";
import { ReminderSettings } from "@/features/home/components/ReminderSettings";
import { useT } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<HomeStackParamList, "HomeDashboard">;

export function HomeScreen({ navigation }: Props) {
  const { session } = useAuth();
  const goToWelcome = useGoToWelcome();
  const { t } = useT();
  const { data, isLoading } = useDashboardSummary();
  useSyncReminders();
  const { isFull } = usePremium();
  const name = session?.user.user_metadata?.display_name as string | undefined;

  // sync_mooney() es idempotente y re-deriva todo del lado del servidor, así
  // que es seguro dispararla cada vez que se abre Home (cubre el caso común
  // de "abrí la app y ya había hecho registros hoy").
  const syncMooney = useSyncMooney();
  useEffect(() => {
    if (isFull) syncMooney.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFull]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark">
      <ScrollView className="px-5 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable onPress={goToWelcome} className="flex-row items-center mb-2" hitSlop={8}>
          <Text className="text-xl text-brand-500">‹</Text>
          <Text className="text-sm text-brand-500 ml-1">{t("home.back")}</Text>
        </Pressable>

        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-3xl font-bold text-surface-dark dark:text-white">
            {t("home.greeting", { name: name ? `, ${name}` : "" })}
            {isFull ? <PremiumStar size={22} /> : null}
          </Text>
          <Pressable onPress={() => navigation.navigate("Settings")}>
            <Text className="text-2xl">⚙️</Text>
          </Pressable>
        </View>
        <Text className="text-gray-500 mb-6">{format(new Date(), "EEEE dd MMMM")}</Text>

        {isLoading ? (
          <Text className="text-gray-400">{t("home.loadingDay")}</Text>
        ) : (
          <View className="gap-3">
            <Card>
              <Text className="text-sm text-gray-500">{t("home.hygieneToday")}</Text>
              <Text className="text-xl font-semibold text-surface-dark dark:text-white">
                {data?.pendingHygieneItems === 0
                  ? t("home.hygieneAllDone")
                  : t("home.hygienePending", {
                      pending: String(data?.pendingHygieneItems),
                      total: String(data?.totalHygieneItems),
                    })}
              </Text>
            </Card>

            <Card>
              <Text className="text-sm text-gray-500">{t("home.nextActivity")}</Text>
              <Text className="text-xl font-semibold text-surface-dark dark:text-white">
                {data?.nextActivity
                  ? `${data.nextActivity.title ?? t("home.nextActivityUntitled")} · ${format(
                      new Date(data.nextActivity.scheduled_at),
                      "dd MMM HH:mm"
                    )}`
                  : t("home.nextActivityNone")}
              </Text>
            </Card>

            <Card>
              <Text className="text-sm text-gray-500">{t("home.expenseToday")}</Text>
              <Text className="text-xl font-semibold text-brand-500">
                ${data?.todayExpenseTotal.toFixed(2) ?? "0.00"}
              </Text>
            </Card>

            {data?.needsMakeupRemoval ? (
              <Card className="bg-accent-coral/10 border border-accent-coral">
                <Text className="text-accent-coral font-semibold">{t("home.makeupReminder")}</Text>
              </Card>
            ) : null}
          </View>
        )}

        <ReminderSettings />
      </ScrollView>
    </SafeAreaView>
  );
}
