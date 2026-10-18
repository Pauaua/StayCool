import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useAvatarSelection } from "@/features/premium/hooks/useAvatar";
import { renderAvatarUrl } from "@/features/premium/avatar/renderAvatar";
import { getAvatarPhotoUrl } from "@/features/home/services/profileService";

interface UserAvatarProps {
  avatarUrl: string | null; // profiles.avatar_url (foto de perfil subida)
  size?: number;
}

// Punto único de la app para mostrar el avatar de un usuario. Si subió una
// foto de perfil, se muestra siempre esa (con borde dorado si es Diva); si
// no, Full ve el avatar de piezas y el resto unas iniciales genéricas.
export function UserAvatar({ avatarUrl, size = 64 }: UserAvatarProps) {
  const { isFull } = usePremium();
  const { data: selection } = useAvatarSelection();
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

  if (isFull) {
    if (!selection) {
      return (
        <View
          style={dimensionStyle}
          className="bg-rosado dark:bg-surface-cardDark items-center justify-center"
        >
          <ActivityIndicator size="small" color="#b825f2" />
        </View>
      );
    }
    return (
      <Image
        source={{ uri: renderAvatarUrl(selection, size * 2) }}
        style={[dimensionStyle, fullBorder]}
      />
    );
  }

  return (
    <View style={dimensionStyle} className="bg-rosado dark:bg-surface-cardDark items-center justify-center">
      <Image
        source={{ uri: "https://api.dicebear.com/9.x/initials/png?seed=Agenda%20Cool&size=" + size * 2 }}
        style={dimensionStyle}
      />
    </View>
  );
}
