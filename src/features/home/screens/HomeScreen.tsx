import React from "react";
import { Alert, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { BottomIconBar } from "@/components/ui/BottomIconBar";
import { useDashboardSummary } from "@/features/home/hooks/useDashboard";
import { useSyncReminders } from "@/features/home/hooks/useProfile";
import { useAuth } from "@/features/auth/hooks/useAuth";
// import { usePremium } from "@/features/premium/hooks/usePremium";
// import { useSyncMooney } from "@/features/premium/hooks/useMooney";
import { useGoToWelcome } from "@/navigation/WelcomeNavigationContext";
import { ReminderSettings } from "@/features/home/components/ReminderSettings";
import { WeekStrip } from "@/features/home/components/WeekStrip";
import { requestOpenModule } from "@/notifications/diva/events";
import { useT } from "@/lib/i18n";
import { colors } from "@/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<HomeStackParamList, "HomeDashboard">;

export function HomeScreen({ navigation }: Props) {
  const { session, signOut } = useAuth();
  const goToWelcome = useGoToWelcome();
  const { t, tg, lang } = useT();
  const { data, isLoading } = useDashboardSummary();
  useSyncReminders();
  // const { isFull } = usePremium();
  const name = session?.user.user_metadata?.display_name as string | undefined;

  // Sparkless/MOOney: deshabilitado a propósito (no se suman monedas).
  // sync_mooney() es idempotente y re-deriva todo del lado del servidor, así
  // que es seguro dispararla cada vez que se abre Home (cubre el caso común
  // de "abrí la app y ya había hecho registros hoy").
  // const syncMooney = useSyncMooney();
  // useEffect(() => {
  //   if (isFull) syncMooney.mutate();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isFull]);

  function handleSignOut() {
    Alert.alert(t("common.confirmSignOutTitle"), tg("common.confirmSignOutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.signOut"), style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="flex-row justify-between items-center mb-4">
          <Heading className="flex-1 pr-3" style={{ fontSize: 30, lineHeight: 36 }}>
            {t("home.greeting", { name: name ? `, ${name}` : "" })}
          </Heading>
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            hitSlop={8}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: colors.ink,
              backgroundColor: colors.white,
            }}
            className="items-center justify-center"
          >
            <Image
              source={require("../../../../assets/images/tuerca.png")}
              style={{ width: 34, height: 34 }}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <WeekStrip />

        <Heading className="mt-6 mb-3" style={{ fontSize: 22 }}>
          {t("home.reminders")}
        </Heading>

        {isLoading ? (
          <Text className="text-ink/60">{t("home.loadingDay")}</Text>
        ) : (
          <View style={{ gap: 12 }}>
            <View className="flex-row" style={{ gap: 12 }}>
              <Card delay={60} className="flex-1 justify-between">
                <View>
                  <Text className="text-sm font-semibold text-ink">{t("home.hygieneToday")}</Text>
                  <Text className="mt-1 text-base text-ink">
                    {data?.pendingHygieneItems === 0
                      ? t("home.hygieneAllDone")
                      : t("home.hygienePending", {
                          pending: String(data?.pendingHygieneItems),
                          total: String(data?.totalHygieneItems),
                        })}
                  </Text>
                </View>
                <View className="mt-3">
                  <Button size="sm" label={t("home.review")} onPress={() => requestOpenModule("Higiene")} />
                </View>
              </Card>

              <Card delay={140} className="flex-1 justify-between">
                <View>
                  <Text className="text-sm font-semibold text-ink">{t("home.nextActivity")}</Text>
                  {data?.nextActivity ? (
                    <>
                      <Text className="mt-1 text-base font-semibold text-ink">
                        {format(new Date(data.nextActivity.scheduled_at), "dd MMM · HH:mm", {
                          locale: lang === "en" ? enUS : es,
                        })}
                      </Text>
                      <Text className="text-sm text-ink/80" numberOfLines={2}>
                        {data.nextActivity.title ?? t("home.nextActivityUntitled")}
                      </Text>
                    </>
                  ) : (
                    <Text className="mt-1 text-base text-ink">{t("home.nextActivityNone")}</Text>
                  )}
                </View>
                <View className="mt-3">
                  <Button size="sm" label={t("home.seeMore")} onPress={() => requestOpenModule("Social")} />
                </View>
              </Card>
            </View>

            <Card delay={220}>
              <Text className="text-sm font-semibold text-ink">{t("home.expenseToday")}</Text>
              <Text className="text-xl font-semibold text-ink">
                ${data?.todayExpenseTotal.toFixed(2) ?? "0.00"}
              </Text>
            </Card>

            {data?.needsMakeupRemoval ? (
              <Card delay={300} className="bg-accent-coral/10 border border-accent-coral">
                <Text className="text-accent-coral font-semibold">{t("home.makeupReminder")}</Text>
              </Card>
            ) : null}
          </View>
        )}

        <ReminderSettings />
      </ScrollView>

      <BottomIconBar
        items={[
          {
            key: "signOut",
            label: t("common.signOut"),
            icon: require("../../../../assets/images/log out.png"),
            onPress: handleSignOut,
          },
          {
            key: "home",
            label: t("welcome.navHome"),
            icon: require("../../../../assets/images/home.png"),
            onPress: goToWelcome,
          },
          {
            key: "agenda",
            label: t("welcome.navAgenda"),
            icon: require("../../../../assets/images/Logo.png"),
            onPress: () => requestOpenModule("Agenda"),
            active: true,
            fill: true,
          },
        ]}
      />
    </SafeAreaView>
  );
}
