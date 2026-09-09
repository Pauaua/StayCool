import React, { useState } from "react";
import { Alert, Modal, Pressable, Switch, Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { format, isBefore } from "date-fns";
import { TextField } from "@/components/ui/TextField";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormScreen } from "@/components/ui/FormScreen";
import {
  useCreateActivity,
  useDeleteActivity,
  useLinkNextActivity,
  useUpdateActivity,
} from "@/features/social/hooks/useSocial";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { ActivityType, Feeling } from "@/features/social/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { SocialStackParamList } from "@/navigation/types";

const TYPES: ActivityType[] = ["laboral", "amistosa", "casual", "familiar", "cita", "otro"];
const FEELINGS: Feeling[] = ["genial", "bien", "neutral", "mal", "agotado"];
const TYPE_KEY: Record<ActivityType, TranslationKey> = {
  laboral: "social.type.laboral",
  amistosa: "social.type.amistosa",
  casual: "social.type.casual",
  familiar: "social.type.familiar",
  cita: "social.type.cita",
  otro: "social.type.otro",
};
const FEELING_KEY: Record<Feeling, TranslationKey> = {
  genial: "social.feeling.genial",
  bien: "social.feeling.bien",
  neutral: "social.feeling.neutral",
  mal: "social.feeling.mal",
  agotado: "social.feeling.agotado",
};

type Props = NativeStackScreenProps<SocialStackParamList, "SocialRegistro">;

function DatePickerModal({
  visible,
  selectedDate,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  const { t } = useT();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <Card className="w-full">
          <Calendar
            current={selectedDate}
            markedDates={{ [selectedDate]: { selected: true, selectedColor: "#002054" } }}
            onDayPress={(day: DateData) => {
              onSelect(day.dateString);
              onClose();
            }}
            theme={{ selectedDayBackgroundColor: "#002054", todayTextColor: "#002054" }}
          />
          <View className="mt-2">
            <Button label={t("social.close")} variant="ghost" onPress={onClose} />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

export function SocialRegistroScreen({ navigation, route }: Props) {
  const editActivity = route.params?.editActivity;
  const isEditing = !!editActivity;
  const initialDate =
    route.params?.initialDate ??
    (editActivity ? format(new Date(editActivity.scheduled_at), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));

  const [activityType, setActivityType] = useState<ActivityType>(editActivity?.activity_type ?? "amistosa");
  const [title, setTitle] = useState(editActivity?.title ?? "");
  const [companions, setCompanions] = useState(editActivity?.companions ?? "");
  const [description, setDescription] = useState(editActivity?.activity_description ?? "");
  const [feeling, setFeeling] = useState<Feeling | undefined>(editActivity?.feeling ?? undefined);
  const [activityDate, setActivityDate] = useState(initialDate);
  const [activityTime, setActivityTime] = useState(
    editActivity ? format(new Date(editActivity.scheduled_at), "HH:mm") : "12:00"
  );
  const [hasNext, setHasNext] = useState(false);
  const [nextDate, setNextDate] = useState(initialDate);
  const [nextTime, setNextTime] = useState("12:00");
  const [nextActivityType, setNextActivityType] = useState<ActivityType>("amistosa");
  const [nextDatePickerOpen, setNextDatePickerOpen] = useState(false);
  const create = useCreateActivity();
  const update = useUpdateActivity();
  const deleteActivityMutation = useDeleteActivity();
  const linkNext = useLinkNextActivity();
  const { t, tg } = useT();

  async function handleSave() {
    const scheduledAt = new Date(`${activityDate}T${activityTime}:00`);
    if (Number.isNaN(scheduledAt.getTime())) return;

    if (isEditing && editActivity) {
      await update.mutateAsync({
        activityId: editActivity.id,
        input: {
          activityType,
          title,
          companions,
          activityDescription: description,
          scheduledAt: scheduledAt.toISOString(),
          isPast: isBefore(scheduledAt, new Date()),
          feeling,
        },
      });
      navigation.goBack();
      return;
    }

    const activity = await create.mutateAsync({
      activityType,
      title,
      companions,
      activityDescription: description,
      scheduledAt: scheduledAt.toISOString(),
      isPast: isBefore(scheduledAt, new Date()),
      feeling,
    });

    if (hasNext && nextDate) {
      const nextScheduledAt = new Date(`${nextDate}T${nextTime}:00`);
      if (!Number.isNaN(nextScheduledAt.getTime())) {
        const nextActivity = await create.mutateAsync({
          activityType: nextActivityType,
          title: t("social.nextWith", { name: companions || "?" }),
          companions,
          scheduledAt: nextScheduledAt.toISOString(),
          isPast: false,
        });
        await linkNext.mutateAsync({ activityId: activity.id, nextActivityId: nextActivity.id });
      }
    }

    navigation.goBack();
  }

  function handleDelete() {
    if (!editActivity) return;
    Alert.alert(t("social.deleteTitle"), tg("social.deleteMessage"), [
      { text: t("social.cancel"), style: "cancel" },
      {
        text: t("social.delete"),
        style: "destructive",
        onPress: () => {
          deleteActivityMutation.mutate(editActivity.id, { onSuccess: () => navigation.goBack() });
        },
      },
    ]);
  }

  return (
    <FormScreen>
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
        {isEditing ? t("social.editActivity") : t("social.registerActivity")}
      </Text>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField label={t("social.date")} value={activityDate} onChangeText={setActivityDate} />
        </View>
        <View className="w-28">
          <TextField label={t("social.time")} value={activityTime} onChangeText={setActivityTime} />
        </View>
      </View>

      <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
        {t("social.outingType")}
      </Text>
      <View className="flex-row flex-wrap mb-3">
        {TYPES.map((type) => (
          <Chip
            key={type}
            label={t(TYPE_KEY[type])}
            selected={activityType === type}
            onPress={() => setActivityType(type)}
          />
        ))}
      </View>

      <TextField label={t("social.titleOptional")} value={title} onChangeText={setTitle} />
      <TextField label={t("social.withWhom")} value={companions} onChangeText={setCompanions} />
      <TextField label={t("social.whatDid")} value={description} onChangeText={setDescription} multiline />

      <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
        {t("social.howFelt")}
      </Text>
      <View className="flex-row flex-wrap mb-3">
        {FEELINGS.map((f) => (
          <Chip key={f} label={t(FEELING_KEY[f])} selected={feeling === f} onPress={() => setFeeling(f)} />
        ))}
      </View>

      {isEditing ? null : (
      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-surface-dark dark:text-white flex-1 pr-2">
            {t("social.nextMeetingScheduled")}
          </Text>
          <Switch value={hasNext} onValueChange={setHasNext} />
        </View>
        {hasNext ? (
          <View className="mt-2">
            <Pressable
              onPress={() => setNextDatePickerOpen(true)}
              className="rounded-card px-4 py-3 mb-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-cardDark"
            >
              <Text className="text-xs text-gray-400 mb-0.5">{t("social.nextMeetingDate")}</Text>
              <Text className="text-surface-dark dark:text-white">
                {format(new Date(`${nextDate}T00:00:00`), "dd MMMM yyyy")}
              </Text>
            </Pressable>

            <TextField label={t("social.time")} value={nextTime} onChangeText={setNextTime} />

            <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
              {t("social.nextMeetingType")}
            </Text>
            <View className="flex-row flex-wrap">
              {TYPES.map((type) => (
                <Chip
                  key={type}
                  label={t(TYPE_KEY[type])}
                  selected={nextActivityType === type}
                  onPress={() => setNextActivityType(type)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </Card>
      )}

      <Button
        label={t("social.save")}
        onPress={handleSave}
        loading={isEditing ? update.isPending : create.isPending}
      />

      {isEditing ? (
        <Pressable onPress={handleDelete} className="mt-4" disabled={deleteActivityMutation.isPending}>
          <Text className="text-sm text-accent-coral text-center">
            {deleteActivityMutation.isPending ? t("social.deleting") : t("social.delete")}
          </Text>
        </Pressable>
      ) : null}

      <DatePickerModal
        visible={nextDatePickerOpen}
        selectedDate={nextDate}
        onSelect={setNextDate}
        onClose={() => setNextDatePickerOpen(false)}
      />
    </FormScreen>
  );
}
