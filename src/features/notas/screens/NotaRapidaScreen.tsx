import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useCreateQuickNote } from "@/features/notas/hooks/useNotas";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NotasStackParamList } from "@/navigation/types";

const FEELINGS = [
  { value: "inspirada", emoji: "✨" },
  { value: "curiosa", emoji: "🤔" },
  { value: "emocionada", emoji: "🤩" },
  { value: "tranquila", emoji: "😌" },
  { value: "confundida", emoji: "😕" },
];

type Props = NativeStackScreenProps<NotasStackParamList, "NotaRapida">;

export function NotaRapidaScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [feeling, setFeeling] = useState<string | undefined>();
  const create = useCreateQuickNote();

  async function handleSave() {
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim(), description: description.trim() || undefined, feeling });
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">Idea rápida</Text>
        <TextField label="Nombre" value={name} onChangeText={setName} />
        <TextField label="Descripción" value={description} onChangeText={setDescription} multiline />

        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
          ¿Cómo te sentiste con la idea?
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {FEELINGS.map((f) => (
            <Chip
              key={f.value}
              label={f.value}
              icon={f.emoji}
              selected={feeling === f.value}
              onPress={() => setFeeling(f.value)}
            />
          ))}
        </View>

        <Button label="Guardar" onPress={handleSave} loading={create.isPending} />
      </ScrollView>
    </SafeAreaView>
  );
}
