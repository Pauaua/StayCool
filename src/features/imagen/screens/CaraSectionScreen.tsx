import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, Switch, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { StarRating } from "@/components/ui/StarRating";
import {
  useCreateFaceProduct,
  useDeleteFaceProduct,
  useFaceProducts,
  useUpsertFaceLog,
  useWeekFaceLogs,
} from "@/features/imagen/hooks/useImagen";
import { useT } from "@/lib/i18n";
import type { FaceProduct, FaceProductCategory } from "@/features/imagen/types";

function AddProductForm({
  category,
  onDone,
}: {
  category: FaceProductCategory;
  onDone: () => void;
}) {
  const create = useCreateFaceProduct();
  const { t } = useT();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState(0);

  function handleAdd() {
    if (!name.trim()) return;
    create.mutate(
      {
        category,
        name: name.trim(),
        brand: brand.trim() || undefined,
        price: price ? Number(price) : undefined,
        rating: rating || undefined,
      },
      { onSuccess: onDone }
    );
  }

  return (
    <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      <TextField label={t("cara.productName")} value={name} onChangeText={setName} />
      <TextField label={t("cara.brandOptional")} value={brand} onChangeText={setBrand} />
      <TextField
        label={t("cara.priceOptional")}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <View className="mb-4">
        <Text className="text-sm font-semibold text-surface-dark dark:text-white mb-1.5">
          {t("cara.rating")}
        </Text>
        <StarRating value={rating} onChange={setRating} />
      </View>
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button label={t("cara.save")} onPress={handleAdd} loading={create.isPending} />
        </View>
        <View className="flex-1">
          <Button label={t("cara.cancel")} variant="ghost" onPress={onDone} />
        </View>
      </View>
    </View>
  );
}

function ProductRow({ product, category }: { product: FaceProduct; category: FaceProductCategory }) {
  const [expanded, setExpanded] = useState(false);
  const remove = useDeleteFaceProduct(category);
  const { t } = useT();

  return (
    <Card className="mb-2">
      <Pressable onPress={() => setExpanded((v) => !v)} className="flex-row justify-between items-center">
        <Text className="text-surface-dark dark:text-white font-semibold flex-1 pr-2">
          {product.name}
        </Text>
        <StarRating value={product.rating ?? 0} size={14} />
        <Text className="text-gray-400 ml-2">{expanded ? "▲" : "▼"}</Text>
      </Pressable>
      {expanded ? (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Text className="text-sm text-gray-500 mb-1">
            {t("cara.brand", { brand: product.brand || "—" })}
          </Text>
          <Text className="text-sm text-gray-500 mb-2">
            {t("cara.price", { price: product.price !== null ? `$${product.price}` : "—" })}
          </Text>
          <Pressable onPress={() => remove.mutate(product.id)} className="mt-1">
            <Text className="text-xs text-accent-coral">{t("cara.deleteProduct")}</Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

function ProductRegistry({
  category,
  title,
  addLabel,
}: {
  category: FaceProductCategory;
  title: string;
  addLabel: string;
}) {
  const { data: products } = useFaceProducts(category);
  const [adding, setAdding] = useState(false);
  const { t } = useT();

  return (
    <View className="mb-4">
      <Card>
        <Text className="text-base font-bold text-surface-dark dark:text-white mb-1">{title}</Text>

        {products && products.length > 0 ? (
          <View className="mt-2">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} category={category} />
            ))}
          </View>
        ) : !adding ? (
          <Text className="text-sm text-gray-400 mt-2">{t("cara.noProducts")}</Text>
        ) : null}

        {adding ? <AddProductForm category={category} onDone={() => setAdding(false)} /> : null}
      </Card>

      {!adding ? (
        <View className="mt-2">
          <Button label={addLabel} variant="secondary" onPress={() => setAdding(true)} />
        </View>
      ) : null}
    </View>
  );
}

export function CaraSectionScreen() {
  const week = useWeekFaceLogs();
  const upsert = useUpsertFaceLog();
  const [woreMakeup, setWoreMakeup] = useState(false);
  const { t, tg } = useT();

  const makeupDaysThisWeek = (week.data ?? []).filter((d) => d.wore_makeup).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-4">
      <FlatList
        contentContainerStyle={{ paddingBottom: 40 }}
        data={week.data ?? []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text className="text-2xl font-bold text-pastel-purple dark:text-white mb-4">
              {t("cara.title")}
            </Text>

            <Card className="mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-surface-dark dark:text-white">{t("cara.woreMakeupToday")}</Text>
                <Switch value={woreMakeup} onValueChange={setWoreMakeup} />
              </View>
              <Button
                label={t("cara.save")}
                onPress={() => upsert.mutate({ woreMakeup })}
                loading={upsert.isPending}
              />
            </Card>

            <Card className="mb-4">
              <Text className="text-surface-dark dark:text-white">
                {t("cara.timesThisWeek", {
                  n: String(makeupDaysThisWeek),
                  vez: makeupDaysThisWeek === 1 ? t("cara.once") : t("cara.timesPlural"),
                })}
              </Text>
            </Card>

            <Text className="text-xl font-bold text-pastel-purple mt-2 mb-1">
              {t("cara.facialCleansing")}
            </Text>
            <Text className="text-sm text-gray-500 mb-2">{t("cara.facialCleansingDesc")}</Text>

            <ProductRegistry
              category="limpieza_facial"
              title={t("cara.faceProductsTitle")}
              addLabel={t("cara.addProduct")}
            />
            <ProductRegistry
              category="maquillaje"
              title={t("cara.makeupProductsTitle")}
              addLabel={t("cara.addMakeup")}
            />

            <Text className="text-lg font-semibold text-pastel-purple dark:text-white mb-2 mt-2">
              {t("cara.weekHistory")}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <Card className="mb-2">
            <Text className="text-xs text-gray-400">
              {item.face_date} · {item.wore_makeup ? tg("cara.wornMakeup") : t("cara.noMakeup")}
            </Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
