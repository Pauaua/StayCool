// i18n.ts importa useProfile a nivel de módulo, que a su vez arrastra
// useAuth -> supabase/expo-linking/posthog (env vars, nativos, etc).
// translate() no depende de nada de eso, así que mockeamos useProfile para
// poder testearlo de forma aislada en Jest (entorno Node, sin nativos ni .env).
jest.mock("@/features/home/hooks/useProfile", () => ({
  useProfile: () => ({ data: undefined }),
}));

import { translate } from "@/lib/i18n";

describe("translate", () => {
  it("devuelve el texto en español para una clave existente", () => {
    expect(translate("es", "welcome.openAgenda")).toBe("Abrir Agenda");
  });

  it("interpola variables en el texto", () => {
    expect(translate("es", "welcome.greetingWithName", { name: "Pau" })).toBe("Hola, Pau");
  });

  it("reemplaza todas las ocurrencias de una misma variable", () => {
    expect(translate("es", "paywall.currentPlan", { plan: "Diva" })).toBe("Plan actual: Diva");
  });

  it("cae a español si la clave no existe en el idioma pedido", () => {
    // "en" no tiene todas las claves de config.*, así que debe caer a "es".
    expect(translate("en", "config.language.es")).toBe(translate("es", "config.language.es"));
  });

  it("devuelve la clave tal cual si no existe en ningún idioma", () => {
    // @ts-expect-error - clave inexistente a propósito, para probar el fallback
    expect(translate("es", "clave.que.no.existe")).toBe("clave.que.no.existe");
  });
});
