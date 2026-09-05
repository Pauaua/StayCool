import type { RefObject } from "react";
import { Platform, View } from "react-native";
import Share, { Social } from "react-native-share";
import { captureRef } from "react-native-view-shot";
import { env } from "@/config/env";

export type ShareNetwork = "instagram-stories" | "whatsapp" | "twitter" | "facebook" | "tiktok";

export interface ShareTargetDef {
  id: ShareNetwork;
  label: string;
}

export const SHARE_TARGETS: ShareTargetDef[] = [
  { id: "instagram-stories", label: "Instagram" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "twitter", label: "X" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
];

// Captura la tarjeta (View con ref) como PNG en el sistema de archivos local.
export async function captureCardImage(cardRef: RefObject<View | null>): Promise<string> {
  const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
  return Platform.OS === "android" ? `file://${uri}` : uri;
}

// Facebook App ID requerido por Instagram/Facebook Stories — ver README
// (Meta for Developers > tu app > Configuración básica). Sin este valor,
// esas dos opciones no van a funcionar y hay que caer directo al selector
// nativo.
const FACEBOOK_APP_ID = env.facebookAppId;

// Intenta compartir directo a la red elegida usando los métodos nativos por
// red de react-native-share (sticker de Instagram Stories incluido). Si el
// módulo nativo falla, la app no está instalada, o la red no tiene un
// método directo soportado (TikTok), cae al selector nativo del sistema.
export async function shareToNetwork(network: ShareNetwork, imageUri: string, message: string) {
  try {
    switch (network) {
      case "instagram-stories": {
        if (!FACEBOOK_APP_ID) throw new Error("Falta EXPO_PUBLIC_FACEBOOK_APP_ID");
        await Share.shareSingle({
          social: Social.InstagramStories,
          appId: FACEBOOK_APP_ID,
          backgroundImage: imageUri,
        });
        return;
      }
      case "whatsapp":
        await Share.shareSingle({ social: Social.Whatsapp, url: imageUri, message });
        return;
      case "twitter":
        await Share.shareSingle({ social: Social.Twitter, url: imageUri, message });
        return;
      case "facebook":
        await Share.shareSingle({ social: Social.Facebook, url: imageUri });
        return;
      case "tiktok":
        // react-native-share no tiene un método directo para TikTok en esta
        // versión: va directo al selector nativo, donde TikTok aparece como
        // una app más si está instalada.
        await shareGeneric(imageUri, message);
        return;
    }
  } catch (error) {
    console.warn(`Share directo a ${network} falló, uso selector nativo`, error);
    await shareGeneric(imageUri, message);
  }
}

export async function shareGeneric(imageUri: string, message: string) {
  await Share.open({ url: imageUri, message, failOnCancel: false });
}
