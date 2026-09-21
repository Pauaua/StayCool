import React, { useState } from "react";
import { Alert, Image, Modal, Pressable, SafeAreaView, ScrollView, Switch, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Calendar, DateData } from "react-native-calendars";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import {
  useDeleteHairWash,
  useHairstyles,
  useHairWashHistory,
  useLogHairstyle,
  useUpdateHairWash,
} from "@/features/pelo/hooks/usePelo";
import { useT, type TranslationKey } from "@/lib/i18n";
import type { HairstyleType, HairWashLog } from "@/features/pelo/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PeloStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<PeloStackParamList, "PeloHome">;

const STYLE_TYPES: { value: HairstyleType; key: TranslationKey }[] = [
  { value: "coleta", key: "pelo.style.coleta" },
  { value: "suelto", key: "pelo.style.suelto" },
  { value: "trenzas", key: "pelo.style.trenzas" },
  { value: "otro", key: "pelo.style.otro" },
];

export function PeloHomeScreen({ navigation }: Props) {
  const washHistory = useHairWashHistory();
  const hairstyles = useHairstyles();
  const logStyle = useLogHairstyle();
  const deleteWash = useDeleteHairWash();
  const updateWash = useUpdateHairWash();
  const { t, tg } = useT();
  const [hairstyle, setHairstyle] = useState("");
  const [styleType, setStyleType] = useState<HairstyleType | undefined>();
  const [isSpecialOccasion, setIsSpecialOccasion] = useState(false);
  const [occasionDetails, setOccasionDetails] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [editingWash, setEditingWash] = useState<HairWashLog | null>(null);
  const [editWashDate, setEditWashDate] = useState("");
  const [editWashTime, setEditWashTime] = useState("");

  function openEditWash(item: HairWashLog) {
    const current = new Date(item.washed_at);
    setEditingWash(item);
    setEditWashDate(format(current, "yyyy-MM-dd"));
    setEditWashTime(format(current, "HH:mm"));
  }

  function saveEditWash() {
    if (!editingWash) return;
    const match = /^(\d{1,2}):(\d{2})$/.exec(editWashTime.trim());
    if (!match) {
      Alert.alert(t("pelo.invalidTime"));
      return;
    }
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) {
      Alert.alert(t("pelo.invalidTime"));
      return;
    }
    const washedAt = new Date(`${editWashDate}T00:00:00`);
    washedAt.setHours(hours, minutes, 0, 0);
    updateWash.mutate(
      { id: editingWash.id, washedAt },
      { onSuccess: () => setEditingWash(null) }
    );
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0]?.uri);
  }

  const hairstyleItems = hairstyles.data?.pages.flatMap((p) => p.items) ?? [];
  const washItems = washHistory.data?.pages.flatMap((p) => p.items) ?? [];
  const lastWash = washItems[0];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <View className="flex-row items-center mb-4">
        <Image
          source={require("../../../../assets/images/pelito.png")}
          style={{ width: 56, height: 56, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-surface-dark dark:text-white">{t("pelo.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Card className="mb-2">
          <Text className="text-surface-dark dark:text-white font-semibold">{t("pelo.lastWash")}</Text>
          <Text className="text-xs text-gray-400">
            {lastWash ? format(new Date(lastWash.washed_at), "dd MMM yyyy HH:mm") : t("pelo.noRecordsYet")}
          </Text>
        </Card>

        <Pressable
          onPress={() => navigation.navigate("HairProfile")}
          className="self-start rounded-full border-2 px-3 py-1.5 mb-4"
          style={{ borderColor: "#ecc6ff" }}
        >
          <Text className="text-xs font-semibold text-brand-500">{t("pelo.addCharacteristics")}</Text>
        </Pressable>

        <Card className="mb-4">
          <Text className="text-xl font-bold text-surface-dark dark:text-white mb-3">
            {t("pelo.howStyleToday")}
          </Text>

          <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
            {t("pelo.hairstyleLabel")}
          </Text>
          <TextField label={t("pelo.description")} value={hairstyle} onChangeText={setHairstyle} />

          <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">{t("pelo.type")}</Text>
          <View className="flex-row flex-wrap mb-3">
            {STYLE_TYPES.map((s) => (
              <Chip
                key={s.value}
                label={t(s.key)}
                selected={styleType === s.value}
                onPress={() => setStyleType(s.value)}
              />
            ))}
          </View>

          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-surface-dark dark:text-white">{t("pelo.specialOccasion")}</Text>
            <Switch value={isSpecialOccasion} onValueChange={setIsSpecialOccasion} />
          </View>
          {isSpecialOccasion ? (
            <TextField
              label={t("pelo.occasionDetails")}
              value={occasionDetails}
              onChangeText={setOccasionDetails}
            />
          ) : null}

          <Button
            label={imageUri ? t("pelo.photoSelected") : t("pelo.addPhoto")}
            variant="ghost"
            onPress={pickImage}
          />
          <View className="h-2" />
          <Button
            label={t("pelo.saveHairstyle")}
            variant="secondary"
            onPress={() => {
              if (!hairstyle.trim()) return;
              logStyle.mutate({
                hairstyle: hairstyle.trim(),
                localImageUri: imageUri,
                styleType,
                isSpecialOccasion,
                occasionDetails: occasionDetails.trim() || undefined,
              });
              setHairstyle("");
              setStyleType(undefined);
              setIsSpecialOccasion(false);
              setOccasionDetails("");
              setImageUri(undefined);
            }}
            loading={logStyle.isPending}
          />
        </Card>

        <View className="flex-row items-center mb-2">
          <Image
            source={require("../../../../assets/images/pelito lavado.png")}
            style={{ width: 99, height: 99, marginRight: 6 }}
            resizeMode="contain"
          />
          <View>
            <Text className="text-lg font-semibold text-surface-dark dark:text-white">
              {t("pelo.hairstyleRecord")}
            </Text>
            <Text className="text-xs font-normal text-gray-400">{t("pelo.tapForDetail")}</Text>
          </View>
        </View>
        {hairstyleItems.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => navigation.navigate("HairstyleDetail", { hairstyleId: item.id })}
          >
            <Card className="mb-2">
              <Text className="text-surface-dark dark:text-white" numberOfLines={1}>
                {item.hairstyle}
              </Text>
              <Text className="text-xs text-gray-400">
                {item.style_date} {item.photo_path ? "· 📷" : ""}
              </Text>
            </Card>
          </Pressable>
        ))}
        {hairstyles.hasNextPage ? (
          <Button label={t("pelo.loadMore")} variant="ghost" onPress={() => hairstyles.fetchNextPage()} />
        ) : null}

        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2 mt-4">
          {t("pelo.washHistory")}
        </Text>
        {washItems.map((item) => (
          <Card key={item.id} className="mb-2 flex-row items-center justify-between">
            <Text className="text-surface-dark dark:text-white flex-1 pr-2" numberOfLines={1}>
              {format(new Date(item.washed_at), "dd MMM yyyy HH:mm")}
            </Text>
            <View className="flex-row gap-4 flex-shrink-0">
              <Pressable onPress={() => openEditWash(item)}>
                <Text className="text-xs text-brand-500 font-semibold">{t("common.edit")}</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert(t("pelo.deleteWashTitle"), tg("pelo.deleteWashMessage"), [
                    { text: t("common.cancel"), style: "cancel" },
                    { text: t("common.delete"), style: "destructive", onPress: () => deleteWash.mutate(item.id) },
                  ])
                }
              >
                <Text className="text-xs text-accent-coral font-semibold">{t("common.delete")}</Text>
              </Pressable>
            </View>
          </Card>
        ))}
        {washHistory.hasNextPage ? (
          <Button label={t("pelo.loadMore")} variant="ghost" onPress={() => washHistory.fetchNextPage()} />
        ) : null}
      </ScrollView>

      <Modal
        visible={editingWash !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingWash(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <Card className="w-full">
            <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">
              {t("pelo.editWashTitle")}
            </Text>
            <Calendar
              current={editWashDate}
              markedDates={{ [editWashDate]: { selected: true, selectedColor: "#002054" } }}
              onDayPress={(day: DateData) => setEditWashDate(day.dateString)}
              theme={{ selectedDayBackgroundColor: "#002054", todayTextColor: "#002054" }}
            />
            <View className="mt-2">
              <TextField label={t("pelo.washTime")} value={editWashTime} onChangeText={setEditWashTime} />
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button label={t("bienestar.saveChanges")} onPress={saveEditWash} loading={updateWash.isPending} />
              </View>
              <View className="flex-1">
                <Button label={t("common.cancel")} variant="ghost" onPress={() => setEditingWash(null)} />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
