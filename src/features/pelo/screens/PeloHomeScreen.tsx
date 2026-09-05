import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useHairstyles, useHairWashHistory, useLogHairstyle } from "@/features/pelo/hooks/usePelo";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PeloStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<PeloStackParamList, "PeloHome">;

export function PeloHomeScreen({ navigation }: Props) {
  const washHistory = useHairWashHistory();
  const hairstyles = useHairstyles();
  const logStyle = useLogHairstyle();
  const [hairstyle, setHairstyle] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0]?.uri);
  }

  const hairstyleItems = hairstyles.data?.pages.flatMap((p) => p.items) ?? [];
  const washItems = washHistory.data?.pages.flatMap((p) => p.items) ?? [];
  const lastWash = washItems[0];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">Pelo</Text>

      <ScrollView>
        <Card className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-surface-dark dark:text-white font-semibold">Último lavado</Text>
            <Text className="text-xs text-gray-400">
              {lastWash ? format(new Date(lastWash.washed_at), "dd MMM yyyy HH:mm") : "Sin registros aún"}
            </Text>
          </View>
          <Button label="Perfil de cabello" variant="ghost" onPress={() => navigation.navigate("HairProfile")} />
        </Card>

        <Card className="mb-4">
          <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
            Peinado de hoy
          </Text>
          <TextField label="¿Qué peinado?" value={hairstyle} onChangeText={setHairstyle} />
          <Button
            label={imageUri ? "Foto seleccionada ✓" : "Agregar foto (opcional)"}
            variant="ghost"
            onPress={pickImage}
          />
          <View className="h-2" />
          <Button
            label="Guardar peinado"
            variant="secondary"
            onPress={() => {
              if (!hairstyle.trim()) return;
              logStyle.mutate({ hairstyle: hairstyle.trim(), localImageUri: imageUri });
              setHairstyle("");
              setImageUri(undefined);
            }}
            loading={logStyle.isPending}
          />
        </Card>

        <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
          Historial de peinados — tocá uno para ver el detalle
        </Text>
        {hairstyleItems.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => navigation.navigate("HairstyleDetail", { hairstyleId: item.id })}
          >
            <Card className="mb-2">
              <Text className="text-surface-dark dark:text-white" numberOfLines={1}>
                {item.hairstyle}
              </Text>
              <Text className="text-xs text-gray-400">
                {item.style_date} {item.photo_path ? "· 📷" : ""}
              </Text>
            </Card>
          </Pressable>
        ))}
        {hairstyles.hasNextPage ? (
          <Button label="Cargar más" variant="ghost" onPress={() => hairstyles.fetchNextPage()} />
        ) : null}

        <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2 mt-4">
          Historial lavado de pelo
        </Text>
        {washItems.map((item) => (
          <Card key={item.id} className="mb-2">
            <Text className="text-surface-dark dark:text-white">
              {format(new Date(item.washed_at), "dd MMM yyyy HH:mm")}
            </Text>
          </Card>
        ))}
        {washHistory.hasNextPage ? (
          <Button label="Cargar más" variant="ghost" onPress={() => washHistory.fetchNextPage()} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
