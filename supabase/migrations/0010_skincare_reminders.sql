-- Recordatorios de skincare matutino y nocturno, independientes del
-- recordatorio general de higiene (mismo patrón que makeup/hygiene).

alter table public.profiles
  add column skincare_morning_reminder_enabled boolean not null default false,
  add column skincare_morning_reminder_time time not null default '08:00',
  add column skincare_night_reminder_enabled boolean not null default false,
  add column skincare_night_reminder_time time not null default '22:30';
