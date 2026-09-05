module.exports = {
  root: true,
  extends: ["expo", "prettier"],
  // supabase/functions corre en Deno (imports por URL, runtime distinto al
  // de la app RN/Node) — no es código de este proyecto ESLint/TS.
  ignorePatterns: ["/dist/*", "supabase/functions/**"],
};
