import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { usePremium } from "@/features/premium/hooks/usePremium";
import { useAvatarSelection } from "@/features/premium/hooks/useAvatar";
import { renderAvatarUrl } from "@/features/premium/avatar/renderAvatar";
import { getAvatarPhotoUrl } from "@/features/home/services/profileService";

interface UserAvatarProps {
  avatarUrl: string | null; // profiles.avatar_url (foto fija, free/básico)
  size?: number;
}

// Punto único de la app para mostrar el avatar de un usuario: decide solo
// según el tier si renderiza la foto fija o el avatar de piezas Full.
export function UserAvatar({ avatarUrl, size = 64 }: UserAvatarProps) {
  const { isFull } = usePremium();
  const { data: selection } = useAvatarSelection();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isFull || !avatarUrl) {
      setPhotoUrl(null);
      return;
    }
    let cancelled = false;
    getAvatarPhotoUrl(avatarUrl)
      .then((url) => {
        if (!cancelled) setPhotoUrl(url);
      })
      .catch(() => setPhotoUrl(null));
    return () => {
      cancelled = true;
    };
  }, [isFull, avatarUrl]);

  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (isFull) {
    if (!selection) {
      return (
        <View
          style={dimensionStyle}
          className="bg-brand-100 dark:bg-surface-cardDark items-center justify-center"
        >
          <ActivityIndicator size="small" color="#b825f2" />
        </View>
      );
    }
    return (
      <Image
        source={{ uri: renderAvatarUrl(selection, size * 2) }}
        style={[dimensionStyle, { borderWidth: 2, borderColor: "#e485ff" }]}
      />
    );
  }

  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={dimensionStyle} />;
  }

  return (
    <View style={dimensionStyle} className="bg-brand-100 dark:bg-surface-cardDark items-center justify-center">
      <Image
        source={{ uri: "https://api.dicebear.com/9.x/initials/png?seed=Agenda%20Cool&size=" + size * 2 }}
        style={dimensionStyle}
      />
    </View>
  );
}
