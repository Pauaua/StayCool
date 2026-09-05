import React, { useState } from "react";
import { Switch, Text, View } from "react-native";
import { format, isBefore } from "date-fns";
import { TextField } from "@/components/ui/TextField";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { FormScreen } from "@/components/ui/FormScreen";
import { useCreateActivity, useLinkNextActivity } from "@/features/social/hooks/useSocial";
import type { ActivityType, Feeling } from "@/features/social/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { SocialStackParamList } from "@/navigation/types";

const TYPES: ActivityType[] = ["laboral", "amistosa", "casual", "familiar", "cita", "otro"];
const FEELINGS: Feeling[] = ["genial", "bien", "neutral", "mal", "agotado"];

type Props = NativeStackScreenProps<SocialStackParamList, "SocialRegistro">;

export function SocialRegistroScreen({ navigation, route }: Props) {
  const initialDate = route.params?.initialDate ?? format(new Date(), "yyyy-MM-dd");

  const [activityType, setActivityType] = useState<ActivityType>("amistosa");
  const [title, setTitle] = useState("");
  const [companions, setCompanions] = useState("");
  const [description, setDescription] = useState("");
  const [feeling, setFeeling] = useState<Feeling | undefined>();
  const [activityDate, setActivityDate] = useState(initialDate);
  const [activityTime, setActivityTime] = useState("12:00");
  const [hasNext, setHasNext] = useState(false);
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("12:00");
  const create = useCreateActivity();
  const linkNext = useLinkNextActivity();

  async function handleSave() {
    const scheduledAt = new Date(`${activityDate}T${activityTime}:00`);
    if (Number.isNaN(scheduledAt.getTime())) return;

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
          activityType,
          title: `Próximo con ${companions || "?"}`,
          companions,
          scheduledAt: nextScheduledAt.toISOString(),
          isPast: false,
        });
        await linkNext.mutateAsync({ activityId: activity.id, nextActivityId: nextActivity.id });
      }
    }

    navigation.goBack();
  }

  return (
    <FormScreen>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          Registrar actividad
        </Text>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField label="Fecha (YYYY-MM-DD)" value={activityDate} onChangeText={setActivityDate} />
          </View>
          <View className="w-28">
            <TextField label="Hora (HH:mm)" value={activityTime} onChangeText={setActivityTime} />
          </View>
        </View>

        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
          Tipo de salida
        </Text>
        <View className="flex-row flex-wrap mb-3">
          {TYPES.map((t) => (
            <Chip key={t} label={t} selected={activityType === t} onPress={() => setActivityType(t)} />
          ))}
        </View>

        <TextField label="Título (opcional)" value={title} onChangeText={setTitle} />
        <TextField label="¿Con quién?" value={companions} onChangeText={setCompanions} />
        <TextField label="¿Qué hicieron?" value={description} onChangeText={setDescription} multiline />

        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
          ¿Cómo te sentiste?
        </Text>
        <View className="flex-row flex-wrap mb-3">
          {FEELINGS.map((f) => (
            <Chip key={f} label={f} selected={feeling === f} onPress={() => setFeeling(f)} />
          ))}
        </View>

        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-surface-dark dark:text-white">¿Quedó agendado un próximo encuentro?</Text>
          <Switch value={hasNext} onValueChange={setHasNext} />
        </View>
        {hasNext ? (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField label="Fecha próximo (YYYY-MM-DD)" value={nextDate} onChangeText={setNextDate} />
            </View>
            <View className="w-28">
              <TextField label="Hora (HH:mm)" value={nextTime} onChangeText={setNextTime} />
            </View>
          </View>
        ) : null}

        <Button label="Guardar" onPress={handleSave} loading={create.isPending} />
    </FormScreen>
  );
}
