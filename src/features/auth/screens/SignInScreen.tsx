import React, { useState } from "react";
import { Image, Pressable, SafeAreaView, Text, View, Alert } from "react-native";
import { useT } from "@/lib/i18n";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { sectionColors } from "@/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";
import { Heading } from "@/components/ui/Heading";

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export function SignInScreen({ navigation }: Props) {
  const { signInWithPassword } = useAuth();
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      await signInWithPassword(email.trim(), password);
    } catch (error) {
      Alert.alert(t("auth.signInFailed"), (error as Error).message);
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
        <View className="flex-row items-center mb-8">
          <Image
            source={require("../../../../assets/images/brillitos.png")}
            style={{ width: 32, height: 32, marginRight: 8 }}
            resizeMode="contain"
          />
          <Heading style={{ fontSize: 30 }}>
            {t("auth.signInTitle")}
          </Heading>
        </View>
        <TextField
          label={t("auth.email")}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextField label={t("auth.password")} secureTextEntry value={password} onChangeText={setPassword} />
        <Pressable onPress={() => navigation.navigate("ForgotPassword")} className="mb-4 self-end">
          <Text className="text-ink text-sm">{t("auth.forgotPassword")}</Text>
        </Pressable>
        <Button label={t("auth.signIn")} onPress={handleSignIn} loading={loading} />
        <View className="h-3" />
        <Button
          label={t("auth.createAccount")}
          variant="outline"
          onPress={() => navigation.navigate("SignUp")}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}
