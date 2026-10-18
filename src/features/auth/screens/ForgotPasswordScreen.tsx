import React, { useState } from "react";
import { Alert, Image, SafeAreaView, Text, View } from "react-native";
import { useT } from "@/lib/i18n";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { sectionColors } from "@/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";
import { Heading } from "@/components/ui/Heading";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { requestPasswordReset } = useAuth();
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      Alert.alert(
        t("auth.checkEmailTitle"),
        t("auth.checkEmailBody"),
        [{ text: t("common.ok"), onPress: () => navigation.navigate("SignIn") }]
      );
    } catch (error) {
      Alert.alert(t("auth.sendFailed"), (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenBackground color={sectionColors.Auth}>
      <SafeAreaView className="flex-1 px-6 justify-center">
        <View className="items-center mb-4">
          <Image
            source={require("../../../../assets/images/Logo.png")}
            style={{ width: 64, height: 64 }}
            resizeMode="contain"
          />
        </View>
        <View className="flex-row items-center mb-3">
          <Image
            source={require("../../../../assets/images/candado.png")}
            style={{ width: 32, height: 32, marginRight: 8 }}
            resizeMode="contain"
          />
          <Heading style={{ fontSize: 28 }}>
            {t("auth.forgotTitle")}
          </Heading>
        </View>
        <Text className="text-ink/70 mb-6">
          {t("auth.forgotBody")}
        </Text>
        <TextField
          label={t("auth.email")}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Button label={t("auth.sendLink")} onPress={handleSend} loading={loading} />
      </SafeAreaView>
    </ScreenBackground>
  );
}
