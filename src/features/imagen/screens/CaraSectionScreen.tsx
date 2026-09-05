import React, { useState } from "react";
import { FlatList, SafeAreaView, Switch, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUpsertFaceLog, useWeekFaceLogs } from "@/features/imagen/hooks/useImagen";

export function CaraSectionScreen() {
  const week = useWeekFaceLogs();
  const upsert = useUpsertFaceLog();
  const [woreMakeup, setWoreMakeup] = useState(false);

  const makeupDaysThisWeek = (week.data ?? []).filter((d) => d.wore_makeup).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">Cara</Text>

      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-surface-dark dark:text-white">¿Te maquillaste hoy?</Text>
          <Switch value={woreMakeup} onValueChange={setWoreMakeup} />
        </View>
        <Button
          label="Guardar"
          onPress={() => upsert.mutate({ woreMakeup })}
          loading={upsert.isPending}
        />
      </Card>

      <Card className="mb-4">
        <Text className="text-surface-dark dark:text-white">
          Te maquillaste {makeupDaysThisWeek} {makeupDaysThisWeek === 1 ? "vez" : "veces"} esta semana
        </Text>
      </Card>

      <FlatList
        data={week.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card className="mb-2">
            <Text className="text-xs text-gray-400">
              {item.face_date} · {item.wore_makeup ? "Maquillada" : "Sin maquillaje"}
            </Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
