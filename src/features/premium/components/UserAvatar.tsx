import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { getAvatarPhotoUrl } from "@/features/home/services/profileService";

interface UserAvatarProps {
  avatarUrl: string | null; // profiles.avatar_url (foto de perfil subida)
  size?: number;
}

// Punto único de la app para mostrar el avatar de un usuario. Si subió una
// foto de perfil, se muestra siempre esa; si no, el isotipo de la app. Diva
// (Full) lleva borde dorado en ambos casos.
export function UserAvatar({ avatarUrl, size = 64 }: UserAvatarProps) {
  const { isFull } = usePremium();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  // Si no se pudo obtener la URL de la foto, se cae al avatar por defecto en
  // vez de quedar cargando para siempre.
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoUrl(null);
    setPhotoFailed(false);
    if (!avatarUrl) return;
    let cancelled = false;
    getAvatarPhotoUrl(avatarUrl)
      .then((url) => {
        if (!cancelled) setPhotoUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPhotoFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [avatarUrl]);

  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };
  const fullBorder = { borderWidth: 2.5, borderColor: "#D4AF37" };

  if (avatarUrl && !photoFailed) {
    if (!photoUrl) {
      return (
        <View
          style={dimensionStyle}
          className="bg-rosado dark:bg-surface-cardDark items-center justify-center"
        >
          <ActivityIndicator size="small" color="#b825f2" />
        </View>
      );
    }
    return <Image source={{ uri: photoUrl }} style={[dimensionStyle, isFull ? fullBorder : null]} />;
  }

  return (
    <Image
      source={require("../../../../assets/images/isotipo.png")}
      style={[dimensionStyle, isFull ? fullBorder : null]}
    />
  );
}
