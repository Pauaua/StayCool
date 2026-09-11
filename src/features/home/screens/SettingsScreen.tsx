import React from "react";
import { Alert, SafeAreaView, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useProfile, useUpdateProfile, useUploadAvatarPhoto } from "@/features/home/hooks/useProfile";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useMooneyBalance } from "@/features/premium/hooks/useMooney";
import { UserAvatar } from "@/features/premium/components/UserAvatar";
import { NicknameWithBadge } from "@/features/premium/components/PremiumBadge";
import { useT } from "@/lib/i18n";
import type { HomeStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<HomeStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const uploadAvatar = useUploadAvatarPhoto();
  const { signOut } = useAuth();
  const { tier, isFull } = usePremium();
  const { data: mooneyBalance } = useMooneyBalance();
  const { t } = useT();

  if (isLoading || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark items-center justify-center">
        <Text className="text-gray-400">{t("settings.loading")}</Text>
      </SafeAreaView>
    );
  }

  async function handlePickPhoto() {
    if (!isFull) {
      Alert.alert(t("settings.upgradeDivaTitle"), t("settings.upgradeDivaMessage"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });
    if (result.canceled || !result.assets[0]) return;
    try {
      await uploadAvatar.mutateAsync(result.assets[0].uri);
    } catch (error) {
      Alert.alert(
        t("settings.uploadFailedTitle"),
        error instanceof Error ? error.message : t("settings.tryAgain")
      );
    }
  }

  const tierLabel = tier === "full" ? "Full" : tier === "basico" ? "Básico" : "Free";

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          {t("settings.title")}
        </Text>

        <Card className="mb-4 items-center">
          <UserAvatar avatarUrl={profile.avatar_url} size={84} />
          <View className="mt-3">
            <NicknameWithBadge
              name={profile.display_name ?? t("settings.noName")}
              textClassName="text-lg font-bold text-surface-dark dark:text-white text-center"
            />
          </View>
          <Text className="text-xs text-gray-400 mt-1">{t("settings.plan", { tier: tierLabel })}</Text>

          <View className="mt-3 w-full">
            <TextField
              label={t("settings.nameLabel")}
              defaultValue={profile.display_name ?? ""}
              onEndEditing={(e) => update.mutate({ display_name: e.nativeEvent.text.trim() })}
            />
          </View>

          {isFull ? (
            <>
              <Text className="text-sm font-semibold text-brand-500 mt-2">
                🪙 {mooneyBalance ?? 0} Sparkless
              </Text>
              <View className="mt-3 w-full">
                <Button
                  label={t("settings.customizeAvatar")}
                  variant="secondary"
                  onPress={() => navigation.navigate("AvatarShop")}
                />
              </View>
            </>
          ) : null}

          <View className="mt-3 w-full">
            <Button label={t("settings.changePhoto")} variant="ghost" onPress={handlePickPhoto} />
          </View>

          {!isFull ? (
            <View className="mt-3 w-full">
              <Button label={t("settings.viewPlans")} onPress={() => navigation.navigate("Paywall")} />
            </View>
          ) : null}
        </Card>

        <Button label={t("settings.signOut")} variant="ghost" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}
