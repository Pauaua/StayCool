import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, ScrollView, Switch, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useDeleteHairstyle, useHairstyleDetail, useUpdateHairstyle } from "@/features/pelo/hooks/usePelo";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { HairstyleType } from "@/features/pelo/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PeloStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<PeloStackParamList, "HairstyleDetail">;

const STYLE_TYPE_KEYS: Record<string, TranslationKey> = {
  coleta: "pelo.style.coleta",
  suelto: "pelo.style.suelto",
  trenzas: "pelo.style.trenzas",
  otro: "pelo.style.otro",
};

const STYLE_TYPES: { value: HairstyleType; key: TranslationKey }[] = [
  { value: "coleta", key: "pelo.style.coleta" },
  { value: "suelto", key: "pelo.style.suelto" },
  { value: "trenzas", key: "pelo.style.trenzas" },
  { value: "otro", key: "pelo.style.otro" },
];

export function HairstyleDetailScreen({ route, navigation }: Props) {
  const { hairstyle, photoUrl, isLoading } = useHairstyleDetail(route.params.hairstyleId);
  const updateHairstyle = useUpdateHairstyle();
  const deleteHairstyle = useDeleteHairstyle();
  const { t, tg } = useT();
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [styleType, setStyleType] = useState<HairstyleType | undefined>();
  const [isSpecialOccasion, setIsSpecialOccasion] = useState(false);
  const [occasionDetails, setOccasionDetails] = useState("");

  if (isLoading || !hairstyle) {
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
    if (!hairstyle) return;
    setDescription(hairstyle.hairstyle);
    setImageUri(undefined);
    setStyleType(hairstyle.style_type ?? undefined);
    setIsSpecialOccasion(hairstyle.is_special_occasion ?? false);
    setOccasionDetails(hairstyle.occasion_details ?? "");
    setEditing(true);
  }

  function handleSaveEdit() {
    if (!hairstyle || !description.trim()) return;
    updateHairstyle.mutate(
      {
        id: hairstyle.id,
        hairstyle: description.trim(),
        localImageUri: imageUri,
        styleType,
        isSpecialOccasion,
        occasionDetails: occasionDetails.trim() || undefined,
      },
      { onSuccess: () => setEditing(false) }
    );
  }

  function handleDelete() {
    if (!hairstyle) return;
    Alert.alert(t("pelo.deleteTitle"), tg("pelo.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteHairstyle.mutate(hairstyle.id, { onSuccess: () => navigation.goBack() }),
      },
    ]);
  }

  if (editing) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-surface-dark px-5 pt-4">
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
            {t("pelo.editHairstyle")}
          </Text>
          <TextField label={t("pelo.description")} value={description} onChangeText={setDescription} />

          <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">{t("pelo.type")}</Text>
          <View className="flex-row flex-wrap mb-3">
            {STYLE_TYPES.map((s) => (
              <Chip key={s.value} label={t(s.key)} selected={styleType === s.value} onPress={() => setStyleType(s.value)} />
            ))}
          </View>

          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-surface-dark dark:text-white">{t("pelo.specialOccasion")}</Text>
            <Switch value={isSpecialOccasion} onValueChange={setIsSpecialOccasion} />
          </View>
          {isSpecialOccasion ? (
            <TextField label={t("pelo.occasionDetails")} value={occasionDetails} onChangeText={setOccasionDetails} />
          ) : null}

          <Button
            label={imageUri ? t("pelo.photoSelected") : t("pelo.addPhoto")}
            variant="ghost"
            onPress={pickImage}
          />
          <View className="h-2" />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button label={t("common.saveChanges")} onPress={handleSaveEdit} loading={updateHairstyle.isPending} />
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
          {format(new Date(`${hairstyle.style_date}T00:00:00`), "dd MMMM yyyy")}
        </Text>

        {hairstyle.photo_path ? (
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

        <Text className="text-base text-surface-dark dark:text-white mt-4">{hairstyle.hairstyle}</Text>

        <Text className="text-sm text-gray-500 mt-3">
          {t("pelo.typeLabel", {
            value: hairstyle.style_type ? t(STYLE_TYPE_KEYS[hairstyle.style_type]) : t("common.dash"),
          })}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {t("pelo.specialOccasionLabel", {
            value: hairstyle.is_special_occasion
              ? hairstyle.occasion_details || t("common.yesNoDetail")
              : t("common.no"),
          })}
        </Text>

        <View className="flex-row gap-4 mt-6 justify-center">
          <Pressable onPress={startEditing}>
            <Text className="text-sm text-brand-500 font-semibold">{t("common.edit")}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} disabled={deleteHairstyle.isPending}>
            <Text className="text-sm text-accent-coral font-semibold">
              {deleteHairstyle.isPending ? t("common.deleting") : t("common.delete")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
