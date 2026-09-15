import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { useCreateQuickTaste } from "@/features/gustos/hooks/useGustos";
import { useT } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GustosStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<GustosStackParamList, "GustoRapido">;

export function GustoRapidoScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const create = useCreateQuickTaste();
  const { t } = useT();

  async function handleSave() {
    if (!name.trim()) return;
    await create.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      rating: rating || undefined,
    });
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          {t("gustos.quickTitle")}
        </Text>
        <TextField label={t("gustos.name")} value={name} onChangeText={setName} />
        <TextField label={t("gustos.descriptionOptional")} value={description} onChangeText={setDescription} multiline />
        <View className="mb-4">
          <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-1.5">
            {t("gustos.howMuchLiked")}
          </Text>
          <StarRating value={rating} onChange={setRating} />
        </View>
        <Button label={t("gustos.save")} onPress={handleSave} loading={create.isPending} />
      </ScrollView>
    </SafeAreaView>
  );
}
