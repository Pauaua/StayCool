import React from "react";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { useTodayStats } from "@/features/estadisticas/hooks/useEstadisticas";
import { DayStatsView, hasAnyDayData } from "@/features/estadisticas/components/DayStatsView";
import { useT } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EstadisticasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<EstadisticasStackParamList, "EstadisticasHoy">;

export function EstadisticasHoyScreen({ navigation }: Props) {
  const { data, isLoading } = useTodayStats();
  const { t } = useT();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Pressable onPress={() => navigation.goBack()} className="flex-row items-center mb-2" hitSlop={8}>
        <Text className="text-xl text-brand-500">‹</Text>
        <Text className="text-sm text-brand-500 ml-1">{t("estadisticas.back")}</Text>
      </Pressable>

      <View className="flex-row items-center mb-1">
        <Image
          source={require("../../../../assets/images/estadisticas.png")}
          style={{ width: 48, height: 48, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-surface-dark dark:text-white">
          {t("estadisticas.todayTitle")}
        </Text>
      </View>
      <Text className="text-sm text-gray-500 mb-4">
        {t("estadisticas.todaySubtitle", { date: format(new Date(), "EEEE dd MMMM") })}
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {isLoading || !data ? (
          <View className="items-center py-16">
            <ActivityIndicator color="#002054" size="large" />
          </View>
        ) : !hasAnyDayData(data) ? (
          <Card className="items-center py-8">
            <Text className="text-gray-500 text-center">{t("estadisticas.noData")}</Text>
          </Card>
        ) : (
          <DayStatsView data={data} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
