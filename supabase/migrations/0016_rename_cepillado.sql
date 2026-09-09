-- "Hilo dental" ya existe como ítem aparte en el catálogo de presets, así
-- que sobra en el nombre del ítem sembrado por defecto "Cepillado + hilo
-- dental" — lo dejamos solo como "Cepillado".

update public.hygiene_items
set label = 'Cepillado'
where label = 'Cepillado + hilo dental';

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');

  insert into public.hygiene_items (user_id, label, icon, sort_order, is_hair_wash)
  values
    (new.id, 'Ducha', '🚿', 0, false),
    (new.id, 'Cepillado', '🪥', 1, false),
    (new.id, 'Enjuague bucal', '🧴', 2, false),
    (new.id, 'Desodorante', '💧', 3, false),
    (new.id, 'Lavado de pelo', '💇', 4, true);

  return new;
end;
$$ language plpgsql security definer set search_path = public;
