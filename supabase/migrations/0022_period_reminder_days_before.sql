-- Cuántos días antes del próximo "día 1" estimado se dispara el aviso de
-- "se viene". Antes era un valor fijo (3 días) en el cliente; ahora la
-- persona lo elige.
alter table public.profiles
  add column period_reminder_days_before integer not null default 3
    check (period_reminder_days_before between 0 and 14);
