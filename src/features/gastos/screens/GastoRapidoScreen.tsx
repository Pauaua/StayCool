import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useCreateQuickExpense } from "@/features/gastos/hooks/useGastos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GastosStackParamList } from "@/navigation/types";

const TYPES = ["comida", "transporte", "ocio", "compras", "salud", "otro"];

type Props = NativeStackScreenProps<GastosStackParamList, "GastoRapido">;

export function GastoRapidoScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [description, setDescription] = useState("");
  const create = useCreateQuickExpense();

  async function handleSave() {
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim(), expenseType: type, description });
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          Gasto rápido
        </Text>
        <TextField label="Nombre del gasto" value={name} onChangeText={setName} />
        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">Tipo</Text>
        <View className="flex-row flex-wrap mb-4">
          {TYPES.map((t) => (
            <Chip key={t} label={t} selected={type === t} onPress={() => setType(t)} />
          ))}
        </View>
        <TextField
          label="Descripción (opcional)"
          value={description}
          onChangeText={setDescription}
        />
        <Button label="Guardar" onPress={handleSave} loading={create.isPending} />
      </ScrollView>
    </SafeAreaView>
  );
}
