-- Puntuación de 1 a 5 estrellas para saber qué tanto le gustó cada registro
-- de Gustos (rápido y detallado), igual que ya existe para wellness_meals.

alter table public.taste_quick_logs
  add column rating smallint check (rating between 1 and 5);

alter table public.taste_detailed_logs
  add column rating smallint check (rating between 1 and 5);
