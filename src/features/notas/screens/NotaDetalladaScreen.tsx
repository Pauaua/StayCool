import React, { useState } from "react";
import { Text } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { FormScreen } from "@/components/ui/FormScreen";
import { useCreateDetailedNote } from "@/features/notas/hooks/useNotas";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NotasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<NotasStackParamList, "NotaDetallada">;

export function NotaDetalladaScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [idea, setIdea] = useState("");
  const [feelings, setFeelings] = useState("");
  const [thoughts, setThoughts] = useState("");
  const create = useCreateDetailedNote();

  async function handleSave() {
    if (!name.trim() || !idea.trim()) return;
    await create.mutateAsync({
      name: name.trim(),
      location: location.trim() || undefined,
      idea: idea.trim(),
      feelings: feelings.trim() || undefined,
      thoughts: thoughts.trim() || undefined,
    });
    navigation.goBack();
  }

  return (
    <FormScreen>
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">Idea completa</Text>
      <TextField label="Nombre" value={name} onChangeText={setName} />
      <TextField label="¿Dónde estabas?" value={location} onChangeText={setLocation} />
      <TextField label="La idea" value={idea} onChangeText={setIdea} multiline />
      <TextField label="Sentires" value={feelings} onChangeText={setFeelings} multiline />
      <TextField label="Pensamientos" value={thoughts} onChangeText={setThoughts} multiline />
      <Button label="Guardar" onPress={handleSave} loading={create.isPending} />
    </FormScreen>
  );
}
