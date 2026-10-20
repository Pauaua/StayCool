import React from "react";
import { Platform, View } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { env } from "@/config/env";

// Banner de AdMob para usuarios del plan gratuito. Los planes "básico" y
// "full" no ven anuncios (es parte de lo que pagan). Por ahora solo hay
// unidad de anuncios creada para Android; en iOS no se renderiza nada hasta
// que exista una app/unidad equivalente en AdMob.
export function AppBannerAd() {
  const { tier, isLoading } = usePremium();

  if (isLoading || tier !== "free") return null;
  if (Platform.OS !== "android") return null;

  // En desarrollo usamos el ID de prueba oficial de Google para no gastar
  // ni distorsionar métricas de la unidad real mientras se itera localmente.
  const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : env.admobAndroidBannerId;
  if (!adUnitId) return null;

  return (
    <View style={{ alignItems: "center", width: "100%" }}>
      <BannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
