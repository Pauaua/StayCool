import React from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import {
  useDeleteDetailedExpense,
  useDeleteQuickExpense,
  useDetailedExpenseDetail,
  useQuickExpenseDetail,
} from "@/features/gastos/hooks/useGastos";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GastosStackParamList } from "@/navigation/types";

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
  const { t, tg } = useT();

  if (isLoading || !expense) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark items-center justify-center">
        <ActivityIndicator color="#b825f2" />
      </SafeAreaView>
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
        <Pressable onPress={handleDelete} className="mt-6" disabled={deleteExpense.isPending}>
          <Text className="text-sm text-accent-coral text-center">
            {deleteExpense.isPending ? t("gastos.deleting") : t("gastos.deleteExpense")}
          </Text>
        </Pressable>
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
  const { t, tg } = useT();

  if (isLoading || !expense) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark items-center justify-center">
        <ActivityIndicator color="#b825f2" />
      </SafeAreaView>
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
        <Pressable onPress={handleDelete} className="mt-6" disabled={deleteExpense.isPending}>
          <Text className="text-sm text-accent-coral text-center">
            {deleteExpense.isPending ? t("gastos.deleting") : t("gastos.deleteExpense")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
