import React from "react";
import { Alert, SafeAreaView, ScrollView, Switch, Text, View } from "react-native";
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
import type { HomeStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<HomeStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const uploadAvatar = useUploadAvatarPhoto();
  const { signOut } = useAuth();
  const { tier, isFull } = usePremium();
  const { data: mooneyBalance } = useMooneyBalance();

  if (isLoading || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark items-center justify-center">
        <Text className="text-gray-400">Cargando ajustes...</Text>
      </SafeAreaView>
    );
  }

  async function handlePickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });
    if (result.canceled || !result.assets[0]) return;
    try {
      await uploadAvatar.mutateAsync(result.assets[0].uri);
    } catch (error) {
      Alert.alert("No se pudo subir la foto", error instanceof Error ? error.message : "Intenta de nuevo.");
    }
  }

  const tierLabel = tier === "full" ? "Full" : tier === "basico" ? "Básico" : "Free";

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <ScrollView>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">Ajustes</Text>

        <Card className="mb-4 items-center">
          <UserAvatar avatarUrl={profile.avatar_url} size={84} />
          <View className="mt-3">
            <NicknameWithBadge
              name={profile.display_name ?? "Sin nombre"}
              textClassName="text-lg font-bold text-surface-dark dark:text-white text-center"
            />
          </View>
          <Text className="text-xs text-gray-400 mt-1">Plan {tierLabel}</Text>

          {isFull ? (
            <>
              <Text className="text-sm font-semibold text-brand-500 mt-2">
                🪙 {mooneyBalance ?? 0} MOOney
              </Text>
              <View className="mt-3 w-full">
                <Button label="Personalizar avatar" variant="secondary" onPress={() => navigation.navigate("AvatarShop")} />
              </View>
            </>
          ) : (
            <View className="mt-3 w-full">
              <Button label="Cambiar foto de perfil" variant="secondary" onPress={handlePickPhoto} />
            </View>
          )}
        </Card>

        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-surface-dark dark:text-white">Recordatorio de desmaquillarte</Text>
            <Switch
              value={profile.makeup_reminder_enabled}
              onValueChange={(value) => update.mutate({ makeup_reminder_enabled: value })}
            />
          </View>
          {profile.makeup_reminder_enabled ? (
            <TextField
              label="Hora (HH:mm)"
              defaultValue={profile.makeup_reminder_time.slice(0, 5)}
              onEndEditing={(e) =>
                update.mutate({ makeup_reminder_time: `${e.nativeEvent.text}:00` })
              }
            />
          ) : null}
        </Card>

        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-surface-dark dark:text-white">Recordatorio de checklist de higiene</Text>
            <Switch
              value={profile.hygiene_reminder_enabled}
              onValueChange={(value) => update.mutate({ hygiene_reminder_enabled: value })}
            />
          </View>
          {profile.hygiene_reminder_enabled ? (
            <TextField
              label="Hora (HH:mm)"
              defaultValue={profile.hygiene_reminder_time.slice(0, 5)}
              onEndEditing={(e) =>
                update.mutate({ hygiene_reminder_time: `${e.nativeEvent.text}:00` })
              }
            />
          ) : null}
        </Card>

        <Button label="Cerrar sesión" variant="ghost" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}
