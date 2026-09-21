import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import {
  useDeleteDetailedNote,
  useDeleteQuickNote,
  useDetailedNotes,
  useQuickNotes,
  useUpdateDetailedNote,
  useUpdateQuickNote,
} from "@/features/notas/hooks/useNotas";
import { useT } from "@/lib/i18n";
import type { DetailedNote, QuickNote } from "@/features/notas/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NotasStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<NotasStackParamList, "NotasHome">;

function QuickNoteEditModal({ note, onClose }: { note: QuickNote | null; onClose: () => void }) {
  const update = useUpdateQuickNote();
  const remove = useDeleteQuickNote();
  const { t, tg } = useT();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [feeling, setFeeling] = useState("");

  useEffect(() => {
    if (note) {
      setName(note.name);
      setDescription(note.description ?? "");
      setFeeling(note.feeling ?? "");
    }
  }, [note]);

  function handleDelete() {
    if (!note) return;
    Alert.alert(t("notas.deleteTitle"), tg("notas.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => remove.mutate(note.id, { onSuccess: onClose }) },
    ]);
  }

  return (
    <Modal visible={note !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <Card className="w-full">
          <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">{t("notas.editNote")}</Text>
          <TextField label={t("notas.nameLabel")} value={name} onChangeText={setName} />
          <TextField label={t("notas.descriptionOptional")} value={description} onChangeText={setDescription} multiline />
          <TextField label={t("notas.feelingOptional")} value={feeling} onChangeText={setFeeling} />
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1">
              <Button
                label={t("common.saveChanges")}
                onPress={() =>
                  note &&
                  name.trim() &&
                  update.mutate(
                    { id: note.id, name: name.trim(), description: description.trim() || undefined, feeling: feeling.trim() || undefined },
                    { onSuccess: onClose }
                  )
                }
                loading={update.isPending}
              />
            </View>
            <View className="flex-1">
              <Button label={t("common.cancel")} variant="ghost" onPress={onClose} />
            </View>
          </View>
          <Pressable onPress={handleDelete} disabled={remove.isPending}>
            <Text className="text-xs text-accent-coral text-center">
              {remove.isPending ? t("common.deleting") : t("common.delete")}
            </Text>
          </Pressable>
        </Card>
      </View>
    </Modal>
  );
}

function DetailedNoteEditModal({ note, onClose }: { note: DetailedNote | null; onClose: () => void }) {
  const update = useUpdateDetailedNote();
  const remove = useDeleteDetailedNote();
  const { t, tg } = useT();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [idea, setIdea] = useState("");
  const [feelings, setFeelings] = useState("");
  const [thoughts, setThoughts] = useState("");

  useEffect(() => {
    if (note) {
      setName(note.name);
      setLocation(note.location ?? "");
      setIdea(note.idea);
      setFeelings(note.feelings ?? "");
      setThoughts(note.thoughts ?? "");
    }
  }, [note]);

  function handleDelete() {
    if (!note) return;
    Alert.alert(t("notas.deleteTitle"), tg("notas.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => remove.mutate(note.id, { onSuccess: onClose }) },
    ]);
  }

  return (
    <Modal visible={note !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <Card className="w-full" style={{ maxHeight: "85%" }}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text className="text-lg font-bold text-surface-dark dark:text-white mb-3">{t("notas.editNote")}</Text>
            <TextField label={t("notas.nameLabel")} value={name} onChangeText={setName} />
            <TextField label={t("notas.locationOptional")} value={location} onChangeText={setLocation} />
            <TextField label={t("notas.ideaLabel")} value={idea} onChangeText={setIdea} multiline />
            <TextField label={t("notas.feelingsOptional")} value={feelings} onChangeText={setFeelings} />
            <TextField label={t("notas.thoughtsOptional")} value={thoughts} onChangeText={setThoughts} multiline />
            <View className="flex-row gap-2 mb-2">
              <View className="flex-1">
                <Button
                  label={t("common.saveChanges")}
                  onPress={() =>
                    note &&
                    name.trim() &&
                    idea.trim() &&
                    update.mutate(
                      {
                        id: note.id,
                        name: name.trim(),
                        location: location.trim() || undefined,
                        idea: idea.trim(),
                        feelings: feelings.trim() || undefined,
                        thoughts: thoughts.trim() || undefined,
                      },
                      { onSuccess: onClose }
                    )
                  }
                  loading={update.isPending}
                />
              </View>
              <View className="flex-1">
                <Button label={t("common.cancel")} variant="ghost" onPress={onClose} />
              </View>
            </View>
            <Pressable onPress={handleDelete} disabled={remove.isPending}>
              <Text className="text-xs text-accent-coral text-center">
                {remove.isPending ? t("common.deleting") : t("common.delete")}
              </Text>
            </Pressable>
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
}

export function NotasHomeScreen({ navigation }: Props) {
  const [tab, setTab] = useState<"rapida" | "detallada">("rapida");
  const quick = useQuickNotes();
  const detailed = useDetailedNotes();
  const [editingQuick, setEditingQuick] = useState<QuickNote | null>(null);
  const [editingDetailed, setEditingDetailed] = useState<DetailedNote | null>(null);
  const { t } = useT();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-surface-dark px-5 pt-8">
      <View className="flex-row items-center mb-4">
        <Image
          source={require("../../../../assets/images/notas2.png")}
          style={{ width: 56, height: 56, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-surface-dark dark:text-white">{t("notas.title")}</Text>
      </View>

      <View className="mb-4">
        <View className="mb-2">
          <Button label={t("notas.quickIdea")} onPress={() => navigation.navigate("NotaRapida")} />
        </View>
        <Button label={t("notas.fullIdea")} variant="secondary" onPress={() => navigation.navigate("NotaDetallada")} />
      </View>

      <Text className="text-lg font-semibold text-surface-dark dark:text-white mb-2">
        {t("notas.record")}
      </Text>

      <View className="flex-row mb-3">
        <Chip label={t("notas.quickTab")} selected={tab === "rapida"} onPress={() => setTab("rapida")} />
        <Chip label={t("notas.fullTab")} selected={tab === "detallada"} onPress={() => setTab("detallada")} />
      </View>

      {tab === "rapida" ? (
        <FlatList
          contentContainerStyle={{ paddingBottom: 40 }}
          data={quick.data?.pages.flatMap((p) => p.items) ?? []}
          keyExtractor={(item) => item.id}
          onEndReached={() => quick.hasNextPage && quick.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Pressable onPress={() => setEditingQuick(item)}>
              <Card className="mb-2">
                <Text className="text-surface-dark dark:text-white font-semibold">{item.name}</Text>
                {item.description ? <Text className="text-gray-500 text-sm">{item.description}</Text> : null}
                {item.feeling ? (
                  <Text className="text-brand-500 text-sm">{t("notas.feelingLabel", { value: item.feeling })}</Text>
                ) : null}
                <Text className="text-xs text-gray-400">{format(new Date(item.logged_at), "dd MMM yyyy")}</Text>
              </Card>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          contentContainerStyle={{ paddingBottom: 40 }}
          data={detailed.data?.pages.flatMap((p) => p.items) ?? []}
          keyExtractor={(item) => item.id}
          onEndReached={() => detailed.hasNextPage && detailed.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Pressable onPress={() => setEditingDetailed(item)}>
              <Card className="mb-2">
                <Text className="text-surface-dark dark:text-white font-semibold">{item.name}</Text>
                <Text className="text-gray-500 text-sm">{item.idea}</Text>
                {item.location ? <Text className="text-xs text-gray-400">📍 {item.location}</Text> : null}
                {item.feelings ? (
                  <Text className="text-brand-500 text-sm">{t("notas.feelingsLabel", { value: item.feelings })}</Text>
                ) : null}
                {item.thoughts ? (
                  <Text className="text-gray-500 text-sm">{t("notas.thoughtsLabel", { value: item.thoughts })}</Text>
                ) : null}
              </Card>
            </Pressable>
          )}
        />
      )}

      <QuickNoteEditModal note={editingQuick} onClose={() => setEditingQuick(null)} />
      <DetailedNoteEditModal note={editingDetailed} onClose={() => setEditingDetailed(null)} />
    </SafeAreaView>
  );
}
