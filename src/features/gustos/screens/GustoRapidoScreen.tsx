import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useCreateQuickTaste } from "@/features/gustos/hooks/useGustos";
import { useT } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GustosStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<GustosStackParamList, "GustoRapido">;

export function GustoRapidoScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const create = useCreateQuickTaste();
  const { t } = useT();

  async function handleSave() {
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
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
        <Button label={t("gustos.save")} onPress={handleSave} loading={create.isPending} />
      </ScrollView>
    </SafeAreaView>
  );
}
