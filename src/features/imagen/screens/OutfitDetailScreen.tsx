import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, ScrollView, Switch, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useDeleteOutfit, useOutfitDetail, useUpdateOutfit } from "@/features/imagen/hooks/useImagen";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { OutfitClothingType, OutfitWeather } from "@/features/imagen/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ImagenStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ImagenStackParamList, "OutfitDetail">;

const WEATHER_KEYS: Record<string, TranslationKey> = {
  frio: "weather.frio",
  calor: "weather.calor",
  intermedio: "weather.intermedio",
};

const CLOTHING_KEYS: Record<string, TranslationKey> = {
  vestido: "clothing.vestido",
  pantalon: "clothing.pantalon",
  falda: "clothing.falda",
  otro: "clothing.otro",
};

const WEATHERS: { value: OutfitWeather; key: TranslationKey }[] = [
  { value: "frio", key: "weather.frio" },
  { value: "calor", key: "weather.calor" },
  { value: "intermedio", key: "weather.intermedio" },
];

const CLOTHING_TYPES: { value: OutfitClothingType; key: TranslationKey }[] = [
  { value: "vestido", key: "clothing.vestido" },
  { value: "pantalon", key: "clothing.pantalon" },
  { value: "falda", key: "clothing.falda" },
  { value: "otro", key: "clothing.otro" },
];

export function OutfitDetailScreen({ route, navigation }: Props) {
  const { outfit, photoUrl, isLoading } = useOutfitDetail(route.params.outfitId);
  const updateOutfit = useUpdateOutfit();
  const deleteOutfit = useDeleteOutfit();
  const { t, tg } = useT();
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [weather, setWeather] = useState<OutfitWeather | undefined>();
  const [clothingType, setClothingType] = useState<OutfitClothingType | undefined>();
  const [mainColors, setMainColors] = useState("");
  const [usedAccessories, setUsedAccessories] = useState(false);
  const [accessoriesDescription, setAccessoriesDescription] = useState("");
  const [notes, setNotes] = useState("");

  if (isLoading || !outfit) {
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
    if (!outfit) return;
    setDescription(outfit.description ?? "");
    setImageUri(undefined);
    setWeather(outfit.weather ?? undefined);
    setClothingType(outfit.clothing_type ?? undefined);
    setMainColors(outfit.main_colors ?? "");
    setUsedAccessories(outfit.used_accessories ?? false);
    setAccessoriesDescription(outfit.accessories_description ?? "");
    setNotes(outfit.notes ?? "");
    setEditing(true);
  }

  function handleSaveEdit() {
    if (!outfit) return;
    updateOutfit.mutate(
      {
        id: outfit.id,
        outfitDate: outfit.outfit_date,
        description,
        localImageUri: imageUri,
        weather,
        clothingType,
        mainColors: mainColors.trim() || undefined,
        usedAccessories,
        accessoriesDescription: accessoriesDescription.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      { onSuccess: () => setEditing(false) }
    );
  }

  function handleDelete() {
    if (!outfit) return;
    Alert.alert(t("vestuario.deleteTitle"), tg("vestuario.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteOutfit.mutate(outfit.id, { onSuccess: () => navigation.goBack() }),
      },
    ]);
  }

  if (editing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
            {t("vestuario.editOutfit")}
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
            {t("vestuario.clothingType")}
          </Text>
          <View className="flex-row flex-wrap mb-3">
            {CLOTHING_TYPES.map((c) => (
              <Chip
                key={c.value}
                label={t(c.key)}
                selected={clothingType === c.value}
                onPress={() => setClothingType(c.value)}
              />
            ))}
          </View>

          <TextField label={t("vestuario.mainColors")} value={mainColors} onChangeText={setMainColors} />

          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-surface-dark dark:text-white">{t("vestuario.usedAccessories")}</Text>
            <Switch value={usedAccessories} onValueChange={setUsedAccessories} />
          </View>
          {usedAccessories ? (
            <TextField
              label={t("vestuario.whichAccessories")}
              value={accessoriesDescription}
              onChangeText={setAccessoriesDescription}
            />
          ) : null}

          <TextField label={t("vestuario.additionalNotes")} value={notes} onChangeText={setNotes} multiline />

          <Button
            label={imageUri ? t("vestuario.photoSelected") : t("vestuario.addPhoto")}
            variant="ghost"
            onPress={pickImage}
          />
          <View className="h-2" />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button label={t("vestuario.saveChanges")} onPress={handleSaveEdit} loading={updateOutfit.isPending} />
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
          {format(new Date(`${outfit.outfit_date}T00:00:00`), "dd MMMM yyyy")}
        </Text>

        {outfit.photo_path ? (
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
          {outfit.description || t("common.noDescription")}
        </Text>

        <Text className="text-sm text-gray-500 mt-3">
          {t("vestuario.weatherLabel", {
            value: outfit.weather ? t(WEATHER_KEYS[outfit.weather]) : t("common.dash"),
          })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("vestuario.clothingTypeLabel", {
            value: outfit.clothing_type ? t(CLOTHING_KEYS[outfit.clothing_type]) : t("common.dash"),
          })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("vestuario.mainColorsLabel", { value: outfit.main_colors || t("common.dash") })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("vestuario.accessoriesLabel", {
            value: outfit.used_accessories
              ? outfit.accessories_description || t("common.yesNoDetail")
              : t("common.no"),
          })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("vestuario.notesLabel", { value: outfit.notes || t("common.dash") })}
        </Text>

        <View className="flex-row gap-4 mt-6 justify-center">
          <Pressable onPress={startEditing}>
            <Text className="text-sm text-brand-500 font-semibold">{t("common.edit")}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} disabled={deleteOutfit.isPending}>
            <Text className="text-sm text-accent-coral font-semibold">
              {deleteOutfit.isPending ? t("common.deleting") : t("common.delete")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
