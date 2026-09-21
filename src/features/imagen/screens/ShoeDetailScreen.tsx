import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useDeleteShoe, useShoeDetail, useUpdateShoe } from "@/features/imagen/hooks/useImagen";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { OutfitWeather, ShoeCondition, ShoeType } from "@/features/imagen/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ImagenStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ImagenStackParamList, "ShoeDetail">;

const WEATHER_KEYS: Record<string, TranslationKey> = {
  frio: "weather.frio",
  calor: "weather.calor",
  intermedio: "weather.intermedio",
};

const SHOE_TYPE_KEYS: Record<string, TranslationKey> = {
  sandalia: "shoeType.sandalia",
  zapatilla: "shoeType.zapatilla",
  botines: "shoeType.botines",
  bototos: "shoeType.bototos",
  trekking: "shoeType.trekking",
  otro: "shoeType.otro",
};

const CONDITION_KEYS: Record<string, TranslationKey> = {
  bueno: "shoeCondition.bueno",
  pasable: "shoeCondition.pasable",
  necesita_cambio: "shoeCondition.necesita_cambio",
};

const WEATHERS: { value: OutfitWeather; key: TranslationKey }[] = [
  { value: "frio", key: "weather.frio" },
  { value: "calor", key: "weather.calor" },
  { value: "intermedio", key: "weather.intermedio" },
];

const SHOE_TYPES: { value: ShoeType; key: TranslationKey }[] = [
  { value: "sandalia", key: "shoeType.sandalia" },
  { value: "zapatilla", key: "shoeType.zapatilla" },
  { value: "botines", key: "shoeType.botines" },
  { value: "bototos", key: "shoeType.bototos" },
  { value: "trekking", key: "shoeType.trekking" },
  { value: "otro", key: "shoeType.otro" },
];

const CONDITIONS: { value: ShoeCondition; key: TranslationKey }[] = [
  { value: "bueno", key: "shoeCondition.bueno" },
  { value: "pasable", key: "shoeCondition.pasable" },
  { value: "necesita_cambio", key: "shoeCondition.necesita_cambio" },
];

export function ShoeDetailScreen({ route, navigation }: Props) {
  const { shoe, photoUrl, isLoading } = useShoeDetail(route.params.shoeId);
  const updateShoe = useUpdateShoe();
  const deleteShoe = useDeleteShoe();
  const { t, tg } = useT();
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [weather, setWeather] = useState<OutfitWeather | undefined>();
  const [shoeType, setShoeType] = useState<ShoeType | undefined>();
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState<ShoeCondition | undefined>();
  const [notes, setNotes] = useState("");

  if (isLoading || !shoe) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark items-center justify-center">
        <ActivityIndicator color="#b825f2" />
      </SafeAreaView>
    );
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0]?.uri);
  }

  function startEditing() {
    if (!shoe) return;
    setDescription(shoe.description ?? "");
    setImageUri(undefined);
    setWeather(shoe.weather ?? undefined);
    setShoeType(shoe.shoe_type ?? undefined);
    setColor(shoe.color ?? "");
    setBrand(shoe.brand ?? "");
    setCondition(shoe.condition ?? undefined);
    setNotes(shoe.notes ?? "");
    setEditing(true);
  }

  function handleSaveEdit() {
    if (!shoe) return;
    updateShoe.mutate(
      {
        id: shoe.id,
        shoeDate: shoe.shoe_date,
        description,
        localImageUri: imageUri,
        weather,
        shoeType,
        color: color.trim() || undefined,
        brand: brand.trim() || undefined,
        condition,
        notes: notes.trim() || undefined,
      },
      { onSuccess: () => setEditing(false) }
    );
  }

  function handleDelete() {
    if (!shoe) return;
    Alert.alert(t("zapatos.deleteTitle"), tg("zapatos.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteShoe.mutate(shoe.id, { onSuccess: () => navigation.goBack() }),
      },
    ]);
  }

  if (editing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
            {t("zapatos.editShoe")}
          </Text>
          <TextField label={t("vestuario.description")} value={description} onChangeText={setDescription} />

          <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
            {t("vestuario.weather")}
          </Text>
          <View className="flex-row flex-wrap mb-3">
            {WEATHERS.map((w) => (
              <Chip key={w.value} label={t(w.key)} selected={weather === w.value} onPress={() => setWeather(w.value)} />
            ))}
          </View>

          <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
            {t("zapatos.shoeType")}
          </Text>
          <View className="flex-row flex-wrap mb-3">
            {SHOE_TYPES.map((s) => (
              <Chip key={s.value} label={t(s.key)} selected={shoeType === s.value} onPress={() => setShoeType(s.value)} />
            ))}
          </View>

          <TextField label={t("zapatos.color")} value={color} onChangeText={setColor} />
          <TextField label={t("zapatos.brand")} value={brand} onChangeText={setBrand} />

          <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
            {t("zapatos.condition")}
          </Text>
          <View className="flex-row flex-wrap mb-3">
            {CONDITIONS.map((c) => (
              <Chip key={c.value} label={t(c.key)} selected={condition === c.value} onPress={() => setCondition(c.value)} />
            ))}
          </View>

          <TextField label={t("vestuario.additionalNotes")} value={notes} onChangeText={setNotes} multiline />

          <Button
            label={imageUri ? t("vestuario.photoSelected") : t("vestuario.addPhoto")}
            variant="ghost"
            onPress={pickImage}
          />
          <View className="h-2" />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button label={t("vestuario.saveChanges")} onPress={handleSaveEdit} loading={updateShoe.isPending} />
            </View>
            <View className="flex-1">
              <Button label={t("common.cancel")} variant="ghost" onPress={() => setEditing(false)} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-1">
          {format(new Date(`${shoe.shoe_date}T00:00:00`), "dd MMMM yyyy")}
        </Text>

        {shoe.photo_path ? (
          photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-full rounded-card mt-4"
              style={{ aspectRatio: 3 / 4 }}
              resizeMode="cover"
            />
          ) : (
            <ActivityIndicator className="mt-6" color="#b825f2" />
          )
        ) : null}

        <Text className="text-base text-surface-dark dark:text-white mt-4">
          {shoe.description || t("common.noDescription")}
        </Text>

        <Text className="text-sm text-gray-500 mt-3">
          {t("vestuario.weatherLabel", { value: shoe.weather ? t(WEATHER_KEYS[shoe.weather]) : t("common.dash") })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("zapatos.shoeType")}: {shoe.shoe_type ? t(SHOE_TYPE_KEYS[shoe.shoe_type]) : t("common.dash")}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("zapatos.colorLabel", { value: shoe.color || t("common.dash") })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("zapatos.brandLabel", { value: shoe.brand || t("common.dash") })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("zapatos.conditionLabel", { value: shoe.condition ? t(CONDITION_KEYS[shoe.condition]) : t("common.dash") })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("vestuario.notesLabel", { value: shoe.notes || t("common.dash") })}
        </Text>

        <View className="flex-row gap-4 mt-6 justify-center">
          <Pressable onPress={startEditing}>
            <Text className="text-sm text-brand-500 font-semibold">{t("common.edit")}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} disabled={deleteShoe.isPending}>
            <Text className="text-sm text-accent-coral font-semibold">
              {deleteShoe.isPending ? t("common.deleting") : t("common.delete")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
