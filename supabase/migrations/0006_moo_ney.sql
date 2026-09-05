-- Agenda Cool+ — nivel de suscripción sincronizado desde RevenueCat, y
-- sistema de recompensas MOOney (fichas de juego, plan Full).
--
-- IMPORTANTE: MOOney es moneda de juego, totalmente independiente del dinero
-- real que el usuario registra en el módulo Gastos. No se mezcla con
-- expense_quick_logs / expense_detailed_logs en ningún cálculo.

-- ============================================================
-- 0. Nivel de suscripción en profiles
-- ============================================================

-- La verdad sobre el tier vive en RevenueCat; esta columna es una copia de
-- lectura rápida que actualiza la Edge Function revenuecat-webhook cuando
-- RevenueCat notifica cambios de entitlement. El cliente nunca la escribe
-- directamente (ver política de update de profiles más abajo).
alter table public.profiles
  add column premium_tier text not null default 'free'
    check (premium_tier in ('free', 'basico', 'full'));

-- El cliente sigue pudiendo actualizar su propio profile (nombre, avatar,
-- recordatorios) vía la policy existente, pero premium_tier nunca debe
-- moverse por esa vía: este trigger revierte silenciosamente cualquier
-- cambio a la columna salvo que venga de la service role (Edge Function
-- revenuecat-webhook), que es la única fuente de verdad para el tier.
create or replace function public.guard_premium_tier()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.premium_tier is distinct from old.premium_tier and auth.role() <> 'service_role' then
    new.premium_tier := old.premium_tier;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_guard_premium_tier
  before update on public.profiles
  for each row execute function public.guard_premium_tier();

-- ============================================================
-- 1. Avatar personalizable (plan Full) — piezas desacopladas del renderizador
-- ============================================================

-- Selección de piezas del usuario, como datos simples. Un módulo de
-- renderizado aparte (hoy: DiceBear) traduce esto a la imagen final; cuando
-- haya arte propio, se reemplaza solo ese módulo, no esta tabla.
create table public.avatar_selections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cara text not null default 'base-1',
  pelo text not null default 'corto-1',
  color_piel text not null default 'tono-1',
  accesorio text,
  updated_at timestamptz not null default now()
);
create trigger trg_avatar_selections_updated_at before update on public.avatar_selections
  for each row execute function public.set_updated_at();
alter table public.avatar_selections enable row level security;
create policy "avatar_selections_select_own" on public.avatar_selections
  for select using (auth.uid() = user_id);
create policy "avatar_selections_upsert_own" on public.avatar_selections
  for insert with check (auth.uid() = user_id);
create policy "avatar_selections_update_own" on public.avatar_selections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Piezas que el usuario ya desbloqueó (comprándolas con MOOney). Las piezas
-- del set inicial gratuito no necesitan fila acá (se validan por catálogo
-- estático en el cliente/edge function); esta tabla solo registra compras.
create table public.avatar_unlocked_pieces (
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('cara', 'pelo', 'color_piel', 'accesorio')),
  piece_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, category, piece_id)
);
alter table public.avatar_unlocked_pieces enable row level security;
create policy "avatar_unlocked_pieces_select_own" on public.avatar_unlocked_pieces
  for select using (auth.uid() = user_id);

-- ============================================================
-- 2. MOOney — saldo e historial
-- ============================================================

create table public.moo_ney_balance (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);
alter table public.moo_ney_balance enable row level security;
create policy "moo_ney_balance_select_own" on public.moo_ney_balance
  for select using (auth.uid() = user_id);
-- Sin insert/update/delete para clientes: el saldo solo se mueve a través
-- de las funciones security definer de más abajo.

create table public.moo_ney_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount <> 0), -- positivo = otorgado, negativo = gastado en la tienda
  action_key text not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
-- Una acreditación (amount > 0) por (usuario, action_key): action_key ya
-- incluye la fecha/período cuando la acción es diaria o periódica
-- (ej. 'bienestar_registro:2026-09-03'), así que este índice es lo que
-- hace imposible acreditar dos veces la misma acción el mismo día/período.
create unique index idx_moo_ney_tx_grant_once on public.moo_ney_transactions (user_id, action_key)
  where amount > 0;
create index idx_moo_ney_tx_user on public.moo_ney_transactions (user_id, created_at desc);
alter table public.moo_ney_transactions enable row level security;
create policy "moo_ney_transactions_select_own" on public.moo_ney_transactions
  for select using (auth.uid() = user_id);

-- ============================================================
-- 3. Otorgar MOOney — siempre resuelto en el servidor
-- ============================================================

-- Inserta la transacción (no-op si ya se otorgó ese action_key) y, solo si
-- insertó, suma al saldo. Uso interno de las funciones de este archivo.
create or replace function public._grant_mooney(
  p_user_id uuid,
  p_amount integer,
  p_action_key text,
  p_reason text,
  p_metadata jsonb default '{}'::jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row_count integer;
begin
  insert into public.moo_ney_transactions (user_id, amount, action_key, reason, metadata)
  values (p_user_id, p_amount, p_action_key, p_reason, p_metadata)
  on conflict (user_id, action_key) where amount > 0 do nothing;

  get diagnostics v_row_count = row_count;

  if v_row_count > 0 then
    insert into public.moo_ney_balance (user_id, balance)
    values (p_user_id, p_amount)
    on conflict (user_id) do update
      set balance = public.moo_ney_balance.balance + excluded.balance,
          updated_at = now();
  end if;

  return v_row_count > 0;
end;
$$;

-- Checklist de Higiene 100% cumplido en una fecha (contra los items
-- actualmente activos del usuario).
create or replace function public._hygiene_day_complete(p_user_id uuid, p_date date)
returns boolean
language sql
stable
as $$
  select
    (select count(*) from public.hygiene_items where user_id = p_user_id and is_active = true) > 0
    and (select count(*) from public.hygiene_items where user_id = p_user_id and is_active = true)
      = (
        select count(*)
        from public.hygiene_logs l
        join public.hygiene_items i on i.id = l.hygiene_item_id
        where l.user_id = p_user_id and l.log_date = p_date and l.completed = true and i.is_active = true
      );
$$;

-- Longitud de la racha de días consecutivos con higiene 100%, terminando
-- (inclusive) en p_end_date.
create or replace function public._hygiene_streak_length(p_user_id uuid, p_end_date date)
returns integer
language plpgsql
stable
as $$
declare
  v_len integer := 0;
  v_day date := p_end_date;
begin
  loop
    exit when v_len > 400 or not public._hygiene_day_complete(p_user_id, v_day);
    v_len := v_len + 1;
    v_day := v_day - 1;
  end loop;
  return v_len;
end;
$$;

-- "Día perfecto": al menos un registro en cada uno de los 7 módulos, esa fecha.
create or replace function public._all_modules_touched(p_user_id uuid, p_date date)
returns boolean
language sql
stable
as $$
  select
    (
      exists (select 1 from public.wellness_meals where user_id = p_user_id and meal_date = p_date)
      or exists (select 1 from public.wellness_sleep where user_id = p_user_id and sleep_date = p_date)
      or exists (select 1 from public.wellness_exercise where user_id = p_user_id and exercise_date = p_date)
    )
    and exists (select 1 from public.hygiene_logs where user_id = p_user_id and log_date = p_date)
    and (
      exists (select 1 from public.hair_wash_logs where user_id = p_user_id and wash_date = p_date)
      or exists (select 1 from public.hairstyle_logs where user_id = p_user_id and style_date = p_date)
    )
    and exists (select 1 from public.face_logs where user_id = p_user_id and face_date = p_date)
    and exists (select 1 from public.outfit_logs where user_id = p_user_id and outfit_date = p_date)
    and exists (select 1 from public.social_activities where user_id = p_user_id and scheduled_at::date = p_date)
    and (
      exists (select 1 from public.expense_quick_logs where user_id = p_user_id and expense_date = p_date)
      or exists (select 1 from public.expense_detailed_logs where user_id = p_user_id and expense_date = p_date)
    );
$$;

-- Punto de entrada público: el cliente lo llama (vía supabase.rpc) después
-- de cualquier registro, tantas veces como quiera — es idempotente y
-- siempre re-deriva la verdad desde las tablas de cada módulo, nunca desde
-- lo que el cliente diga que hizo. Solo otorga MOOney a usuarios "full".
create or replace function public.sync_mooney()
returns table(action_key text, amount integer, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tier text;
  v_today date := (now() at time zone 'utc')::date;
  v_streak integer;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  select premium_tier into v_tier from public.profiles where id = v_user_id;
  if v_tier is distinct from 'full' then
    return; -- MOOney es exclusivo del plan Full
  end if;

  if exists (select 1 from public.wellness_meals where user_id = v_user_id and meal_date = v_today)
     or exists (select 1 from public.wellness_sleep where user_id = v_user_id and sleep_date = v_today)
     or exists (select 1 from public.wellness_exercise where user_id = v_user_id and exercise_date = v_today) then
    perform public._grant_mooney(v_user_id, 3, 'bienestar_registro:' || v_today, 'Registro en Bienestar');
  end if;

  if exists (select 1 from public.hair_wash_logs where user_id = v_user_id and wash_date = v_today)
     or exists (select 1 from public.hairstyle_logs where user_id = v_user_id and style_date = v_today) then
    perform public._grant_mooney(v_user_id, 3, 'pelo_registro:' || v_today, 'Registro en Pelo');
  end if;

  if exists (select 1 from public.face_logs where user_id = v_user_id and face_date = v_today) then
    perform public._grant_mooney(v_user_id, 3, 'cara_registro:' || v_today, 'Registro en Cara');
  end if;

  if exists (select 1 from public.outfit_logs where user_id = v_user_id and outfit_date = v_today) then
    perform public._grant_mooney(v_user_id, 3, 'imagen_registro:' || v_today, 'Registro en Imagen');
  end if;

  if exists (select 1 from public.social_activities where user_id = v_user_id and scheduled_at::date = v_today) then
    perform public._grant_mooney(v_user_id, 4, 'social_registro:' || v_today, 'Registro en Actividades Sociales');
  end if;

  if exists (select 1 from public.expense_quick_logs where user_id = v_user_id and expense_date = v_today)
     or exists (select 1 from public.expense_detailed_logs where user_id = v_user_id and expense_date = v_today) then
    perform public._grant_mooney(v_user_id, 2, 'gastos_registro:' || v_today, 'Registro en Gastos');
  end if;

  if public._hygiene_day_complete(v_user_id, v_today) then
    perform public._grant_mooney(v_user_id, 8, 'higiene_completa:' || v_today, 'Checklist de Higiene al 100%');
  end if;

  if public._all_modules_touched(v_user_id, v_today) then
    perform public._grant_mooney(v_user_id, 10, 'dia_perfecto:' || v_today, 'Día completo: registro en los 7 módulos');
  end if;

  v_streak := public._hygiene_streak_length(v_user_id, v_today);
  if v_streak >= 7 then
    perform public._grant_mooney(
      v_user_id, 15, 'racha_higiene_7:' || (v_today - (v_streak - 1)),
      'Racha de 7 días con higiene al 100%'
    );
  end if;
  if v_streak >= 30 then
    perform public._grant_mooney(
      v_user_id, 50, 'racha_higiene_30:' || (v_today - (v_streak - 1)),
      'Racha de 30 días con higiene al 100%'
    );
  end if;

  return query
    select t.action_key, t.amount, t.reason
    from public.moo_ney_transactions t
    where t.user_id = v_user_id and t.created_at > now() - interval '5 seconds'
    order by t.created_at desc;
end;
$$;

-- Otorga MOOney por generar/compartir "Mi Resumen" — se llama desde el
-- cliente al confirmar un share o descarga de PDF exitosos. p_period_key
-- identifica el período mostrado (ej. 'weekly:2026-W36', 'monthly:2026-09',
-- 'yearly:2026') para que solo cuente una vez por período generado.
create or replace function public.grant_mooney_for_resumen(p_period_key text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tier text;
  v_balance integer;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;
  if p_period_key is null or length(trim(p_period_key)) = 0 then
    raise exception 'p_period_key requerido';
  end if;

  select premium_tier into v_tier from public.profiles where id = v_user_id;
  if v_tier is distinct from 'full' then
    return coalesce((select balance from public.moo_ney_balance where user_id = v_user_id), 0);
  end if;

  perform public._grant_mooney(
    v_user_id, 5, 'share_resumen:' || p_period_key, 'Compartiste tu Resumen'
  );

  select balance into v_balance from public.moo_ney_balance where user_id = v_user_id;
  return coalesce(v_balance, 0);
end;
$$;

-- ============================================================
-- 4. Gastar MOOney en la tienda de avatar
-- ============================================================

create or replace function public.spend_mooney(
  p_amount integer,
  p_reason text,
  p_metadata jsonb default '{}'::jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tier text;
  v_balance integer;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Monto inválido';
  end if;

  select premium_tier into v_tier from public.profiles where id = v_user_id;
  if v_tier is distinct from 'full' then
    raise exception 'La tienda de avatar es exclusiva del plan Full';
  end if;

  select balance into v_balance from public.moo_ney_balance where user_id = v_user_id for update;
  v_balance := coalesce(v_balance, 0);
  if v_balance < p_amount then
    raise exception 'MOOney insuficiente';
  end if;

  insert into public.moo_ney_transactions (user_id, amount, action_key, reason, metadata)
  values (v_user_id, -p_amount, 'shop_purchase:' || gen_random_uuid(), p_reason, p_metadata);

  insert into public.moo_ney_balance (user_id, balance)
  values (v_user_id, -p_amount)
  on conflict (user_id) do update
    set balance = public.moo_ney_balance.balance - p_amount,
        updated_at = now();

  select balance into v_balance from public.moo_ney_balance where user_id = v_user_id;
  return v_balance;
end;
$$;

-- Registra una pieza como desbloqueada tras un spend_mooney exitoso, y
-- deja seleccionada esa pieza en avatar_selections. Todo en una función para
-- que "pagar" + "desbloquear" + "equipar" sea atómico.
create or replace function public.purchase_avatar_piece(
  p_category text,
  p_piece_id text,
  p_cost integer
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_balance integer;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;
  if p_category not in ('cara', 'pelo', 'color_piel', 'accesorio') then
    raise exception 'Categoría inválida';
  end if;

  if exists (
    select 1 from public.avatar_unlocked_pieces
    where user_id = v_user_id and category = p_category and piece_id = p_piece_id
  ) then
    raise exception 'Ya tenés esta pieza desbloqueada';
  end if;

  v_balance := public.spend_mooney(
    p_cost, 'Pieza de avatar: ' || p_category || '/' || p_piece_id,
    jsonb_build_object('category', p_category, 'piece_id', p_piece_id)
  );

  insert into public.avatar_unlocked_pieces (user_id, category, piece_id)
  values (v_user_id, p_category, p_piece_id)
  on conflict do nothing;

  insert into public.avatar_selections (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  update public.avatar_selections
  set
    cara = case when p_category = 'cara' then p_piece_id else cara end,
    pelo = case when p_category = 'pelo' then p_piece_id else pelo end,
    color_piel = case when p_category = 'color_piel' then p_piece_id else color_piel end,
    accesorio = case when p_category = 'accesorio' then p_piece_id else accesorio end
  where user_id = v_user_id;

  return v_balance;
end;
$$;
