import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useCreateQuickTaste } from "@/features/gustos/hooks/useGustos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GustosStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<GustosStackParamList, "GustoRapido">;

export function GustoRapidoScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const create = useCreateQuickTaste();

  async function handleSave() {
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          Algo que te gustó
        </Text>
        <TextField label="Nombre" value={name} onChangeText={setName} />
        <TextField label="Descripción (opcional)" value={description} onChangeText={setDescription} multiline />
        <Button label="Guardar" onPress={handleSave} loading={create.isPending} />
      </ScrollView>
    </SafeAreaView>
  );
}
