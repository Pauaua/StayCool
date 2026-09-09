import React, { useState } from "react";
import { Switch, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { FormScreen } from "@/components/ui/FormScreen";
import { useCreateDetailedExpense } from "@/features/gastos/hooks/useGastos";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { ExpenseKind } from "@/features/gastos/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GastosStackParamList } from "@/navigation/types";

const KINDS: ExpenseKind[] = ["fijo", "extra", "hormiga", "innecesario"];
const KIND_KEY: Record<ExpenseKind, TranslationKey> = {
  fijo: "gastos.kind.fijo",
  extra: "gastos.kind.extra",
  hormiga: "gastos.kind.hormiga",
  innecesario: "gastos.kind.innecesario",
};

type Props = NativeStackScreenProps<GastosStackParamList, "GastoDetallado">;

export function GastoDetalladoScreen({ navigation }: Props) {
  const [item, setItem] = useState("");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<ExpenseKind>("extra");
  const [couldWait, setCouldWait] = useState(false);
  const create = useCreateDetailedExpense();
  const { t } = useT();

  async function handleSave() {
    const amountValue = Number(amount);
    if (!item.trim() || Number.isNaN(amountValue)) return;
    await create.mutateAsync({
      itemPurchased: item.trim(),
      purpose,
      amount: amountValue,
      expenseKind: kind,
      couldWait,
    });
    navigation.goBack();
  }

  return (
    <FormScreen>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          {t("gastos.bigTitle")}
        </Text>
        <TextField label={t("gastos.whatBought")} value={item} onChangeText={setItem} />
        <TextField label={t("gastos.purpose")} value={purpose} onChangeText={setPurpose} />
        <TextField label={t("gastos.amount")} keyboardType="numeric" value={amount} onChangeText={setAmount} />

        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
          {t("gastos.expenseKind")}
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {KINDS.map((k) => (
            <Chip key={k} label={t(KIND_KEY[k])} selected={kind === k} onPress={() => setKind(k)} />
          ))}
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-surface-dark dark:text-white">{t("gastos.couldWait")}</Text>
          <Switch value={couldWait} onValueChange={setCouldWait} />
        </View>

        <Button label={t("gastos.save")} onPress={handleSave} loading={create.isPending} />
    </FormScreen>
  );
}
