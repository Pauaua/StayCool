-- Detalles adicionales del outfit del día: clima, tipo de prenda, colores
-- principales y si usó accesorios (y cuáles).

alter table public.outfit_logs
  add column weather text check (weather in ('frio', 'calor', 'intermedio')),
  add column clothing_type text check (clothing_type in ('vestido', 'pantalon', 'falda', 'otro')),
  add column main_colors text,
  add column used_accessories boolean not null default false,
  add column accessories_description text;
