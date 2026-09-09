import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useSaveShoe, useWeekShoes } from "@/features/imagen/hooks/useImagen";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { OutfitWeather, ShoeCondition, ShoeType } from "@/features/imagen/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ImagenStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ImagenStackParamList, "ZapatosHome">;

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

export function ZapatosHomeScreen({ navigation }: Props) {
  const shoes = useWeekShoes();
  const save = useSaveShoe();
  const { t } = useT();
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [weather, setWeather] = useState<OutfitWeather | undefined>();
  const [shoeType, setShoeType] = useState<ShoeType | undefined>();
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState<ShoeCondition | undefined>();
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
      shoeType,
      color: color.trim() || undefined,
      brand: brand.trim() || undefined,
      condition,
      notes: notes.trim() || undefined,
    });
    setDescription("");
    setImageUri(undefined);
    setWeather(undefined);
    setShoeType(undefined);
    setColor("");
    setBrand("");
    setCondition(undefined);
    setNotes("");
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        data={shoes.data ?? []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
              {t("zapatos.title")}
            </Text>

            <Card className="mb-4">
              <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
                {t("zapatos.whatToday")}
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
                {t("zapatos.shoeType")}
              </Text>
              <View className="flex-row flex-wrap mb-3">
                {SHOE_TYPES.map((s) => (
                  <Chip
                    key={s.value}
                    label={t(s.key)}
                    selected={shoeType === s.value}
                    onPress={() => setShoeType(s.value)}
                  />
                ))}
              </View>

              <TextField
                label={t("zapatos.color")}
                value={color}
                onChangeText={setColor}
                placeholder={t("zapatos.colorPlaceholder")}
              />
              <TextField label={t("zapatos.brand")} value={brand} onChangeText={setBrand} />

              <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
                {t("zapatos.condition")}
              </Text>
              <View className="flex-row flex-wrap mb-3">
                {CONDITIONS.map((c) => (
                  <Chip
                    key={c.value}
                    label={t(c.key)}
                    selected={condition === c.value}
                    onPress={() => setCondition(c.value)}
                  />
                ))}
              </View>

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
              {t("zapatos.history", { tap: t("common.tapForDetail") })}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("ShoeDetail", { shoeId: item.id })}>
            <Card className="mb-2">
              <Text className="text-surface-dark dark:text-white" numberOfLines={1}>
                {item.description || t("common.noDescription")}
              </Text>
              <Text className="text-xs text-gray-400">
                {item.shoe_date} {item.photo_path ? "· 📷" : ""}
              </Text>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
