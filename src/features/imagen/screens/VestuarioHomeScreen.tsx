import React, { useState } from "react";
import { FlatList, Image, Pressable, SafeAreaView, Switch, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useSaveOutfit, useWeekOutfits } from "@/features/imagen/hooks/useImagen";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { OutfitClothingType, OutfitWeather } from "@/features/imagen/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ImagenStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ImagenStackParamList, "VestuarioHome">;

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

export function VestuarioHomeScreen({ navigation }: Props) {
  const outfits = useWeekOutfits();
  const save = useSaveOutfit();
  const { t } = useT();
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [weather, setWeather] = useState<OutfitWeather | undefined>();
  const [clothingType, setClothingType] = useState<OutfitClothingType | undefined>();
  const [mainColors, setMainColors] = useState("");
  const [usedAccessories, setUsedAccessories] = useState(false);
  const [accessoriesDescription, setAccessoriesDescription] = useState("");
  const [notes, setNotes] = useState("");

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0]?.uri);
  }

  async function handleSave() {
    const today = format(new Date(), "yyyy-MM-dd");
    await save.mutateAsync({
      date: today,
      description,
      localImageUri: imageUri,
      weather,
      clothingType,
      mainColors: mainColors.trim() || undefined,
      usedAccessories,
      accessoriesDescription: accessoriesDescription.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setDescription("");
    setImageUri(undefined);
    setWeather(undefined);
    setClothingType(undefined);
    setMainColors("");
    setUsedAccessories(false);
    setAccessoriesDescription("");
    setNotes("");
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        data={outfits.data ?? []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View className="flex-row items-center mb-4">
              <Image
                source={require("../../../../assets/images/vestidosss.png")}
                style={{ width: 56, height: 56, marginRight: 8 }}
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-surface-dark dark:text-white">
                {t("vestuario.title")}
              </Text>
            </View>

            <Card className="mb-4">
              <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
                {t("vestuario.whatToday")}
              </Text>
              <TextField label={t("vestuario.description")} value={description} onChangeText={setDescription} />

              <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
                {t("vestuario.weather")}
              </Text>
              <View className="flex-row flex-wrap mb-3">
                {WEATHERS.map((w) => (
                  <Chip
                    key={w.value}
                    label={t(w.key)}
                    selected={weather === w.value}
                    onPress={() => setWeather(w.value)}
                  />
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

              <TextField
                label={t("vestuario.mainColors")}
                value={mainColors}
                onChangeText={setMainColors}
                placeholder={t("vestuario.mainColorsPlaceholder")}
              />

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
              <Button label={t("vestuario.save")} onPress={handleSave} loading={save.isPending} />
            </Card>

            <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
              {t("vestuario.history", { tap: t("common.tapForDetail") })}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("OutfitDetail", { outfitId: item.id })}>
            <Card className="mb-2">
              <Text className="text-surface-dark dark:text-white" numberOfLines={1}>
                {item.description || t("common.noDescription")}
              </Text>
              <Text className="text-xs text-gray-400">
                {item.outfit_date} {item.photo_path ? "· 📷" : ""}
              </Text>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
