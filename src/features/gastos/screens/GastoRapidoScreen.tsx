import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useCreateQuickExpense } from "@/features/gastos/hooks/useGastos";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GastosStackParamList } from "@/navigation/types";

const TYPES = ["comida", "transporte", "ocio", "compras", "salud", "otro"];
const TYPE_KEY: Record<string, TranslationKey> = {
  comida: "gastos.type.comida",
  transporte: "gastos.type.transporte",
  ocio: "gastos.type.ocio",
  compras: "gastos.type.compras",
  salud: "gastos.type.salud",
  otro: "gastos.type.otro",
};

type Props = NativeStackScreenProps<GastosStackParamList, "GastoRapido">;

export function GastoRapidoScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const create = useCreateQuickExpense();
  const { t } = useT();

  async function handleSave() {
    if (!name.trim()) return;
    await create.mutateAsync({
      name: name.trim(),
      expenseType: type,
      description,
      amount: amount ? Number(amount) : undefined,
    });
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          {t("gastos.quickTitle")}
        </Text>
        <TextField label={t("gastos.expenseName")} value={name} onChangeText={setName} />
        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">{t("gastos.type")}</Text>
        <View className="flex-row flex-wrap mb-4">
          {TYPES.map((type_) => (
            <Chip key={type_} label={t(TYPE_KEY[type_])} selected={type === type_} onPress={() => setType(type_)} />
          ))}
        </View>
        <TextField
          label={t("gastos.amountOptional")}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextField
          label={t("gastos.descriptionOptional")}
          value={description}
          onChangeText={setDescription}
        />
        <Button label={t("gastos.save")} onPress={handleSave} loading={create.isPending} />
      </ScrollView>
    </SafeAreaView>
  );
}
