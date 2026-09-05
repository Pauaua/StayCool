import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as Linking from "expo-linking";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { parseAuthDeepLinkParams } from "@/lib/parseAuthDeepLink";
import { analytics } from "@/analytics/posthog";
import { identifyRevenueCatUser, resetRevenueCatUser } from "@/lib/revenuecat";

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  // true mientras el usuario está en medio del flujo de "olvidé mi
  // contraseña" (llegó desde el link del mail) — la sesión que Supabase crea
  // en ese momento es solo para poder llamar updateUser con la nueva
  // contraseña, no debe mandar a la app normal todavía.
  isPasswordRecovery: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string, displayName?: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  completePasswordReset: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const REDIRECT_TO = Linking.createURL("reset-password");

async function applyDeepLinkSession(url: string | null) {
  if (!url) return;
  const params = parseAuthDeepLinkParams(url);
  if (params.type === "recovery" && params.access_token && params.refresh_token) {
    await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }
      if (nextSession?.user) {
        analytics.identify(nextSession.user.id, { email: nextSession.user.email });
        identifyRevenueCatUser(nextSession.user.id);
      } else {
        analytics.reset();
        resetRevenueCatUser();
      }
    });

    // El link de recuperación puede llegar con la app cerrada (getInitialURL)
    // o con la app ya abierta en segundo plano (addEventListener).
    Linking.getInitialURL().then(applyDeepLinkSession);
    const linkingSubscription = Linking.addEventListener("url", ({ url }) => applyDeepLinkSession(url));

    return () => {
      subscription.subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isPasswordRecovery,
      async signInWithPassword(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        analytics.track("auth_sign_in", { method: "password" });
      },
      async signUpWithPassword(email, password, displayName) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
        analytics.track("auth_sign_up", { method: "password" });
      },
      async requestPasswordReset(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: REDIRECT_TO,
        });
        if (error) throw error;
        analytics.track("auth_password_reset_requested");
      },
      async completePasswordReset(newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        analytics.track("auth_password_reset_completed");
        setIsPasswordRecovery(false);
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        analytics.track("auth_sign_out");
      },
    }),
    [session, isLoading, isPasswordRecovery]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
