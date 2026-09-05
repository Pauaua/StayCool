-- Agenda Cool — integra "lavado de pelo" al checklist de Higiene.
-- Sigue siendo un ítem más del checklist (con su check normal), pero al
-- marcarlo como completado además queda un registro con fecha/hora exacta
-- en hair_wash_logs, para que el historial "cada cuánto te lavás el pelo"
-- (módulo Pelo) siga funcionando igual que antes.

alter table public.hygiene_items
  add column is_hair_wash boolean not null default false;

-- Solo puede haber un ítem "especial" de lavado de pelo por usuario, para
-- que el toggle sepa sin ambigüedad a cuál escribirle el registro extra.
create unique index idx_hygiene_items_one_hair_wash_per_user
  on public.hygiene_items (user_id)
  where is_hair_wash;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');

  insert into public.hygiene_items (user_id, label, icon, sort_order, is_hair_wash)
  values
    (new.id, 'Ducha', '🚿', 0, false),
    (new.id, 'Cepillado + hilo dental', '🪥', 1, false),
    (new.id, 'Enjuague bucal', '🧴', 2, false),
    (new.id, 'Desodorante', '💧', 3, false),
    (new.id, 'Lavado de pelo', '💇', 4, true);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Siembra retroactiva: a cualquier usuario que ya tenga checklist pero
-- todavía no tenga el ítem especial de lavado de pelo, se lo agrega.
insert into public.hygiene_items (user_id, label, icon, sort_order, is_hair_wash)
select distinct hi.user_id, 'Lavado de pelo', '💇', 4, true
from public.hygiene_items hi
where not exists (
  select 1 from public.hygiene_items hi2
  where hi2.user_id = hi.user_id and hi2.is_hair_wash
);
