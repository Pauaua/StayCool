-- Agenda Cool — checklist de higiene por defecto para usuarios nuevos.
-- Sin esto, un usuario recién registrado ve el checklist vacío hasta que
-- agrega ítems manualmente. Extendemos el mismo trigger que ya crea el
-- profile (0001_init.sql) para que también siembre los ítems base; el
-- usuario los puede editar o borrar después desde Higiene sin problema.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');

  insert into public.hygiene_items (user_id, label, icon, sort_order)
  values
    (new.id, 'Ducha', '🚿', 0),
    (new.id, 'Cepillado + hilo dental', '🪥', 1),
    (new.id, 'Enjuague bucal', '🧴', 2),
    (new.id, 'Desodorante', '💧', 3);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Siembra retroactiva para cuentas que ya existían antes de esta migración
-- y todavía no tienen ningún ítem de higiene cargado.
insert into public.hygiene_items (user_id, label, icon, sort_order)
select p.id, defaults.label, defaults.icon, defaults.sort_order
from public.profiles p
cross join (
  values
    ('Ducha', '🚿', 0),
    ('Cepillado + hilo dental', '🪥', 1),
    ('Enjuague bucal', '🧴', 2),
    ('Desodorante', '💧', 3)
) as defaults(label, icon, sort_order)
where not exists (
  select 1 from public.hygiene_items hi where hi.user_id = p.id
);
