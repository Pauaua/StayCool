-- Suma series y peso al registro de ejercicio, para entrenamientos de
-- fuerza (además de la duración ya existente, útil para cardio).

alter table public.wellness_exercise
  add column sets integer check (sets >= 0),
  add column weight_kg numeric(6,2) check (weight_kg >= 0);
