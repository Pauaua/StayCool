import type { SocialActivity } from "@/features/social/types";

export type AuthStackParamList = {
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  Settings: undefined;
  AvatarShop: undefined;
  Resumen: undefined;
  Paywall: undefined;
  Configuracion: undefined;
};

export type BienestarStackParamList = {
  BienestarHome: undefined;
};

export type HigieneStackParamList = {
  HigieneHome: undefined;
};

export type ImagenStackParamList = {
  ImagenHome: undefined;
  CaraSection: undefined;
  VestuarioHome: undefined;
  OutfitDetail: { outfitId: string };
  ZapatosHome: undefined;
  ShoeDetail: { shoeId: string };
};

export type PeloStackParamList = {
  PeloHome: undefined;
  HairstyleDetail: { hairstyleId: string };
  HairProfile: undefined;
};

export type GastosStackParamList = {
  GastosHome: undefined;
  GastoRapido: undefined;
  GastoDetallado: undefined;
  GastoDetalle:
    | { kind: "quick"; expenseId: string }
    | { kind: "detailed"; expenseId: string };
};

export type SocialStackParamList = {
  SocialCalendario: undefined;
  // initialDate en formato YYYY-MM-DD: precarga el formulario con el día
  // que el usuario tocó en el calendario. editActivity, si viene, pone el
  // formulario en modo edición sobre esa actividad existente (ya la tenemos
  // cargada en memoria desde el calendario, así que evitamos un fetch extra).
  SocialRegistro: { initialDate?: string; editActivity?: SocialActivity } | undefined;
};

export type GustosStackParamList = {
  GustosHome: undefined;
  GustoRapido: undefined;
  GustoDetallado: undefined;
};

export type NotasStackParamList = {
  NotasHome: undefined;
  NotaRapida: undefined;
  NotaDetallada: undefined;
};

export type EstadisticasStackParamList = {
  EstadisticasHome: undefined;
  EstadisticasHoy: undefined;
  EstadisticasSemanal: undefined;
  EstadisticasAnual: undefined;
};
