import React, { useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, SafeAreaView, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import {
  useDeleteExercise,
  useDeleteMeal,
  useDeleteMood,
  useExerciseHistory,
  useLogExercise,
  useLogMeal,
  useMeals,
  useMoodHistory,
  useUpdateExercise,
  useUpdateMeal,
  useUpdateMood,
  useUpsertMood,
} from "@/features/bienestar/hooks/useBienestar";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { ExerciseLog, Meal, MealCategory, Mood, MoodLog } from "@/features/bienestar/types";

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

function MoodRow({ log, onEdit }: { log: MoodLog; onEdit: (log: MoodLog) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { t, tg } = useT();
  const deleteMood = useDeleteMood();

  function handleDelete() {
    Alert.alert(t("bienestar.deleteMoodTitle"), tg("bienestar.deleteMoodMessage"), [
      { text: t("bienestar.cancel"), style: "cancel" },
      { text: t("bienestar.delete"), style: "destructive", onPress: () => deleteMood.mutate(log.id) },
    ]);
  }

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
          <Text className="text-sm text-gray-500 mb-3">{log.note || t("bienestar.noDescription")}</Text>
          <View className="flex-row gap-4">
            <Pressable onPress={() => onEdit(log)}>
              <Text className="text-sm text-brand-500 font-semibold">{t("bienestar.edit")}</Text>
            </Pressable>
            <Pressable onPress={handleDelete} disabled={deleteMood.isPending}>
              <Text className="text-sm text-accent-coral font-semibold">
                {deleteMood.isPending ? t("bienestar.deleting") : t("bienestar.delete")}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

export function BienestarHomeScreen() {
  const { t, tg } = useT();
  const meals = useMeals();
  const logMeal = useLogMeal();
  const updateMeal = useUpdateMeal();
  const deleteMeal = useDeleteMeal();
  const logExercise = useLogExercise();
  const updateExercise = useUpdateExercise();
  const deleteExercise = useDeleteExercise();
  const exerciseHistory = useExerciseHistory();
  const upsertMood = useUpsertMood();
  const updateMood = useUpdateMood();
  const moodHistory = useMoodHistory();
  const [moodModal, setMoodModal] = useState<Mood | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editMealDescription, setEditMealDescription] = useState("");
  const [editMealCategory, setEditMealCategory] = useState<MealCategory>("almuerzo");
  const [editMealRating, setEditMealRating] = useState(0);
  const [editingExercise, setEditingExercise] = useState<ExerciseLog | null>(null);
  const [editExerciseType, setEditExerciseType] = useState("");
  const [editExerciseDuration, setEditExerciseDuration] = useState("");
  const [editExerciseSets, setEditExerciseSets] = useState("");
  const [editExerciseWeight, setEditExerciseWeight] = useState("");
  const [editingMood, setEditingMood] = useState<MoodLog | null>(null);
  const [editMoodValue, setEditMoodValue] = useState<Mood>("bien");
  const [editMoodNote, setEditMoodNote] = useState("");

  function openEditMeal(meal: { id: string; description: string; category: string | null; rating: number | null }) {
    setEditingMeal(meal as Meal);
    setEditMealDescription(meal.description);
    setEditMealCategory((meal.category as MealCategory) ?? "almuerzo");
    setEditMealRating(meal.rating ?? 0);
  }

  function handleDeleteMeal(id: string) {
    Alert.alert(t("bienestar.deleteMealTitle"), tg("bienestar.deleteMealMessage"), [
      { text: t("bienestar.cancel"), style: "cancel" },
      { text: t("bienestar.delete"), style: "destructive", onPress: () => deleteMeal.mutate(id) },
    ]);
  }

  function openEditExercise(log: ExerciseLog) {
    setEditingExercise(log);
    setEditExerciseType(log.exercise_type);
    setEditExerciseDuration(log.duration_minutes ? String(log.duration_minutes) : "");
    setEditExerciseSets(log.sets ? String(log.sets) : "");
    setEditExerciseWeight(log.weight_kg ? String(log.weight_kg) : "");
  }

  function handleDeleteExercise(id: string) {
    Alert.alert(t("bienestar.deleteExerciseTitle"), tg("bienestar.deleteExerciseMessage"), [
      { text: t("bienestar.cancel"), style: "cancel" },
      { text: t("bienestar.delete"), style: "destructive", onPress: () => deleteExercise.mutate(id) },
    ]);
  }

  function openEditMood(log: MoodLog) {
    setEditingMood(log);
    setEditMoodValue(log.mood);
    setEditMoodNote(log.note ?? "");
  }
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
            <View className="flex-row items-center mb-4">
              <Image
                source={require("../../../../assets/images/bienestar(_).png")}
                style={{ width: 56, height: 56, marginRight: 8 }}
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-surface-dark dark:text-white">
                {t("bienestar.title")}
              </Text>
            </View>

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
                  <MoodRow key={log.id} log={log} onEdit={openEditMood} />
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
            <View className="flex-row gap-4 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <Pressable onPress={() => openEditMeal(item)}>
                <Text className="text-xs text-brand-500 font-semibold">{t("bienestar.edit")}</Text>
              </Pressable>
              <Pressable onPress={() => handleDeleteMeal(item.id)}>
                <Text className="text-xs text-accent-coral font-semibold">{t("bienestar.delete")}</Text>
              </Pressable>
            </View>
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
                    <View className="flex-row gap-4 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <Pressable onPress={() => openEditExercise(log)}>
                        <Text className="text-xs text-brand-500 font-semibold">{t("bienestar.edit")}</Text>
                      </Pressable>
                      <Pressable onPress={() => handleDeleteExercise(log.id)}>
                        <Text className="text-xs text-accent-coral font-semibold">{t("bienestar.delete")}</Text>
                      </Pressable>
                    </View>
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

      <Modal
        visible={editingMeal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingMeal(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <Card className="w-full">
            <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">
              {t("bienestar.editMeal")}
            </Text>
            <View className="flex-row flex-wrap mb-2">
              {CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  label={t(MEAL_KEY[c])}
                  selected={editMealCategory === c}
                  onPress={() => setEditMealCategory(c)}
                />
              ))}
            </View>
            <TextField
              label={t("bienestar.whatAte")}
              value={editMealDescription}
              onChangeText={setEditMealDescription}
            />
            <View className="mb-4">
              <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-1.5">
                {t("bienestar.howWasIt")}
              </Text>
              <StarRating value={editMealRating} onChange={setEditMealRating} />
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  label={t("bienestar.saveChanges")}
                  onPress={() => {
                    if (!editingMeal || !editMealDescription.trim()) return;
                    updateMeal.mutate({
                      id: editingMeal.id,
                      description: editMealDescription.trim(),
                      category: editMealCategory,
                      rating: editMealRating || undefined,
                    });
                    setEditingMeal(null);
                  }}
                  loading={updateMeal.isPending}
                />
              </View>
              <View className="flex-1">
                <Button label={t("bienestar.cancel")} variant="ghost" onPress={() => setEditingMeal(null)} />
              </View>
            </View>
          </Card>
        </View>
      </Modal>

      <Modal
        visible={editingExercise !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingExercise(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <Card className="w-full">
            <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">
              {t("bienestar.editExercise")}
            </Text>
            <TextField
              label={t("bienestar.exerciseName")}
              value={editExerciseType}
              onChangeText={setEditExerciseType}
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField
                  label={t("bienestar.sets")}
                  keyboardType="numeric"
                  value={editExerciseSets}
                  onChangeText={setEditExerciseSets}
                />
              </View>
              <View className="flex-1">
                <TextField
                  label={t("bienestar.weightKg")}
                  keyboardType="numeric"
                  value={editExerciseWeight}
                  onChangeText={setEditExerciseWeight}
                />
              </View>
            </View>
            <TextField
              label={t("bienestar.durationMin")}
              keyboardType="numeric"
              value={editExerciseDuration}
              onChangeText={setEditExerciseDuration}
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  label={t("bienestar.saveChanges")}
                  onPress={() => {
                    if (!editingExercise || !editExerciseType.trim()) return;
                    updateExercise.mutate({
                      id: editingExercise.id,
                      exerciseType: editExerciseType.trim(),
                      durationMinutes: editExerciseDuration ? Number(editExerciseDuration) : undefined,
                      sets: editExerciseSets ? Number(editExerciseSets) : undefined,
                      weightKg: editExerciseWeight ? Number(editExerciseWeight) : undefined,
                    });
                    setEditingExercise(null);
                  }}
                  loading={updateExercise.isPending}
                />
              </View>
              <View className="flex-1">
                <Button label={t("bienestar.cancel")} variant="ghost" onPress={() => setEditingExercise(null)} />
              </View>
            </View>
          </Card>
        </View>
      </Modal>

      <Modal
        visible={editingMood !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingMood(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <Card className="w-full">
            <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">
              {t("bienestar.editMood")}
            </Text>
            <View className="flex-row flex-wrap mb-3">
              {MOODS.map((m) => (
                <Chip
                  key={m.mood}
                  icon={m.emoji}
                  label=""
                  selected={editMoodValue === m.mood}
                  onPress={() => setEditMoodValue(m.mood)}
                />
              ))}
            </View>
            <TextField
              label={t("bienestar.tellMore")}
              value={editMoodNote}
              onChangeText={setEditMoodNote}
              multiline
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  label={t("bienestar.saveChanges")}
                  onPress={() => {
                    if (!editingMood) return;
                    updateMood.mutate({
                      id: editingMood.id,
                      mood: editMoodValue,
                      note: editMoodNote.trim() || undefined,
                    });
                    setEditingMood(null);
                  }}
                  loading={updateMood.isPending}
                />
              </View>
              <View className="flex-1">
                <Button label={t("bienestar.cancel")} variant="ghost" onPress={() => setEditingMood(null)} />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
