import React, { useState } from "react";
import { FlatList, Modal, Pressable, SafeAreaView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import {
  useExerciseHistory,
  useLogExercise,
  useLogMeal,
  useMeals,
  useMoodHistory,
  useUpsertMood,
} from "@/features/bienestar/hooks/useBienestar";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { MealCategory, Mood, MoodLog } from "@/features/bienestar/types";

const CATEGORIES: MealCategory[] = ["desayuno", "almuerzo", "cena", "snack"];
const MOODS: { mood: Mood; emoji: string }[] = [
  { mood: "genial", emoji: "🤩" },
  { mood: "bien", emoji: "🙂" },
  { mood: "neutral", emoji: "😐" },
  { mood: "mal", emoji: "😞" },
  { mood: "agotado", emoji: "🥱" },
];
const MOOD_EMOJI: Record<Mood, string> = Object.fromEntries(
  MOODS.map((m) => [m.mood, m.emoji])
) as Record<Mood, string>;
const MOOD_KEY: Record<Mood, TranslationKey> = {
  genial: "bienestar.mood.genial",
  bien: "bienestar.mood.bien",
  neutral: "bienestar.mood.neutral",
  mal: "bienestar.mood.mal",
  agotado: "bienestar.mood.agotado",
};
const MEAL_KEY: Record<MealCategory, TranslationKey> = {
  desayuno: "bienestar.meal.desayuno",
  almuerzo: "bienestar.meal.almuerzo",
  cena: "bienestar.meal.cena",
  snack: "bienestar.meal.snack",
};

function MoodRow({ log }: { log: MoodLog }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useT();
  return (
    <Card className="mb-2">
      <Pressable onPress={() => setExpanded((v) => !v)} className="flex-row justify-between items-center">
        <Text className="text-surface-dark dark:text-white font-semibold flex-1 pr-2">
          {MOOD_EMOJI[log.mood]} {t(MOOD_KEY[log.mood])} · {log.mood_date}
        </Text>
        <Text className="text-gray-400">{expanded ? "▲" : "▼"}</Text>
      </Pressable>
      {expanded ? (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Text className="text-sm text-gray-500">{log.note || t("bienestar.noDescription")}</Text>
        </View>
      ) : null}
    </Card>
  );
}

export function BienestarHomeScreen() {
  const { t } = useT();
  const meals = useMeals();
  const logMeal = useLogMeal();
  const logExercise = useLogExercise();
  const exerciseHistory = useExerciseHistory();
  const upsertMood = useUpsertMood();
  const moodHistory = useMoodHistory();
  const [moodModal, setMoodModal] = useState<Mood | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MealCategory>("almuerzo");
  const [mealRating, setMealRating] = useState(0);
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState("");
  const [exerciseSets, setExerciseSets] = useState("");
  const [exerciseWeight, setExerciseWeight] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        data={meals.data?.pages.flatMap((p) => p.items) ?? []}
        keyExtractor={(item) => item.id}
        onEndReached={() => meals.hasNextPage && meals.fetchNextPage()}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <>
            <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
              {t("bienestar.title")}
            </Text>

            <Card className="mb-4">
              <Text className="text-xl font-bold text-surface-dark dark:text-white mb-3">
                {t("bienestar.howFeel")}
              </Text>
              <View className="flex-row flex-wrap">
                {MOODS.map((m) => (
                  <Chip
                    key={m.mood}
                    icon={m.emoji}
                    label=""
                    onPress={() => {
                      setMoodNote("");
                      setMoodModal(m.mood);
                    }}
                  />
                ))}
              </View>
            </Card>

            <Card className="mb-4">
              <Text className="text-xl font-bold text-surface-dark dark:text-white mb-3">
                {t("bienestar.logMeal")}
              </Text>
              <View className="flex-row flex-wrap mb-2">
                {CATEGORIES.map((c) => (
                  <Chip key={c} label={t(MEAL_KEY[c])} selected={category === c} onPress={() => setCategory(c)} />
                ))}
              </View>
              <TextField label={t("bienestar.whatAte")} value={description} onChangeText={setDescription} />
              <View className="mb-4">
                <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-1.5">
                  {t("bienestar.howWasIt")}
                </Text>
                <StarRating value={mealRating} onChange={setMealRating} />
              </View>
              <Button
                label={t("bienestar.save")}
                onPress={() => {
                  if (!description.trim()) return;
                  logMeal.mutate({
                    description: description.trim(),
                    category,
                    rating: mealRating || undefined,
                  });
                  setDescription("");
                  setMealRating(0);
                }}
                loading={logMeal.isPending}
              />
            </Card>

            <Card className="mb-4">
              <Text className="text-xl font-bold text-surface-dark dark:text-white mb-3">
                {t("bienestar.logExercise")}
              </Text>
              <TextField label={t("bienestar.exerciseName")} value={exerciseType} onChangeText={setExerciseType} />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextField
                    label={t("bienestar.sets")}
                    keyboardType="numeric"
                    value={exerciseSets}
                    onChangeText={setExerciseSets}
                  />
                </View>
                <View className="flex-1">
                  <TextField
                    label={t("bienestar.weightKg")}
                    keyboardType="numeric"
                    value={exerciseWeight}
                    onChangeText={setExerciseWeight}
                  />
                </View>
              </View>
              <TextField
                label={t("bienestar.durationMin")}
                keyboardType="numeric"
                value={exerciseDuration}
                onChangeText={setExerciseDuration}
              />
              <Button
                label={t("bienestar.save")}
                variant="secondary"
                onPress={() => {
                  if (!exerciseType.trim()) return;
                  logExercise.mutate({
                    exerciseType: exerciseType.trim(),
                    durationMinutes: exerciseDuration ? Number(exerciseDuration) : undefined,
                    sets: exerciseSets ? Number(exerciseSets) : undefined,
                    weightKg: exerciseWeight ? Number(exerciseWeight) : undefined,
                  });
                  setExerciseType("");
                  setExerciseDuration("");
                  setExerciseSets("");
                  setExerciseWeight("");
                }}
                loading={logExercise.isPending}
              />
            </Card>

            <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-3">
              {t("bienestar.records")}
            </Text>

            <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
              {t("bienestar.moods")}
            </Text>
            {moodHistory.data && moodHistory.data.length > 0 ? (
              <View className="mb-4">
                {moodHistory.data.map((log) => (
                  <MoodRow key={log.id} log={log} />
                ))}
              </View>
            ) : (
              <Text className="text-sm text-gray-400 mb-4">{t("bienestar.noMoods")}</Text>
            )}

            <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
              {t("bienestar.meals")}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <Card className="mb-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-surface-dark dark:text-white flex-1 pr-2">{item.description}</Text>
              {item.rating ? <StarRating value={item.rating} size={14} /> : null}
            </View>
            <Text className="text-xs text-gray-400 capitalize">
              {item.category ? t(MEAL_KEY[item.category as MealCategory]) : ""} · {item.meal_date}
            </Text>
          </Card>
        )}
        ListFooterComponent={
          <>
            <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2 mt-2">
              {t("bienestar.exercise")}
            </Text>
            {exerciseHistory.data && exerciseHistory.data.length > 0 ? (
              <View>
                {exerciseHistory.data.map((log) => (
                  <Card key={log.id} className="mb-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-surface-dark dark:text-white font-semibold">
                        {log.exercise_type}
                      </Text>
                      <Text className="text-xs text-gray-400">{log.exercise_date}</Text>
                    </View>
                    <Text className="text-xs text-gray-400 mt-1">
                      {[
                        log.sets ? t("bienestar.setsShort", { n: String(log.sets) }) : null,
                        log.weight_kg ? `${log.weight_kg}kg` : null,
                        log.duration_minutes ? t("bienestar.minShort", { n: String(log.duration_minutes) }) : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || t("bienestar.noMoreDetails")}
                    </Text>
                  </Card>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-gray-400">{t("bienestar.noExercise")}</Text>
            )}
          </>
        }
      />

      <Modal visible={moodModal !== null} transparent animationType="fade" onRequestClose={() => setMoodModal(null)}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <Card className="w-full">
            <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">
              {t("bienestar.whyFeel", { mood: moodModal ? t(MOOD_KEY[moodModal]) : "" })}
            </Text>
            <TextField
              label={t("bienestar.tellMore")}
              value={moodNote}
              onChangeText={setMoodNote}
              multiline
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  label={t("bienestar.save")}
                  onPress={() => {
                    if (!moodModal) return;
                    upsertMood.mutate({ mood: moodModal, note: moodNote.trim() || undefined });
                    setMoodModal(null);
                  }}
                  loading={upsertMood.isPending}
                />
              </View>
              <View className="flex-1">
                <Button label={t("bienestar.cancel")} variant="ghost" onPress={() => setMoodModal(null)} />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
