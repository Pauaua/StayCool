import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { Heading } from "@/components/ui/Heading";
import { format } from "date-fns";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useProfile, useUpdateProfile } from "@/features/home/hooks/useProfile";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePremium } from "@/features/premium/hooks/usePremium";
// Sparkless/MOOney para modificar el avatar: deshabilitado a propósito.
// import { useMooneyBalance } from "@/features/premium/hooks/useMooney";
import { UserAvatar } from "@/features/premium/components/UserAvatar";
import { NicknameWithBadge } from "@/features/premium/components/PremiumBadge";
import { useT } from "@/lib/i18n";
import type { HomeStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<HomeStackParamList, "Settings">;

const PRONOUN_KEY = {
  masculino: "config.pronoun.masculino",
  femenino: "config.pronoun.femenino",
  no_binarie: "config.pronoun.noBinarie",
  no_se: "config.pronoun.noSe",
} as const;

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="py-2 border-b border-gray-100 dark:border-gray-700">
      <Text className="text-xs text-gray-400">{label}</Text>
      <Text className="text-base text-surface-dark dark:text-white">{value}</Text>
    </View>
  );
}

// Ruedita del Home de la agenda: datos personales del usuario. La foto de
// perfil se muestra acá pero se cambia en Configuración (panel inicial).
export function SettingsScreen({ navigation }: Props) {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const { session, signOut } = useAuth();
  const { tier, isFull } = usePremium();
  // const { data: mooneyBalance } = useMooneyBalance();
  const { t } = useT();

  if (isLoading || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-gray-400">{t("settings.loading")}</Text>
      </SafeAreaView>
    );
  }

  const tierLabel = tier === "full" ? "Diva" : tier === "basico" ? "So Basic!" : "Gratis";
  const createdAt = session?.user.created_at ? new Date(session.user.created_at) : null;

  return (
    <SafeAreaView className="flex-1 px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Heading className="text-2xl mb-4">
          {t("settings.title")}
        </Heading>

        <Card className="mb-4 items-center">
          <UserAvatar avatarUrl={profile.avatar_url} size={84} />
          <View className="mt-3">
            <NicknameWithBadge
              name={profile.display_name ?? t("settings.noName")}
              textClassName="text-lg font-bold text-surface-dark dark:text-white text-center"
            />
          </View>
          <Text className="text-xs text-gray-400 mt-1">{t("settings.plan", { tier: tierLabel })}</Text>
          <Text className="text-xs text-gray-400 mt-2 text-center">{t("settings.photoHint")}</Text>

          {/* Sparkless/MOOney para modificar el avatar: deshabilitado a propósito.
          {isFull ? (
            <>
              <Text className="text-sm font-semibold text-ink mt-2">
                🪙 {mooneyBalance ?? 0} Sparkless
              </Text>
              <View className="mt-3 w-full">
                <Button
                  label={t("settings.customizeAvatar")}
                  variant="filled"
                  onPress={() => navigation.navigate("AvatarShop")}
                />
              </View>
            </>
          ) : null}
          */}
        </Card>

        <Card className="mb-4">
          <TextField
            label={t("settings.nameLabel")}
            defaultValue={profile.display_name ?? ""}
            onEndEditing={(e) => update.mutate({ display_name: e.nativeEvent.text.trim() })}
          />
          <DataRow label={t("settings.email")} value={session?.user.email ?? "—"} />
          <DataRow label={t("settings.pronoun")} value={t(PRONOUN_KEY[profile.pronoun])} />
          <DataRow
            label={t("settings.language")}
            value={t(profile.language === "en" ? "config.language.en" : "config.language.es")}
          />
          {createdAt ? (
            <DataRow label={t("settings.memberSince")} value={format(createdAt, "dd/MM/yyyy")} />
          ) : null}
        </Card>

        {!isFull ? (
          <View className="mb-3">
            <Button label={t("settings.viewPlans")} onPress={() => navigation.navigate("Paywall")} />
          </View>
        ) : null}

        <Button label={t("settings.signOut")} variant="outline" onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}
