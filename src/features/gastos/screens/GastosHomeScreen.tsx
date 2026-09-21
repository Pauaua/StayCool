import React, { useState } from "react";
import { FlatList, Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { format, startOfMonth } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useDetailedExpenses, useExpenseSummary, useQuickExpenses } from "@/features/gastos/hooks/useGastos";
import { useProfile, useUpdateProfile } from "@/features/home/hooks/useProfile";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GastosStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<GastosStackParamList, "GastosHome">;

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

function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString("es-CL");
}

function BudgetCard({ totalSpent }: { totalSpent: number }) {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const { t } = useT();

  const budget = profile?.monthly_budget ?? null;
  const remaining = budget !== null ? budget - totalSpent : null;

  if (editing || budget === null) {
    return (
      <Card className="mb-4">
        <Text className="text-lg font-bold text-surface-dark dark:text-white mb-2">
          {t("gastos.monthlyBudget")}
        </Text>
        <TextField
          label={t("gastos.amount")}
          keyboardType="numeric"
          value={budgetInput}
          onChangeText={setBudgetInput}
          placeholder={budget !== null ? String(budget) : t("gastos.amountPlaceholder")}
        />
        <Button
          label={t("gastos.saveBudget")}
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
        <View className="flex-1 pr-2">
          <Text className="text-sm text-gray-500 mb-1">{t("gastos.availableThisMonth")}</Text>
          <Text
            className={`text-3xl font-bold ${
              (remaining ?? 0) < 0 ? "text-accent-coral" : "text-brand-500"
            }`}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            ${remaining !== null ? formatMoney(remaining) : "—"}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {t("gastos.ofBudgeted", { amount: formatMoney(budget) })}
          </Text>
        </View>
        <Pressable onPress={() => setEditing(true)} className="flex-shrink-0">
          <Text className="text-brand-500 text-sm">{t("gastos.edit")}</Text>
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
  const { data: profile } = useProfile();
  const { t } = useT();
  const [tab, setTab] = useState<"rapidos" | "detallados">("rapidos");

  const remainingBudget = (profile?.monthly_budget ?? 0) - (summary.data?.total ?? 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <View className="flex-row items-center mb-4">
        <Image
          source={require("../../../../assets/images/Dineral2.png")}
          style={{ width: 56, height: 56, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-surface-dark dark:text-white">{t("gastos.title")}</Text>
      </View>

      <BudgetCard totalSpent={summary.data?.total ?? 0} />

      <Card className="mb-4">
        <Text className="text-sm text-gray-500 mb-1">{t("gastos.totalSpentThisMonth")}</Text>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white">
          ${summary.data ? formatMoney(summary.data.total) : "—"}
        </Text>
        {summary.data &&
          Object.entries(summary.data.breakdown).map(([type, amount]) => (
            <View key={type} className="flex-row justify-between mt-2">
              <Text className="text-surface-dark dark:text-white capitalize">
                {t(EXPENSE_TYPE_KEY[type] ?? "gastos.type.otro")}
              </Text>
              <Text className="text-gray-500">${formatMoney(amount)}</Text>
            </View>
          ))}
      </Card>

      {profile?.monthly_budget != null ? (
        <Card className="mb-4">
          <Text className="text-sm text-gray-500 mb-1">{t("gastos.remainingMoney")}</Text>
          <Text
            className={`text-2xl font-bold ${
              remainingBudget < 0 ? "text-accent-coral" : "text-surface-dark dark:text-white"
            }`}
          >
            ${formatMoney(remainingBudget)}
          </Text>
        </Card>
      ) : null}

      <View className="mb-4">
        <View className="mb-2">
          <Button label={t("gastos.quickExpense")} onPress={() => navigation.navigate("GastoRapido")} />
        </View>
        <Button
          label={t("gastos.bigExpense")}
          variant="secondary"
          onPress={() => navigation.navigate("GastoDetallado")}
        />
      </View>

      <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
        {t("gastos.history")}
      </Text>

      <View className="flex-row mb-3">
        <Chip label={t("gastos.quickTab")} selected={tab === "rapidos"} onPress={() => setTab("rapidos")} />
        <Chip label={t("gastos.bigTab")} selected={tab === "detallados"} onPress={() => setTab("detallados")} />
      </View>

      {tab === "rapidos" ? (
        <FlatList
          contentContainerStyle={{ paddingBottom: 40 }}
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
                  <Text className="text-surface-dark dark:text-white flex-1 pr-2" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-gray-500 flex-shrink-0">
                    {item.amount ? `$${formatMoney(item.amount)}` : ""}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400 capitalize">
                  {t(EXPENSE_TYPE_KEY[item.expense_type] ?? "gastos.type.otro")}
                </Text>
              </Card>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: 40 }}
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
                  <Text className="text-surface-dark dark:text-white flex-1 pr-2" numberOfLines={1}>
                    {item.item_purchased}
                  </Text>
                  <Text className="text-gray-500 flex-shrink-0">${formatMoney(item.amount)}</Text>
                </View>
                <Text className="text-xs text-gray-400 capitalize">
                  {t(EXPENSE_KIND_KEY[item.expense_kind] ?? "gastos.kind.extra")}
                </Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
