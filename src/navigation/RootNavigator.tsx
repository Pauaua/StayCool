import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Animated, ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuthNavigator } from "@/navigation/AuthNavigator";
import { MainShell } from "@/navigation/MainShell";
import { ResetPasswordScreen } from "@/features/auth/screens/ResetPasswordScreen";
import { WelcomeScreen } from "@/features/home/screens/WelcomeScreen";

type PostLoginStage = "welcome" | "app";

export function RootNavigator() {
  const { session, isLoading, isPasswordRecovery } = useAuth();
  const [stage, setStage] = useState<PostLoginStage>("welcome");
  const fade = useRef(new Animated.Value(0)).current;
  const wasLoggedIn = useRef(false);

  useEffect(() => {
    if (session && !wasLoggedIn.current) {
      // Recién se logueó: arranca en el saludo, con el login desapareciendo
      // hacia este slide.
      setStage("welcome");
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
    if (!session) {
      // Al cerrar sesión, la próxima vez que entre vuelve a empezar por el saludo.
      setStage("welcome");
    }
    wasLoggedIn.current = !!session;
  }, [session, fade]);

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

  if (session) {
    if (stage === "app") {
      // MainShell monta varios navigators a la vez (uno por módulo, ocultos
      // con display:none en vez de desmontados) — cada uno trae su propio
      // <NavigationContainer independent>, así que acá no envolvemos con uno
      // compartido (React Navigation no permite más de un navigator raíz por
      // contenedor).
      return <MainShell />;
    }

    return (
      <Animated.View style={{ flex: 1, opacity: fade }}>
        <WelcomeScreen onOpenAgenda={() => setStage("app")} />
      </Animated.View>
    );
  }

  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
