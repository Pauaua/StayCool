import React, { useState } from "react";
import { Pressable, SafeAreaView, Text, View, Alert } from "react-native";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export function SignInScreen({ navigation }: Props) {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      await signInWithPassword(email.trim(), password);
    } catch (error) {
      Alert.alert("No se pudo iniciar sesión", (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1 px-6 justify-center">
        <Text className="font-script text-navy mb-8" style={{ fontSize: 40 }}>
          Ingresa tus datos
        </Text>
        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextField label="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
        <Pressable onPress={() => navigation.navigate("ForgotPassword")} className="mb-4 self-end">
          <Text className="text-navy text-sm">¿Olvidaste tu contraseña?</Text>
        </Pressable>
        <Button label="Iniciar sesión" onPress={handleSignIn} loading={loading} />
        <View className="h-3" />
        <Button label="Crear cuenta" variant="ghost" onPress={() => navigation.navigate("SignUp")} />
      </SafeAreaView>
    </GradientBackground>
  );
}
