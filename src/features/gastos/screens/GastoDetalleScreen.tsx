import React from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useDetailedExpenseDetail, useQuickExpenseDetail } from "@/features/gastos/hooks/useGastos";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GastosStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<GastosStackParamList, "GastoDetalle">;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-800">
      <Text className="text-gray-500">{label}</Text>
      <Text className="text-surface-dark dark:text-white font-semibold">{value}</Text>
    </View>
  );
}

export function GastoDetalleScreen({ route }: Props) {
  if (route.params.kind === "quick") {
    return <QuickDetail expenseId={route.params.expenseId} />;
  }
  return <DetailedDetail expenseId={route.params.expenseId} />;
}

function QuickDetail({ expenseId }: { expenseId: string }) {
  const { data: expense, isLoading } = useQuickExpenseDetail(expenseId);

  if (isLoading || !expense) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark items-center justify-center">
        <ActivityIndicator color="#b825f2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">{expense.name}</Text>
        <Row label="Tipo" value={expense.expense_type} />
        <Row label="Fecha" value={expense.expense_date} />
        <Row label="Monto" value={expense.amount ? `$${expense.amount}` : "—"} />
        {expense.description ? (
          <View className="mt-4">
            <Text className="text-gray-500 mb-1">Descripción</Text>
            <Text className="text-surface-dark dark:text-white">{expense.description}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailedDetail({ expenseId }: { expenseId: string }) {
  const { data: expense, isLoading } = useDetailedExpenseDetail(expenseId);

  if (isLoading || !expense) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark items-center justify-center">
        <ActivityIndicator color="#b825f2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          {expense.item_purchased}
        </Text>
        <Row label="Fecha" value={expense.expense_date} />
        <Row label="Monto" value={`$${expense.amount}`} />
        <Row label="Tipo de gasto" value={expense.expense_kind} />
        <Row label="¿Podía esperar?" value={expense.could_wait ? "Sí" : "No"} />
        {expense.remaining_balance !== null ? (
          <Row label="Quedaste con" value={`$${expense.remaining_balance}`} />
        ) : null}
        {expense.purpose ? (
          <View className="mt-4">
            <Text className="text-gray-500 mb-1">¿Para qué / uso?</Text>
            <Text className="text-surface-dark dark:text-white">{expense.purpose}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
