import React, { useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { StarRating } from "@/components/ui/StarRating";
import {
  useDeleteDetailedTaste,
  useDeleteQuickTaste,
  useDetailedTastes,
  useQuickTastes,
  useUpdateDetailedTaste,
  useUpdateQuickTaste,
} from "@/features/gustos/hooks/useGustos";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { DetailedTaste, QuickTaste, TasteCategory } from "@/features/gustos/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GustosStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<GustosStackParamList, "GustosHome">;

const CATEGORY_EMOJI: Record<string, string> = {
  musica: "🎵",
  serie: "📺",
  pelicula: "🎬",
  libro: "📚",
  otro: "✨",
};

const CATEGORY_KEY: Record<string, TranslationKey> = {
  musica: "gustos.category.musica",
  serie: "gustos.category.serie",
  pelicula: "gustos.category.pelicula",
  libro: "gustos.category.libro",
  otro: "gustos.category.otro",
};

const DETAILED_CATEGORIES: { value: TasteCategory; key: TranslationKey; emoji: string }[] = [
  { value: "musica", key: "gustos.category.musica", emoji: "🎵" },
  { value: "serie", key: "gustos.category.serie", emoji: "📺" },
  { value: "pelicula", key: "gustos.category.pelicula", emoji: "🎬" },
  { value: "libro", key: "gustos.category.libro", emoji: "📚" },
  { value: "otro", key: "gustos.category.otro", emoji: "✨" },
];

function QuickTasteEditModal({ taste, onClose }: { taste: QuickTaste | null; onClose: () => void }) {
  const update = useUpdateQuickTaste();
  const remove = useDeleteQuickTaste();
  const { t, tg } = useT();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);

  React.useEffect(() => {
    if (taste) {
      setName(taste.name);
      setDescription(taste.description ?? "");
      setRating(taste.rating ?? 0);
    }
  }, [taste]);

  function handleDelete() {
    if (!taste) return;
    Alert.alert(t("gustos.deleteTitle"), tg("gustos.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => remove.mutate(taste.id, { onSuccess: onClose }) },
    ]);
  }

  return (
    <Modal visible={taste !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <Card className="w-full">
          <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">{t("gustos.editTaste")}</Text>
          <TextField label={t("gustos.name")} value={name} onChangeText={setName} />
          <TextField label={t("gustos.descriptionOptional")} value={description} onChangeText={setDescription} multiline />
          <View className="mb-4">
            <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-1.5">
              {t("gustos.howMuchLiked")}
            </Text>
            <StarRating value={rating} onChange={setRating} />
          </View>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1">
              <Button
                label={t("common.saveChanges")}
                onPress={() =>
                  taste &&
                  name.trim() &&
                  update.mutate(
                    { id: taste.id, name: name.trim(), description: description.trim() || undefined, rating: rating || undefined },
                    { onSuccess: onClose }
                  )
                }
                loading={update.isPending}
              />
            </View>
            <View className="flex-1">
              <Button label={t("common.cancel")} variant="ghost" onPress={onClose} />
            </View>
          </View>
          <Pressable onPress={handleDelete} disabled={remove.isPending}>
            <Text className="text-xs text-accent-coral text-center">
              {remove.isPending ? t("common.deleting") : t("common.delete")}
            </Text>
          </Pressable>
        </Card>
      </View>
    </Modal>
  );
}

function DetailedTasteEditModal({ taste, onClose }: { taste: DetailedTaste | null; onClose: () => void }) {
  const update = useUpdateDetailedTaste();
  const remove = useDeleteDetailedTaste();
  const { t, tg } = useT();
  const [category, setCategory] = useState<TasteCategory>("musica");
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [notes, setNotes] = useState("");
  const [favoriteBands, setFavoriteBands] = useState("");
  const [instruments, setInstruments] = useState("");
  const [rhythms, setRhythms] = useState("");
  const [director, setDirector] = useState("");
  const [cast, setCast] = useState("");
  const [season, setSeason] = useState("");
  const [author, setAuthor] = useState("");
  const [saga, setSaga] = useState("");
  const [rating, setRating] = useState(0);

  React.useEffect(() => {
    if (taste) {
      setCategory(taste.category);
      setName(taste.name);
      setGenre(taste.genre ?? "");
      setNotes(taste.notes ?? "");
      setFavoriteBands(taste.details.favoriteBands ?? "");
      setInstruments(taste.details.instruments ?? "");
      setRhythms(taste.details.rhythms ?? "");
      setDirector(taste.details.director ?? "");
      setCast(taste.details.cast ?? "");
      setSeason(taste.details.season ?? "");
      setAuthor(taste.details.author ?? "");
      setSaga(taste.details.saga ?? "");
      setRating(taste.rating ?? 0);
    }
  }, [taste]);

  function handleDelete() {
    if (!taste) return;
    Alert.alert(t("gustos.deleteTitle"), tg("gustos.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => remove.mutate(taste.id, { onSuccess: onClose }) },
    ]);
  }

  function handleSave() {
    if (!taste || !name.trim()) return;
    const details =
      category === "musica"
        ? { favoriteBands, instruments, rhythms }
        : category === "serie" || category === "pelicula"
        ? { director, cast, season: category === "serie" ? season : undefined }
        : category === "libro"
        ? { author, saga }
        : {};
    update.mutate(
      { id: taste.id, category, name: name.trim(), genre: genre.trim() || undefined, notes: notes.trim() || undefined, details, rating: rating || undefined },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal visible={taste !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <Card className="w-full" style={{ maxHeight: "85%" }}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">{t("gustos.editTaste")}</Text>
            <View className="flex-row flex-wrap mb-3">
              {DETAILED_CATEGORIES.map((c) => (
                <Chip key={c.value} label={t(c.key)} icon={c.emoji} selected={category === c.value} onPress={() => setCategory(c.value)} />
              ))}
            </View>
            <TextField label={t("gustos.name")} value={name} onChangeText={setName} />
            <TextField label={t("gustos.genreOptional")} value={genre} onChangeText={setGenre} />
            {category === "musica" ? (
              <>
                <TextField label={t("gustos.favoriteBands")} value={favoriteBands} onChangeText={setFavoriteBands} />
                <TextField label={t("gustos.instruments")} value={instruments} onChangeText={setInstruments} />
                <TextField label={t("gustos.rhythms")} value={rhythms} onChangeText={setRhythms} />
              </>
            ) : null}
            {category === "serie" || category === "pelicula" ? (
              <>
                <TextField label={t("gustos.director")} value={director} onChangeText={setDirector} />
                <TextField label={t("gustos.cast")} value={cast} onChangeText={setCast} />
                {category === "serie" ? <TextField label={t("gustos.season")} value={season} onChangeText={setSeason} /> : null}
              </>
            ) : null}
            {category === "libro" ? (
              <>
                <TextField label={t("gustos.author")} value={author} onChangeText={setAuthor} />
                <TextField label={t("gustos.sagaOptional")} value={saga} onChangeText={setSaga} />
              </>
            ) : null}
            <TextField label={t("gustos.notesOptional")} value={notes} onChangeText={setNotes} multiline />
            <View className="mb-4">
              <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-1.5">
                {t("gustos.howMuchLiked")}
              </Text>
              <StarRating value={rating} onChange={setRating} />
            </View>
            <View className="flex-row gap-2 mb-2">
              <View className="flex-1">
                <Button label={t("common.saveChanges")} onPress={handleSave} loading={update.isPending} />
              </View>
              <View className="flex-1">
                <Button label={t("common.cancel")} variant="ghost" onPress={onClose} />
              </View>
            </View>
            <Pressable onPress={handleDelete} disabled={remove.isPending}>
              <Text className="text-xs text-accent-coral text-center">
                {remove.isPending ? t("common.deleting") : t("common.delete")}
              </Text>
            </Pressable>
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
}

export function GustosHomeScreen({ navigation }: Props) {
  const [tab, setTab] = useState<"rapido" | "detallado">("rapido");
  const quick = useQuickTastes();
  const detailed = useDetailedTastes();
  const [editingQuick, setEditingQuick] = useState<QuickTaste | null>(null);
  const [editingDetailed, setEditingDetailed] = useState<DetailedTaste | null>(null);
  const { t } = useT();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-8">
      <View className="flex-row items-center mb-4">
        <Image
          source={require("../../../../assets/images/musica2.png")}
          style={{ width: 56, height: 56, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-surface-dark dark:text-white">{t("gustos.title")}</Text>
      </View>



      <View className="mb-4">
        <View className="mb-2">
          <Button label={t("gustos.quickRecord")} onPress={() => navigation.navigate("GustoRapido")} />
        </View>
        <Button
          label={t("gustos.musicSeriesBooks")}
          variant="secondary"
          onPress={() => navigation.navigate("GustoDetallado")}
        />
      </View>
      <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
        {t("gustos.record")}
      </Text>
      <View className="flex-row mb-3">
        <Chip label={t("gustos.quickTab")} selected={tab === "rapido"} onPress={() => setTab("rapido")} />
        <Chip label={t("gustos.detailedTab")} selected={tab === "detallado"} onPress={() => setTab("detallado")} />
      </View>

      {tab === "rapido" ? (
        <FlatList
          contentContainerStyle={{ paddingBottom: 40 }}
          data={quick.data?.pages.flatMap((p) => p.items) ?? []}
          keyExtractor={(item) => item.id}
          onEndReached={() => quick.hasNextPage && quick.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Pressable onPress={() => setEditingQuick(item)}>
              <Card className="mb-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-surface-dark dark:text-white font-semibold flex-1 pr-2">{item.name}</Text>
                  {item.rating ? <StarRating value={item.rating} size={14} /> : null}
                </View>
                {item.description ? (
                  <Text className="text-gray-500 text-sm">{item.description}</Text>
                ) : null}
                <Text className="text-xs text-gray-400">{format(new Date(item.logged_at), "dd MMM yyyy")}</Text>
              </Card>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: 40 }}
          data={detailed.data?.pages.flatMap((p) => p.items) ?? []}
          keyExtractor={(item) => item.id}
          onEndReached={() => detailed.hasNextPage && detailed.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Pressable onPress={() => setEditingDetailed(item)}>
              <Card className="mb-2">
                <View className="flex-row justify-between">
                  <Text className="text-surface-dark dark:text-white font-semibold flex-1 pr-2" numberOfLines={1}>
                    {CATEGORY_EMOJI[item.category] ?? "✨"} {item.name}
                  </Text>
                  <Text className="text-xs text-gray-400 capitalize flex-shrink-0">
                    {t(CATEGORY_KEY[item.category] ?? "gustos.category.otro")}
                  </Text>
                </View>
                {item.rating ? (
                  <View className="mt-1">
                    <StarRating value={item.rating} size={14} />
                  </View>
                ) : null}
                {item.genre ? (
                  <Text className="text-gray-500 text-sm">{t("gustos.genreLabel", { value: item.genre })}</Text>
                ) : null}
                {item.details.favoriteBands ? (
                  <Text className="text-gray-500 text-sm">
                    {t("gustos.bandsLabel", { value: item.details.favoriteBands })}
                  </Text>
                ) : null}
                {item.details.author ? (
                  <Text className="text-gray-500 text-sm">
                    {t("gustos.authorLabel", { value: item.details.author })}
                  </Text>
                ) : null}
                {item.details.director ? (
                  <Text className="text-gray-500 text-sm">
                    {t("gustos.directorLabel", { value: item.details.director })}
                  </Text>
                ) : null}
              </Card>
            </Pressable>
          )}
        />
      )}

      <QuickTasteEditModal taste={editingQuick} onClose={() => setEditingQuick(null)} />
      <DetailedTasteEditModal taste={editingDetailed} onClose={() => setEditingDetailed(null)} />
    </SafeAreaView>
  );
}
