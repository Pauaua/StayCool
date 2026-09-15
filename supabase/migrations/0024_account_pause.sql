-- "Pausar cuenta": desactivación reversible al estilo Instagram/Facebook.
-- paused_at marca cuándo se pausó; el cliente re-activa automáticamente
-- (pone paused_at = null) la próxima vez que el usuario inicia sesión y
-- carga su perfil (ver useProfile.ts). No requiere lógica especial en el
-- servidor de auth: la cuenta sigue existiendo y pudiendo loguearse, solo
-- se le oculta el contenido normal de la app mientras esté pausada.
alter table public.profiles
  add column paused_at timestamptz;
