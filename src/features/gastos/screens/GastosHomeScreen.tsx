import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import { format, startOfMonth } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useDetailedExpenses, useExpenseSummary, useQuickExpenses } from "@/features/gastos/hooks/useGastos";
import { useProfile, useUpdateProfile } from "@/features/home/hooks/useProfile";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GastosStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<GastosStackParamList, "GastosHome">;

function BudgetCard({ totalSpent }: { totalSpent: number }) {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  const budget = profile?.monthly_budget ?? null;
  const remaining = budget !== null ? budget - totalSpent : null;

  if (editing || budget === null) {
    return (
      <Card className="mb-4">
        <Text className="text-sm text-gray-500 mb-2">Presupuesto mensual</Text>
        <TextField
          label="Monto"
          keyboardType="numeric"
          value={budgetInput}
          onChangeText={setBudgetInput}
          placeholder={budget !== null ? String(budget) : "ej: 500000"}
        />
        <Button
          label="Guardar presupuesto"
          onPress={async () => {
            const value = Number(budgetInput);
            if (Number.isNaN(value) || value <= 0) return;
            await updateProfile.mutateAsync({ monthly_budget: value });
            setBudgetInput("");
            setEditing(false);
          }}
          loading={updateProfile.isPending}
        />
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-sm text-gray-500 mb-1">Disponible este mes</Text>
          <Text
            className={`text-3xl font-bold ${
              (remaining ?? 0) < 0 ? "text-accent-coral" : "text-brand-500"
            }`}
          >
            ${remaining?.toFixed(2)}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            de ${budget.toFixed(2)} presupuestados
          </Text>
        </View>
        <Pressable onPress={() => setEditing(true)}>
          <Text className="text-brand-500 text-sm">Editar</Text>
        </Pressable>
      </View>
    </Card>
  );
}

export function GastosHomeScreen({ navigation }: Props) {
  const today = new Date();
  const from = format(startOfMonth(today), "yyyy-MM-dd");
  const to = format(today, "yyyy-MM-dd");
  const summary = useExpenseSummary(from, to);
  const quickExpenses = useQuickExpenses();
  const detailedExpenses = useDetailedExpenses();
  const [tab, setTab] = useState<"rapidos" | "detallados">("rapidos");

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">Gastos</Text>

      <BudgetCard totalSpent={summary.data?.total ?? 0} />

      <Card className="mb-4">
        <Text className="text-sm text-gray-500 mb-1">Total gastado este mes</Text>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white">
          ${summary.data?.total.toFixed(2) ?? "—"}
        </Text>
        {summary.data &&
          Object.entries(summary.data.breakdown).map(([type, amount]) => (
            <View key={type} className="flex-row justify-between mt-2">
              <Text className="text-surface-dark dark:text-white capitalize">{type}</Text>
              <Text className="text-gray-500">${amount.toFixed(2)}</Text>
            </View>
          ))}
      </Card>

      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          <Button label="Gasto rápido" onPress={() => navigation.navigate("GastoRapido")} />
        </View>
        <View className="flex-1">
          <Button
            label="Gasto grande"
            variant="secondary"
            onPress={() => navigation.navigate("GastoDetallado")}
          />
        </View>
      </View>

      <View className="flex-row mb-3">
        <Chip label="Rápidos" selected={tab === "rapidos"} onPress={() => setTab("rapidos")} />
        <Chip label="Grandes" selected={tab === "detallados"} onPress={() => setTab("detallados")} />
      </View>

      {tab === "rapidos" ? (
        <FlatList
          data={quickExpenses.data?.pages.flatMap((p) => p.items) ?? []}
          keyExtractor={(item) => item.id}
          onEndReached={() => quickExpenses.hasNextPage && quickExpenses.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("GastoDetalle", { kind: "quick", expenseId: item.id })}
            >
              <Card className="mb-2">
                <View className="flex-row justify-between">
                  <Text className="text-surface-dark dark:text-white">{item.name}</Text>
                  <Text className="text-gray-500">{item.amount ? `$${item.amount}` : ""}</Text>
                </View>
                <Text className="text-xs text-gray-400 capitalize">{item.expense_type}</Text>
              </Card>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={detailedExpenses.data?.pages.flatMap((p) => p.items) ?? []}
          keyExtractor={(item) => item.id}
          onEndReached={() => detailedExpenses.hasNextPage && detailedExpenses.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("GastoDetalle", { kind: "detailed", expenseId: item.id })}
            >
              <Card className="mb-2">
                <View className="flex-row justify-between">
                  <Text className="text-surface-dark dark:text-white">{item.item_purchased}</Text>
                  <Text className="text-gray-500">${item.amount}</Text>
                </View>
                <Text className="text-xs text-gray-400 capitalize">{item.expense_kind}</Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
