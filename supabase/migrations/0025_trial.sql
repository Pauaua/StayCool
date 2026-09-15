-- Prueba gratuita de 3 días del plan Full ("caja de regalo" en el panel
-- principal). trial_claimed_at es el sello de "ya la usó" — una vez seteado
-- nunca se vuelve a null, así nadie puede reclamarla dos veces.
-- trial_ends_at es hasta cuándo dura; el cliente y el server la tratan como
-- "full" mientras esa fecha no haya pasado, sin necesidad de ningún cron
-- job que la desactive: el chequeo es siempre "¿ya pasó la fecha?" al leer.
--
-- Igual que premium_tier, estas dos columnas NO son editables directo por
-- el cliente (ver guard_trial_columns más abajo) — la única forma de
-- setearlas es a través de claim_trial(), que valida server-side que el
-- usuario no la haya usado antes. Sin este guard, cualquiera podría hacer
-- update directo a la tabla y regalarse premium indefinido.

alter table public.profiles
  add column trial_claimed_at timestamptz,
  add column trial_ends_at timestamptz;

create or replace function public.guard_trial_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.trial_claimed_at is distinct from old.trial_claimed_at
      or new.trial_ends_at is distinct from old.trial_ends_at)
     and coalesce(current_setting('app.allow_trial_write', true), 'false') <> 'true'
     and auth.role() <> 'service_role' then
    new.trial_claimed_at := old.trial_claimed_at;
    new.trial_ends_at := old.trial_ends_at;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_guard_trial
  before update on public.profiles
  for each row execute function public.guard_trial_columns();

-- Único punto de entrada para activar la prueba. set_config con is_local
-- (tercer argumento true) es transaccional: se resetea solo al terminar la
-- función, no puede "quedar prendido" para otras queries.
create or replace function public.claim_trial()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_already_claimed timestamptz;
  v_ends_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  select trial_claimed_at into v_already_claimed
  from public.profiles where id = v_user_id;

  if v_already_claimed is not null then
    raise exception 'Ya usaste tu prueba gratuita';
  end if;

  v_ends_at := now() + interval '3 days';

  perform set_config('app.allow_trial_write', 'true', true);
  update public.profiles
    set trial_claimed_at = now(), trial_ends_at = v_ends_at
    where id = v_user_id;
  perform set_config('app.allow_trial_write', 'false', true);

  return v_ends_at;
end;
$$;
