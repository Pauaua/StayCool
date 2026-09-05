import React, { useState } from "react";
import { Text, View } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { FormScreen } from "@/components/ui/FormScreen";
import { useCreateDetailedTaste } from "@/features/gustos/hooks/useGustos";
import type { TasteCategory } from "@/features/gustos/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GustosStackParamList } from "@/navigation/types";

const CATEGORIES: { value: TasteCategory; label: string; emoji: string }[] = [
  { value: "musica", label: "Música", emoji: "🎵" },
  { value: "serie", label: "Serie", emoji: "📺" },
  { value: "pelicula", label: "Película", emoji: "🎬" },
  { value: "libro", label: "Libro", emoji: "📚" },
  { value: "otro", label: "Otro", emoji: "✨" },
];

type Props = NativeStackScreenProps<GustosStackParamList, "GustoDetallado">;

export function GustoDetalladoScreen({ navigation }: Props) {
  const [category, setCategory] = useState<TasteCategory>("musica");
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [notes, setNotes] = useState("");

  // Campos específicos por categoría, guardados en `details` (jsonb).
  const [favoriteBands, setFavoriteBands] = useState("");
  const [instruments, setInstruments] = useState("");
  const [rhythms, setRhythms] = useState("");
  const [director, setDirector] = useState("");
  const [cast, setCast] = useState("");
  const [season, setSeason] = useState("");
  const [author, setAuthor] = useState("");
  const [saga, setSaga] = useState("");

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
    });
    navigation.goBack();
  }

  return (
    <FormScreen>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          Música, series, películas y libros
        </Text>

        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">Categoría</Text>
        <View className="flex-row flex-wrap mb-3">
          {CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              label={c.label}
              icon={c.emoji}
              selected={category === c.value}
              onPress={() => setCategory(c.value)}
            />
          ))}
        </View>

        <TextField label="Nombre" value={name} onChangeText={setName} />
        <TextField label="Género (opcional)" value={genre} onChangeText={setGenre} />

        {category === "musica" ? (
          <>
            <TextField label="Bandas/artistas favoritos" value={favoriteBands} onChangeText={setFavoriteBands} />
            <TextField label="Instrumentos" value={instruments} onChangeText={setInstruments} />
            <TextField label="Ritmos" value={rhythms} onChangeText={setRhythms} />
          </>
        ) : null}

        {category === "serie" || category === "pelicula" ? (
          <>
            <TextField label="Director" value={director} onChangeText={setDirector} />
            <TextField label="Elenco" value={cast} onChangeText={setCast} />
            {category === "serie" ? (
              <TextField label="Temporada" value={season} onChangeText={setSeason} />
            ) : null}
          </>
        ) : null}

        {category === "libro" ? (
          <>
            <TextField label="Autor" value={author} onChangeText={setAuthor} />
            <TextField label="Saga (opcional)" value={saga} onChangeText={setSaga} />
          </>
        ) : null}

        <TextField label="Notas (opcional)" value={notes} onChangeText={setNotes} multiline />

        <Button label="Guardar" onPress={handleSave} loading={create.isPending} />
    </FormScreen>
  );
}
