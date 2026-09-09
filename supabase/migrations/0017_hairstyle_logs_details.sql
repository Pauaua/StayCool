-- Detalles adicionales del peinado del día: tipo, y si es para una ocasión
-- especial (con detalle libre de esa ocasión).

alter table public.hairstyle_logs
  add column style_type text check (style_type in ('coleta', 'suelto', 'trenzas', 'otro')),
  add column is_special_occasion boolean not null default false,
  add column occasion_details text;
