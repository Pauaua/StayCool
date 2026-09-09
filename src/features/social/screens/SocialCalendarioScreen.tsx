import React, { useMemo, useState } from "react";
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useActivitiesInMonth, useDeleteActivity, useUpcomingActivities } from "@/features/social/hooks/useSocial";
import { useT, type TranslationKey } from "@/lib/i18n";
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

const FEELING_KEY: Record<string, TranslationKey> = {
  genial: "social.feeling.genial",
  bien: "social.feeling.bien",
  neutral: "social.feeling.neutral",
  mal: "social.feeling.mal",
  agotado: "social.feeling.agotado",
};

const TYPE_KEY: Record<string, TranslationKey> = {
  laboral: "social.type.laboral",
  amistosa: "social.type.amistosa",
  casual: "social.type.casual",
  familiar: "social.type.familiar",
  cita: "social.type.cita",
  otro: "social.type.otro",
};

function ActivityCard({ activity, onPress }: { activity: SocialActivity; onPress: () => void }) {
  const { t } = useT();
  return (
    <Pressable onPress={onPress}>
      <Card className="mb-2">
        <View className="flex-row justify-between">
          <Text className="text-surface-dark dark:text-white font-semibold capitalize">
            {activity.title || t(TYPE_KEY[activity.activity_type] ?? "social.type.otro")}
          </Text>
          <Text className="text-xs text-gray-400">{format(new Date(activity.scheduled_at), "HH:mm")}</Text>
        </View>
        <Text className="text-xs text-gray-400">
          {format(new Date(activity.scheduled_at), "dd MMM")}
        </Text>
      </Card>
    </Pressable>
  );
}

function UpcomingActivityCard({ activity, onPress }: { activity: SocialActivity; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card className="mb-2">
        <View className="flex-row items-baseline justify-between">
          <Text className="text-sm font-bold text-surface-dark dark:text-white capitalize">
            {format(new Date(activity.scheduled_at), "dd MMMM")}
          </Text>
          <Text className="text-sm font-semibold text-brand-500">
            {format(new Date(activity.scheduled_at), "HH:mm")}
          </Text>
        </View>
        {activity.companions ? (
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.companions}</Text>
        ) : null}
        {activity.activity_description ? (
          <Text className="text-xs text-gray-400 mt-0.5">{activity.activity_description}</Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

function ActivityDetailModal({
  activity,
  onClose,
  onEdit,
}: {
  activity: SocialActivity | null;
  onClose: () => void;
  onEdit: (activity: SocialActivity) => void;
}) {
  const { t, tg } = useT();
  const deleteActivity = useDeleteActivity();

  function handleDelete() {
    if (!activity) return;
    Alert.alert(t("social.deleteTitle"), tg("social.deleteMessage"), [
      { text: t("social.cancel"), style: "cancel" },
      {
        text: t("social.delete"),
        style: "destructive",
        onPress: () => {
          deleteActivity.mutate(activity.id, { onSuccess: onClose });
        },
      },
    ]);
  }

  return (
    <Modal visible={activity !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <Card className="w-full">
          {activity ? (
            <>
              <Text className="text-xl font-bold text-surface-dark dark:text-white mb-1 capitalize">
                {activity.title || t(TYPE_KEY[activity.activity_type] ?? "social.type.otro")}
              </Text>
              <Text className="text-sm text-gray-400 mb-4">
                {format(new Date(activity.scheduled_at), "dd MMMM yyyy · HH:mm")}
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-300 mb-1.5 capitalize">
                {t("social.typeLabel", { value: t(TYPE_KEY[activity.activity_type] ?? "social.type.otro") })}
              </Text>
              {activity.companions ? (
                <Text className="text-base text-gray-600 dark:text-gray-300 mb-1.5">
                  {t("social.withLabel", { value: activity.companions })}
                </Text>
              ) : null}
              {activity.activity_description ? (
                <Text className="text-base text-gray-600 dark:text-gray-300 mb-1.5">
                  {activity.activity_description}
                </Text>
              ) : null}
              {activity.feeling ? (
                <Text className="text-base text-brand-500 mb-1.5 capitalize">
                  {FEELING_EMOJI[activity.feeling]} {t(FEELING_KEY[activity.feeling] ?? "social.feeling.neutral")}
                </Text>
              ) : null}
              {activity.next_activity_id ? (
                <Text className="text-sm text-gray-400 mt-1">{t("social.hasNextMeeting")}</Text>
              ) : null}
            </>
          ) : null}
          <View className="flex-row gap-2 mt-4">
            <View className="flex-1">
              <Button label={t("social.edit")} size="sm" onPress={() => activity && onEdit(activity)} />
            </View>
            <View className="flex-1">
              <Button
                label={deleteActivity.isPending ? t("social.deleting") : t("social.delete")}
                variant="ghost"
                size="sm"
                onPress={handleDelete}
                loading={deleteActivity.isPending}
              />
            </View>
            <View className="flex-1">
              <Button label={t("social.close")} variant="secondary" size="sm" onPress={onClose} />
            </View>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

export function SocialCalendarioScreen({ navigation }: Props) {
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [selectedActivity, setSelectedActivity] = useState<SocialActivity | null>(null);
  const monthActivities = useActivitiesInMonth(visibleMonth);
  const upcoming = useUpcomingActivities();
  const { t } = useT();

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

  // El círculo envuelve el número completo (no un puntito abajo): moradito
  // para hoy, celeste para los días con actividades a futuro. Paleta fija
  // de la app — siempre estos mismos hex.
  const markedDates = useMemo(() => {
    const today = todayIso();
    const marks: Record<string, any> = {};

    for (const [dateKey, dayActivities] of activitiesByDate.entries()) {
      const isFuture = dateKey > today || dayActivities.some((a) => !a.is_past);
      marks[dateKey] = {
        customStyles: {
          container: {
            backgroundColor: isFuture ? "#d9ebff" : "#ecc6ff",
            borderRadius: 16,
          },
          text: { color: "#002054" },
        },
      };
    }

    // Hoy siempre va moradito, tenga actividad o no.
    marks[today] = {
      customStyles: {
        container: { backgroundColor: "#ecc6ff", borderRadius: 16 },
        text: { color: "#002054", fontWeight: "700" },
      },
    };

    // El día seleccionado suma un borde navy encima de su color de base.
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

    return marks;
  }, [activitiesByDate, selectedDate]);

  const today = todayIso();
  const upcomingData = upcoming.data ?? [];
  const todayActivities = upcomingData.filter((a) => a.scheduled_at.slice(0, 10) === today);
  const nextActivities = upcomingData.filter((a) => a.scheduled_at.slice(0, 10) > today);

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
          {t("social.title")}
        </Text>
      </View>

      <Calendar
        current={format(visibleMonth, "yyyy-MM-dd")}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markingType="custom"
        markedDates={markedDates}
        theme={{
          arrowColor: "#002054",
        }}
      />

      <ScrollView className="px-5 pt-4 flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-semibold text-surface-dark dark:text-white">
            {t("social.today")}
          </Text>
          <Pressable
            onPress={() => navigation.navigate("SocialRegistro", { initialDate: selectedDate })}
          >
            <Text className="text-brand-500 font-semibold">{t("social.add")}</Text>
          </Pressable>
        </View>

        {todayActivities.length === 0 ? (
          <Card className="mb-2">
            <Text className="text-gray-400">{t("social.nothingToday")}</Text>
          </Card>
        ) : (
          todayActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} onPress={() => setSelectedActivity(activity)} />
          ))
        )}

        <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-3 mt-5">
          {t("social.upcomingTitle")}
        </Text>
        {nextActivities.length === 0 ? (
          <Card>
            <Text className="text-gray-400">{t("social.nothingElseThisMonth")}</Text>
          </Card>
        ) : (
          nextActivities.map((activity) => (
            <UpcomingActivityCard key={activity.id} activity={activity} onPress={() => setSelectedActivity(activity)} />
          ))
        )}
      </ScrollView>

      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onEdit={(activity) => {
          setSelectedActivity(null);
          navigation.navigate("SocialRegistro", { editActivity: activity });
        }}
      />
    </SafeAreaView>
  );
}
