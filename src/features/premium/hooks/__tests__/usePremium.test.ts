import type { CustomerInfo } from "react-native-purchases";

// usePremium.tsx importa el SDK nativo de react-native-purchases a nivel de
// módulo; en Jest (entorno Node, sin nativos) eso falla al cargar el
// paquete real. Lo mockeamos para poder testear resolveTier de forma
// aislada, sin depender del SDK.
jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {},
  LOG_LEVEL: { DEBUG: "DEBUG" },
}));

// usePremium.tsx también lee src/config/env.ts a nivel de módulo, que lanza
// si faltan las env vars de Supabase (no seteadas en el entorno de test).
jest.mock("@/config/env", () => ({
  env: { revenueCatApiKeyIos: "", revenueCatApiKeyAndroid: "" },
}));

// usePremium.tsx también usa useProfile (para saber si hay una prueba
// gratuita activa), que arrastra useAuth -> supabase/AsyncStorage.
// resolveTier() no depende de React ni de este hook, así que lo mockeamos
// para poder testearla en aislamiento.
jest.mock("@/features/home/hooks/useProfile", () => ({
  useProfile: () => ({ data: undefined }),
}));

import { resolveTier } from "@/features/premium/hooks/usePremium";

function customerInfoWithEntitlements(active: string[]): CustomerInfo {
  const entitlements = Object.fromEntries(active.map((key) => [key, {}])) as CustomerInfo["entitlements"]["active"];
  return { entitlements: { active: entitlements } } as CustomerInfo;
}

describe("resolveTier", () => {
  const originalDev = (global as any).__DEV__;

  // resolveTier tiene un bypass a "full" en __DEV__ (para probar pantallas
  // premium sin pagar) — hay que desactivarlo para poder testear la lógica
  // real basada en entitlements, que es la que corre en producción.
  beforeEach(() => {
    (global as any).__DEV__ = false;
  });

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
  });

  it("devuelve 'free' cuando no hay CustomerInfo", () => {
    expect(resolveTier(null, false)).toBe("free");
  });

  it("devuelve 'free' cuando no hay entitlements activos", () => {
    expect(resolveTier(customerInfoWithEntitlements([]), false)).toBe("free");
  });

  it("devuelve 'basico' cuando solo el entitlement basico está activo", () => {
    expect(resolveTier(customerInfoWithEntitlements(["basico"]), false)).toBe("basico");
  });

  it("devuelve 'full' cuando el entitlement full está activo", () => {
    expect(resolveTier(customerInfoWithEntitlements(["full"]), false)).toBe("full");
  });

  it("prioriza 'full' sobre 'basico' cuando ambos están activos", () => {
    expect(resolveTier(customerInfoWithEntitlements(["basico", "full"]), false)).toBe("full");
  });

  it("con la prueba gratuita activa devuelve 'full' aunque no haya entitlements", () => {
    expect(resolveTier(null, true)).toBe("full");
    expect(resolveTier(customerInfoWithEntitlements([]), true)).toBe("full");
  });

  it("la prueba gratuita no pisa 'basico' hacia abajo, pero sí lo sube a 'full'", () => {
    expect(resolveTier(customerInfoWithEntitlements(["basico"]), true)).toBe("full");
  });

  it("en __DEV__ siempre devuelve 'full', sin importar los entitlements", () => {
    (global as any).__DEV__ = true;
    expect(resolveTier(null, false)).toBe("full");
    expect(resolveTier(customerInfoWithEntitlements([]), false)).toBe("full");
  });
});
