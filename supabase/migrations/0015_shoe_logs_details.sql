-- Detalles adicionales del calzado del día: clima, tipo, color, marca,
-- estado y notas — mismo patrón que outfit_logs.

alter table public.shoe_logs
  add column weather text check (weather in ('frio', 'calor', 'intermedio')),
  add column shoe_type text check (
    shoe_type in ('sandalia', 'zapatilla', 'botines', 'bototos', 'trekking', 'otro')
  ),
  add column color text,
  add column brand text,
  add column condition text check (condition in ('bueno', 'pasable', 'necesita_cambio')),
  add column notes text;
