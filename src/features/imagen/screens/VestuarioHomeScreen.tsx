import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useSaveOutfit, useWeekOutfits } from "@/features/imagen/hooks/useImagen";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ImagenStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ImagenStackParamList, "VestuarioHome">;

export function VestuarioHomeScreen({ navigation }: Props) {
  const outfits = useWeekOutfits();
  const save = useSaveOutfit();
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setImageUri(result.assets[0]?.uri);
  }

  async function handleSave() {
    const today = format(new Date(), "yyyy-MM-dd");
    await save.mutateAsync({ date: today, description, localImageUri: imageUri });
    setDescription("");
    setImageUri(undefined);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">Vestuario</Text>

      <Card className="mb-4">
        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-2">
          ¿Qué usaste hoy?
        </Text>
        <TextField label="Descripción" value={description} onChangeText={setDescription} />
        <Button
          label={imageUri ? "Foto seleccionada ✓" : "Agregar foto (opcional)"}
          variant="ghost"
          onPress={pickImage}
        />
        <View className="h-2" />
        <Button label="Guardar" onPress={handleSave} loading={save.isPending} />
      </Card>

      <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
        Esta semana — tocá un día para ver el detalle
      </Text>
      <FlatList
        data={outfits.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("OutfitDetail", { outfitId: item.id })}>
            <Card className="mb-2">
              <Text className="text-surface-dark dark:text-white" numberOfLines={1}>
                {item.description || "Sin descripción"}
              </Text>
              <Text className="text-xs text-gray-400">
                {item.outfit_date} {item.photo_path ? "· 📷" : ""}
              </Text>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
