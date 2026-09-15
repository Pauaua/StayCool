import React, { useState } from "react";
import { Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { FormScreen } from "@/components/ui/FormScreen";
import { StarRating } from "@/components/ui/StarRating";
import { useCreateDetailedTaste } from "@/features/gustos/hooks/useGustos";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { TasteCategory } from "@/features/gustos/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GustosStackParamList } from "@/navigation/types";

const CATEGORIES: { value: TasteCategory; key: TranslationKey; emoji: string }[] = [
  { value: "musica", key: "gustos.category.musica", emoji: "🎵" },
  { value: "serie", key: "gustos.category.serie", emoji: "📺" },
  { value: "pelicula", key: "gustos.category.pelicula", emoji: "🎬" },
  { value: "libro", key: "gustos.category.libro", emoji: "📚" },
  { value: "otro", key: "gustos.category.otro", emoji: "✨" },
];

type Props = NativeStackScreenProps<GustosStackParamList, "GustoDetallado">;

export function GustoDetalladoScreen({ navigation }: Props) {
  const [category, setCategory] = useState<TasteCategory>("musica");
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [notes, setNotes] = useState("");
  const { t } = useT();

  // Campos específicos por categoría, guardados en `details` (jsonb).
  const [favoriteBands, setFavoriteBands] = useState("");
  const [instruments, setInstruments] = useState("");
  const [rhythms, setRhythms] = useState("");
  const [director, setDirector] = useState("");
  const [cast, setCast] = useState("");
  const [season, setSeason] = useState("");
  const [author, setAuthor] = useState("");
  const [saga, setSaga] = useState("");
  const [rating, setRating] = useState(0);

  const create = useCreateDetailedTaste();

  async function handleSave() {
    if (!name.trim()) return;

    const details =
      category === "musica"
        ? { favoriteBands, instruments, rhythms }
        : category === "serie" || category === "pelicula"
        ? { director, cast, season: category === "serie" ? season : undefined }
        : category === "libro"
        ? { author, saga }
        : {};

    await create.mutateAsync({
      category,
      name: name.trim(),
      genre: genre.trim() || undefined,
      notes: notes.trim() || undefined,
      details,
      rating: rating || undefined,
    });
    navigation.goBack();
  }

  return (
    <FormScreen>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          {t("gustos.detailedTitle")}
        </Text>

        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">{t("gustos.category")}</Text>
        <View className="flex-row flex-wrap mb-3">
          {CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              label={t(c.key)}
              icon={c.emoji}
              selected={category === c.value}
              onPress={() => setCategory(c.value)}
            />
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
            {category === "serie" ? (
              <TextField label={t("gustos.season")} value={season} onChangeText={setSeason} />
            ) : null}
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

        <Button label={t("gustos.save")} onPress={handleSave} loading={create.isPending} />
    </FormScreen>
  );
}
