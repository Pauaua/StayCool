import React, { useMemo, useState } from "react";
import { FlatList, SafeAreaView, Text, View, Pressable } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { useActivitiesInMonth } from "@/features/social/hooks/useSocial";
import type { SocialActivity } from "@/features/social/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { SocialStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<SocialStackParamList, "SocialCalendario">;

const todayIso = () => format(new Date(), "yyyy-MM-dd");

const FEELING_EMOJI: Record<string, string> = {
  genial: "🤩",
  bien: "🙂",
  neutral: "😐",
  mal: "😞",
  agotado: "🥱",
};

export function SocialCalendarioScreen({ navigation }: Props) {
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const monthActivities = useActivitiesInMonth(visibleMonth);

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, SocialActivity[]>();
    for (const activity of monthActivities.data ?? []) {
      const dateKey = activity.scheduled_at.slice(0, 10);
      const bucket = map.get(dateKey) ?? [];
      bucket.push(activity);
      map.set(dateKey, bucket);
    }
    return map;
  }, [monthActivities.data]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    for (const dateKey of activitiesByDate.keys()) {
      marks[dateKey] = { marked: true, dotColor: "#b825f2" };
    }
    marks[selectedDate] = {
      ...(marks[selectedDate] ?? {}),
      selected: true,
      selectedColor: "#b825f2",
    };
    return marks;
  }, [activitiesByDate, selectedDate]);

  const selectedDayActivities = activitiesByDate.get(selectedDate) ?? [];

  function handleDayPress(day: DateData) {
    setSelectedDate(day.dateString);
  }

  function handleMonthChange(month: DateData) {
    setVisibleMonth(new Date(month.year, month.month - 1, 1));
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark">
      <View className="px-5 pt-4">
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-3">
          Actividades sociales
        </Text>
      </View>

      <Calendar
        current={format(visibleMonth, "yyyy-MM-dd")}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: "#b825f2",
          todayTextColor: "#b825f2",
          arrowColor: "#b825f2",
          dotColor: "#b825f2",
        }}
      />

      <View className="px-5 pt-4 flex-1">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-semibold text-surface-dark dark:text-white">
            {format(new Date(`${selectedDate}T00:00:00`), "dd MMM yyyy")}
          </Text>
          <Pressable
            onPress={() => navigation.navigate("SocialRegistro", { initialDate: selectedDate })}
          >
            <Text className="text-brand-500 font-semibold">+ Agregar</Text>
          </Pressable>
        </View>

        {selectedDayActivities.length === 0 ? (
          <Card>
            <Text className="text-gray-400">Nada agendado este día.</Text>
          </Card>
        ) : (
          <FlatList
            data={selectedDayActivities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card className="mb-2">
                <View className="flex-row justify-between">
                  <Text className="text-surface-dark dark:text-white font-semibold capitalize">
                    {item.title || item.activity_type}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {format(new Date(item.scheduled_at), "HH:mm")}
                  </Text>
                </View>
                {item.companions ? (
                  <Text className="text-gray-500 text-sm">Con: {item.companions}</Text>
                ) : null}
                {item.activity_description ? (
                  <Text className="text-gray-500 text-sm">{item.activity_description}</Text>
                ) : null}
                {item.feeling ? (
                  <Text className="text-brand-500 text-sm capitalize">
                    {FEELING_EMOJI[item.feeling]} {item.feeling}
                  </Text>
                ) : null}
              </Card>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
