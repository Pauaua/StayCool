import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Switch, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { useHairProfile, useSaveHairProfile } from "@/features/pelo/hooks/usePelo";
import { useT } from "@/lib/i18n";

export function HairProfileScreen() {
  const profile = useHairProfile();
  const save = useSaveHairProfile();
  const { t } = useT();

  const [characteristics, setCharacteristics] = useState("");
  const [usesProducts, setUsesProducts] = useState(false);
  const [productsUsed, setProductsUsed] = useState("");
  const [isDyed, setIsDyed] = useState(false);
  const [dyeColor, setDyeColor] = useState("");

  useEffect(() => {
    if (!profile.data) return;
    setCharacteristics(profile.data.hair_characteristics ?? "");
    setUsesProducts(profile.data.uses_products);
    setProductsUsed(profile.data.products_used ?? "");
    setIsDyed(profile.data.is_dyed);
    setDyeColor(profile.data.dye_color ?? "");
  }, [profile.data]);

  function handleSave() {
    save.mutate({
      hair_characteristics: characteristics || null,
      uses_products: usesProducts,
      products_used: usesProducts ? productsUsed || null : null,
      is_dyed: isDyed,
      dye_color: isDyed ? dyeColor || null : null,
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-surface-dark dark:text-white mb-4">
          {t("pelo.profileTitle")}
        </Text>

        <Card className="mb-4">
          <TextField
            label={t("pelo.characteristics")}
            value={characteristics}
            onChangeText={setCharacteristics}
            multiline
          />

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-surface-dark dark:text-white">{t("pelo.usesProducts")}</Text>
            <Switch value={usesProducts} onValueChange={setUsesProducts} />
          </View>
          {usesProducts ? (
            <TextField label={t("pelo.whichProducts")} value={productsUsed} onChangeText={setProductsUsed} />
          ) : null}

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-surface-dark dark:text-white">{t("pelo.isDyed")}</Text>
            <Switch value={isDyed} onValueChange={setIsDyed} />
          </View>
          {isDyed ? <TextField label={t("pelo.color")} value={dyeColor} onChangeText={setDyeColor} /> : null}

          <Button label={t("pelo.save")} onPress={handleSave} loading={save.isPending} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
