import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuthNavigator } from "@/navigation/AuthNavigator";
import { MainShell } from "@/navigation/MainShell";
import { ResetPasswordScreen } from "@/features/auth/screens/ResetPasswordScreen";

export function RootNavigator() {
  const { session, isLoading, isPasswordRecovery } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator color="#b825f2" size="large" />
      </View>
    );
  }

  // El link de "olvidé mi contraseña" crea una sesión temporal (para poder
  // llamar updateUser), pero no debe mandar a la app normal todavía — hay
  // que elegir la contraseña nueva primero.
  if (isPasswordRecovery) {
    return <ResetPasswordScreen />;
  }

  // Logueado: MainShell monta varios navigators a la vez (uno por módulo,
  // ocultos con display:none en vez de desmontados) — cada uno trae su
  // propio <NavigationContainer independent>, así que acá no envolvemos con
  // uno compartido (React Navigation no permite más de un navigator raíz
  // por contenedor).
  if (session) {
    return <MainShell />;
  }

  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
