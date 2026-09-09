import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useCreateQuickNote } from "@/features/notas/hooks/useNotas";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NotasStackParamList } from "@/navigation/types";

const FEELINGS: { value: string; key: TranslationKey; emoji: string }[] = [
  { value: "inspirada", key: "notas.feeling.inspirada", emoji: "✨" },
  { value: "curiosa", key: "notas.feeling.curiosa", emoji: "🤔" },
  { value: "emocionada", key: "notas.feeling.emocionada", emoji: "🤩" },
  { value: "tranquila", key: "notas.feeling.tranquila", emoji: "😌" },
  { value: "confundida", key: "notas.feeling.confundida", emoji: "😕" },
];

type Props = NativeStackScreenProps<NotasStackParamList, "NotaRapida">;

export function NotaRapidaScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [feeling, setFeeling] = useState<string | undefined>();
  const create = useCreateQuickNote();
  const { t } = useT();

  async function handleSave() {
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim(), description: description.trim() || undefined, feeling });
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">{t("notas.quickTitle")}</Text>
        <TextField label={t("notas.name")} value={name} onChangeText={setName} />
        <TextField label={t("notas.description")} value={description} onChangeText={setDescription} multiline />

        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
          {t("notas.howFeltAboutIdea")}
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {FEELINGS.map((f) => (
            <Chip
              key={f.value}
              label={t(f.key)}
              icon={f.emoji}
              selected={feeling === f.value}
              onPress={() => setFeeling(f.value)}
            />
          ))}
        </View>

        <Button label={t("notas.save")} onPress={handleSave} loading={create.isPending} />
      </ScrollView>
    </SafeAreaView>
  );
}
