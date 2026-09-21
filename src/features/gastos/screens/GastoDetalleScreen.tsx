import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, Switch, Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import {
  useDeleteDetailedExpense,
  useDeleteQuickExpense,
  useDetailedExpenseDetail,
  useQuickExpenseDetail,
  useUpdateDetailedExpense,
  useUpdateQuickExpense,
} from "@/features/gastos/hooks/useGastos";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { ExpenseKind } from "@/features/gastos/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GastosStackParamList } from "@/navigation/types";

const TYPES = ["comida", "transporte", "ocio", "compras", "salud", "otro"];
const KINDS: ExpenseKind[] = ["fijo", "extra", "hormiga", "innecesario"];

type Props = NativeStackScreenProps<GastosStackParamList, "GastoDetalle">;

const EXPENSE_TYPE_KEY: Record<string, TranslationKey> = {
  comida: "gastos.type.comida",
  transporte: "gastos.type.transporte",
  ocio: "gastos.type.ocio",
  compras: "gastos.type.compras",
  salud: "gastos.type.salud",
  otro: "gastos.type.otro",
};

const EXPENSE_KIND_KEY: Record<string, TranslationKey> = {
  fijo: "gastos.kind.fijo",
  extra: "gastos.kind.extra",
  hormiga: "gastos.kind.hormiga",
  innecesario: "gastos.kind.innecesario",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-800">
      <Text className="text-gray-500">{label}</Text>
      <Text className="text-surface-dark dark:text-white font-semibold">{value}</Text>
    </View>
  );
}

export function GastoDetalleScreen({ route, navigation }: Props) {
  if (route.params.kind === "quick") {
    return <QuickDetail expenseId={route.params.expenseId} navigation={navigation} />;
  }
  return <DetailedDetail expenseId={route.params.expenseId} navigation={navigation} />;
}

function QuickDetail({
  expenseId,
  navigation,
}: {
  expenseId: string;
  navigation: Props["navigation"];
}) {
  const { data: expense, isLoading } = useQuickExpenseDetail(expenseId);
  const deleteExpense = useDeleteQuickExpense();
  const updateExpense = useUpdateQuickExpense();
  const { t, tg } = useT();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  if (isLoading || !expense) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark items-center justify-center">
        <ActivityIndicator color="#b825f2" />
      </SafeAreaView>
    );
  }

  function startEditing() {
    if (!expense) return;
    setName(expense.name);
    setType(expense.expense_type);
    setAmount(expense.amount ? String(expense.amount) : "");
    setDescription(expense.description ?? "");
    setEditing(true);
  }

  function handleSaveEdit() {
    if (!name.trim()) return;
    updateExpense.mutate(
      { id: expenseId, name: name.trim(), expenseType: type, description, amount: amount ? Number(amount) : undefined },
      { onSuccess: () => setEditing(false) }
    );
  }

  function handleDelete() {
    Alert.alert(t("gastos.deleteTitle"), tg("gastos.deleteMessage"), [
      { text: t("gastos.cancel"), style: "cancel" },
      {
        text: t("gastos.delete"),
        style: "destructive",
        onPress: () => {
          deleteExpense.mutate(expenseId, { onSuccess: () => navigation.goBack() });
        },
      },
    ]);
  }

  if (editing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
            {t("gastos.editExpense")}
          </Text>
          <TextField label={t("gastos.expenseName")} value={name} onChangeText={setName} />
          <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">{t("gastos.type")}</Text>
          <View className="flex-row flex-wrap mb-4">
            {TYPES.map((type_) => (
              <Chip key={type_} label={t(EXPENSE_TYPE_KEY[type_])} selected={type === type_} onPress={() => setType(type_)} />
            ))}
          </View>
          <TextField label={t("gastos.amountOptional")} keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <TextField label={t("gastos.descriptionOptional")} value={description} onChangeText={setDescription} />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button label={t("gastos.saveChanges")} onPress={handleSaveEdit} loading={updateExpense.isPending} />
            </View>
            <View className="flex-1">
              <Button label={t("gastos.cancel")} variant="ghost" onPress={() => setEditing(false)} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">{expense.name}</Text>
        <Row label={t("gastos.type")} value={t(EXPENSE_TYPE_KEY[expense.expense_type] ?? "gastos.type.otro")} />
        <Row label={t("gastos.date")} value={expense.expense_date} />
        <Row label={t("gastos.amount")} value={expense.amount ? `$${expense.amount}` : "—"} />
        {expense.description ? (
          <View className="mt-4">
            <Text className="text-gray-500 mb-1">{t("gastos.description")}</Text>
            <Text className="text-surface-dark dark:text-white">{expense.description}</Text>
          </View>
        ) : null}
        <View className="flex-row gap-4 mt-6 justify-center">
          <Pressable onPress={startEditing}>
            <Text className="text-sm text-brand-500 font-semibold">{t("gastos.edit")}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} disabled={deleteExpense.isPending}>
            <Text className="text-sm text-accent-coral text-center">
              {deleteExpense.isPending ? t("gastos.deleting") : t("gastos.deleteExpense")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailedDetail({
  expenseId,
  navigation,
}: {
  expenseId: string;
  navigation: Props["navigation"];
}) {
  const { data: expense, isLoading } = useDetailedExpenseDetail(expenseId);
  const deleteExpense = useDeleteDetailedExpense();
  const updateExpense = useUpdateDetailedExpense();
  const { t, tg } = useT();
  const [editing, setEditing] = useState(false);
  const [item, setItem] = useState("");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<ExpenseKind>("extra");
  const [couldWait, setCouldWait] = useState(false);

  if (isLoading || !expense) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark items-center justify-center">
        <ActivityIndicator color="#b825f2" />
      </SafeAreaView>
    );
  }

  function startEditing() {
    if (!expense) return;
    setItem(expense.item_purchased);
    setPurpose(expense.purpose ?? "");
    setAmount(String(expense.amount));
    setKind(expense.expense_kind);
    setCouldWait(expense.could_wait);
    setEditing(true);
  }

  function handleSaveEdit() {
    const amountValue = Number(amount);
    if (!item.trim() || Number.isNaN(amountValue)) return;
    updateExpense.mutate(
      { id: expenseId, itemPurchased: item.trim(), purpose, amount: amountValue, expenseKind: kind, couldWait },
      { onSuccess: () => setEditing(false) }
    );
  }

  function handleDelete() {
    Alert.alert(t("gastos.deleteTitle"), tg("gastos.deleteMessage"), [
      { text: t("gastos.cancel"), style: "cancel" },
      {
        text: t("gastos.delete"),
        style: "destructive",
        onPress: () => {
          deleteExpense.mutate(expenseId, { onSuccess: () => navigation.goBack() });
        },
      },
    ]);
  }

  if (editing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
            {t("gastos.editExpense")}
          </Text>
          <TextField label={t("gastos.whatBought")} value={item} onChangeText={setItem} />
          <TextField label={t("gastos.purpose")} value={purpose} onChangeText={setPurpose} />
          <TextField label={t("gastos.amount")} keyboardType="numeric" value={amount} onChangeText={setAmount} />
          <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
            {t("gastos.expenseKind")}
          </Text>
          <View className="flex-row flex-wrap mb-4">
            {KINDS.map((k) => (
              <Chip key={k} label={t(EXPENSE_KIND_KEY[k])} selected={kind === k} onPress={() => setKind(k)} />
            ))}
          </View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-surface-dark dark:text-white">{t("gastos.couldWait")}</Text>
            <Switch value={couldWait} onValueChange={setCouldWait} />
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button label={t("gastos.saveChanges")} onPress={handleSaveEdit} loading={updateExpense.isPending} />
            </View>
            <View className="flex-1">
              <Button label={t("gastos.cancel")} variant="ghost" onPress={() => setEditing(false)} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          {expense.item_purchased}
        </Text>
        <Row label={t("gastos.date")} value={expense.expense_date} />
        <Row label={t("gastos.amount")} value={`$${expense.amount}`} />
        <Row label={t("gastos.expenseKind")} value={t(EXPENSE_KIND_KEY[expense.expense_kind] ?? "gastos.kind.extra")} />
        <Row label={t("gastos.couldWait")} value={expense.could_wait ? t("gastos.yes") : t("gastos.no")} />
        {expense.remaining_balance !== null ? (
          <Row label={t("gastos.remainingBalance")} value={`$${expense.remaining_balance}`} />
        ) : null}
        {expense.purpose ? (
          <View className="mt-4">
            <Text className="text-gray-500 mb-1">{t("gastos.purpose")}</Text>
            <Text className="text-surface-dark dark:text-white">{expense.purpose}</Text>
          </View>
        ) : null}
        <View className="flex-row gap-4 mt-6 justify-center">
          <Pressable onPress={startEditing}>
            <Text className="text-sm text-brand-500 font-semibold">{t("gastos.edit")}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} disabled={deleteExpense.isPending}>
            <Text className="text-sm text-accent-coral text-center">
              {deleteExpense.isPending ? t("gastos.deleting") : t("gastos.deleteExpense")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
