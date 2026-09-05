import React, { useState } from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useLogExercise, useLogMeal, useMeals, useUpsertMood } from "@/features/bienestar/hooks/useBienestar";
import type { MealCategory, Mood } from "@/features/bienestar/types";

const CATEGORIES: MealCategory[] = ["desayuno", "almuerzo", "cena", "snack"];
const MOODS: { mood: Mood; emoji: string }[] = [
  { mood: "genial", emoji: "🤩" },
  { mood: "bien", emoji: "🙂" },
  { mood: "neutral", emoji: "😐" },
  { mood: "mal", emoji: "😞" },
  { mood: "agotado", emoji: "🥱" },
];

export function BienestarHomeScreen() {
  const meals = useMeals();
  const logMeal = useLogMeal();
  const logExercise = useLogExercise();
  const upsertMood = useUpsertMood();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MealCategory>("almuerzo");
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">Bienestar</Text>

      <Card className="mb-4">
        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
          ¿Cómo te sientes hoy?
        </Text>
        <View className="flex-row justify-between">
          {MOODS.map((m) => (
            <Chip key={m.mood} icon={m.emoji} label="" onPress={() => upsertMood.mutate({ mood: m.mood })} />
          ))}
        </View>
      </Card>

      <Card className="mb-4">
        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
          Registrar comida
        </Text>
        <View className="flex-row flex-wrap mb-2">
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>
        <TextField label="¿Qué comiste?" value={description} onChangeText={setDescription} />
        <Button
          label="Guardar"
          onPress={() => {
            if (!description.trim()) return;
            logMeal.mutate({ description: description.trim(), category });
            setDescription("");
          }}
          loading={logMeal.isPending}
        />
      </Card>

      <Card className="mb-4">
        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
          Registrar ejercicio (opcional)
        </Text>
        <TextField label="Tipo" value={exerciseType} onChangeText={setExerciseType} />
        <TextField
          label="Duración (minutos)"
          keyboardType="numeric"
          value={exerciseDuration}
          onChangeText={setExerciseDuration}
        />
        <Button
          label="Guardar"
          variant="secondary"
          onPress={() => {
            if (!exerciseType.trim()) return;
            logExercise.mutate({
              exerciseType: exerciseType.trim(),
              durationMinutes: exerciseDuration ? Number(exerciseDuration) : undefined,
            });
            setExerciseType("");
            setExerciseDuration("");
          }}
          loading={logExercise.isPending}
        />
      </Card>

      <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
        Últimas comidas
      </Text>
      <FlatList
        style={{ flex: 1 }}
        data={meals.data?.pages.flatMap((p) => p.items) ?? []}
        keyExtractor={(item) => item.id}
        onEndReached={() => meals.hasNextPage && meals.fetchNextPage()}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <Card className="mb-2">
            <Text className="text-surface-dark dark:text-white">{item.description}</Text>
            <Text className="text-xs text-gray-400 capitalize">
              {item.category} · {item.meal_date}
            </Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
