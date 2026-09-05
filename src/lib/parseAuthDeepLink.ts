// Los links de recuperación de contraseña de Supabase vuelven como
// agendacool://reset-password#access_token=...&refresh_token=...&type=recovery
// (fragment, no query string) — RN no tiene URL()/URLSearchParams completo
// para parsear el hash de forma confiable, así que lo hacemos a mano.
export function parseAuthDeepLinkParams(url: string): Record<string, string> {
  const fragmentIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  const separatorIndex =
    fragmentIndex >= 0 ? fragmentIndex : queryIndex >= 0 ? queryIndex : -1;

  if (separatorIndex === -1) return {};

  const paramsString = url.slice(separatorIndex + 1);
  const params: Record<string, string> = {};

  for (const pair of paramsString.split("&")) {
    const [key, value] = pair.split("=");
    if (key) params[decodeURIComponent(key)] = decodeURIComponent(value ?? "");
  }

  return params;
}
