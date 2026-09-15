import React, { useState } from "react";
import { Image, SafeAreaView, Text, View, Alert } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const { signUpWithPassword } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  async function handleSignUp() {
    if (!passwordsMatch) {
      Alert.alert("Las contraseñas no coinciden", "Revisa que ambas contraseñas sean iguales.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithPassword(email.trim(), password, displayName.trim());
    } catch (error) {
      Alert.alert("No se pudo crear la cuenta", (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 px-6 justify-center pt-8">
        <View className="items-center mb-2">
          <Image
            source={require("../../../../assets/images/Logo.jpg")}
            style={{ width: 64, height: 64 }}
            resizeMode="contain"
          />
        </View>
        <Text className="font-script text-navy mb-8" style={{ fontSize: 40 }}>
          Crea tu cuenta
        </Text>
        <TextField label="Nombre Social" value={displayName} onChangeText={setDisplayName} />
        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextField label="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
        <TextField
          label="Repetir contraseña"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <Button
          label="Registrarme"
          onPress={handleSignUp}
          loading={loading}
          disabled={!passwordsMatch}
          icon={require("../../../../assets/images/brillitos.png")}
        />
        <View className="h-3" />
        <Button
          label="Ya tengo cuenta"
          variant="ghost"
          onPress={() => navigation.navigate("SignIn")}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}
