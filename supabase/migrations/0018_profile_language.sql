-- Idioma preferido de la usuaria (solo se guarda la preferencia por ahora;
-- traducir toda la app es un trabajo aparte, ver nota en ConfiguracionScreen).

alter table public.profiles
  add column language text not null default 'es' check (language in ('es', 'en'));
