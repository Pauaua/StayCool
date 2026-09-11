-- Recordatorio de menstruación. is_menstruating habilita la sección en
-- Ajustes; last_period_date es la fecha del día 1 del último período (exacta
-- o aproximada, no distinguimos cuál en la base — la UI le pide "aproximado"
-- si el usuario no está segura, pero el dato se guarda igual). cycle_length_days
-- se usa junto con last_period_date para predecir el próximo día 1 y así
-- calcular cuándo disparar el aviso "se viene" (client-side, en
-- notifications.ts, igual que el resto de los recordatorios locales).
alter table public.profiles
  add column is_menstruating boolean not null default false,
  add column period_reminder_enabled boolean not null default false,
  add column last_period_date date,
  add column cycle_length_days integer not null default 28
    check (cycle_length_days between 15 and 45);
