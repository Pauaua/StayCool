-- Puntuación de 1 a 5 estrellas para saber qué tan rica estaba la comida.

alter table public.wellness_meals
  add column rating smallint check (rating between 1 and 5);
