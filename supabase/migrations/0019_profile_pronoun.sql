-- Pronombre preferido, para poder ajustar el tono del texto de la app en el
-- futuro (masculino/femenino/neutro). Por ahora solo se guarda la
-- preferencia, igual que el idioma — ver nota en ConfiguracionScreen.

alter table public.profiles
  add column pronoun text not null default 'no_se'
    check (pronoun in ('masculino', 'femenino', 'no_binarie', 'no_se'));
