import React, { useState } from "react";
import { Image, SafeAreaView, Text, View, Alert } from "react-native";
import { useT } from "@/lib/i18n";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { sectionColors } from "@/theme";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";
import { Heading } from "@/components/ui/Heading";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const { signUpWithPassword } = useAuth();
  const { t } = useT();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  async function handleSignUp() {
    if (!passwordsMatch) {
      Alert.alert(t("auth.passwordsMismatch"), t("auth.passwordsMismatchBody"));
      return;
    }
    setLoading(true);
    try {
      await signUpWithPassword(email.trim(), password, displayName.trim());
    } catch (error) {
      Alert.alert(t("auth.signUpFailed"), (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenBackground color={sectionColors.Auth}>
      <SafeAreaView className="flex-1 px-6 justify-center pt-8">
        <View className="items-center mb-2">
          <Image
            source={require("../../../../assets/images/Logo.png")}
            style={{ width: 64, height: 64 }}
            resizeMode="contain"
          />
        </View>
        <Heading className="mb-8" style={{ fontSize: 30 }}>
          {t("auth.signUpTitle")}
        </Heading>
        <TextField label={t("auth.socialName")} value={displayName} onChangeText={setDisplayName} />
        <TextField
          label={t("auth.email")}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextField label={t("auth.password")} secureTextEntry value={password} onChangeText={setPassword} />
        <TextField
          label={t("auth.repeatPassword")}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <Button
          label={t("auth.signUp")}
          onPress={handleSignUp}
          loading={loading}
          disabled={!passwordsMatch}
          icon={require("../../../../assets/images/brillitos.png")}
        />
        <View className="h-3" />
        <Button
          label={t("auth.haveAccount")}
          variant="outline"
          onPress={() => navigation.navigate("SignIn")}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}
