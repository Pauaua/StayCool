import React, { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Text } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { endOfYear, format, startOfYear } from "date-fns";
import { Card } from "@/components/ui/Card";
import {
  useDayStats,
  useMonthDataDates,
  usePeriodStats,
} from "@/features/estadisticas/hooks/useEstadisticas";
import { PeriodStatsView } from "@/features/estadisticas/components/PeriodStatsView";
import { DayStatsView, hasAnyDayData } from "@/features/estadisticas/components/DayStatsView";
import { useT } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { EstadisticasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<EstadisticasStackParamList, "EstadisticasAnual">;

const todayIso = () => format(new Date(), "yyyy-MM-dd");

export function EstadisticasAnualScreen({ navigation }: Props) {
  const now = new Date();
  const from = format(startOfYear(now), "yyyy-MM-dd");
  const to = format(endOfYear(now), "yyyy-MM-dd");
  const { data, isLoading } = usePeriodStats(from, to);
  const { t } = useT();

  const [visibleMonth, setVisibleMonth] = useState(now);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data: dataDates } = useMonthDataDates(visibleMonth);
  const dayStats = useDayStats(selectedDate);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const dateKey of dataDates ?? []) {
      marks[dateKey] = {
        customStyles: {
          container: { backgroundColor: "#ecc6ff", borderRadius: 16 },
          text: { color: "#002054" },
        },
      };
    }
    if (selectedDate) {
      marks[selectedDate] = {
        customStyles: {
          container: {
            ...(marks[selectedDate]?.customStyles?.container ?? {}),
            borderWidth: 2,
            borderColor: "#002054",
            borderRadius: 16,
          },
          text: marks[selectedDate]?.customStyles?.text ?? { color: "#002054" },
        },
      };
    }
    return marks;
  }, [dataDates, selectedDate]);

  function handleDayPress(day: DateData) {
    if (!dataDates?.has(day.dateString)) {
      Alert.alert(t("estadisticas.noDataTitle"), t("estadisticas.noDataForDay"));
      return;
    }
    setSelectedDate(day.dateString);
  }

  function handleMonthChange(month: DateData) {
    setVisibleMonth(new Date(month.year, month.month - 1, 1));
    setSelectedDate(null);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark">
      <ScrollView className="px-5 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Pressable onPress={() => navigation.goBack()} className="flex-row items-center mb-2" hitSlop={8}>
          <Text className="text-xl text-brand-500">‹</Text>
          <Text className="text-sm text-brand-500 ml-1">{t("estadisticas.back")}</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-1">
          {t("estadisticas.yearlyTitle")}
        </Text>
        <Text className="text-sm text-gray-500 mb-4">
          {t("estadisticas.yearlyRange", { year: format(now, "yyyy") })}
        </Text>

        <PeriodStatsView data={data} isLoading={isLoading} />

        <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2 mt-2">
          {t("estadisticas.viewSpecificDay")}
        </Text>
        <Calendar
          current={todayIso()}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          markingType="custom"
          markedDates={markedDates}
          theme={{ arrowColor: "#002054" }}
        />

        {selectedDate ? (
          <>
            <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2 mt-4">
              {format(new Date(`${selectedDate}T00:00:00`), "dd MMMM yyyy")}
            </Text>
            {dayStats.isLoading || !dayStats.data ? null : !hasAnyDayData(dayStats.data) ? (
              <Card className="items-center py-8">
                <Text className="text-gray-500 text-center">{t("estadisticas.noDataForDay")}</Text>
              </Card>
            ) : (
              <DayStatsView data={dayStats.data} />
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
