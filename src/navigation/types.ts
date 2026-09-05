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
  // que el usuario tocó en el calendario.
  SocialRegistro: { initialDate?: string } | undefined;
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
