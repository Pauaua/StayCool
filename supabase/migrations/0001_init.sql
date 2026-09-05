-- Agenda Cool — esquema inicial completo
-- Diseñado para multi-tenancy limpio: toda tabla de datos de usuario tiene
-- user_id -> auth.users(id), RLS estricto ("solo el dueño ve/edita"),
-- timestamps created_at/updated_at, e índices sobre (user_id, fecha) para
-- que el historial escale bien con muchos usuarios y muchos registros/usuario.

-- ============================================================
-- 0. Utilidades comunes
-- ============================================================

create extension if not exists "pgcrypto";

-- Mantiene updated_at siempre correcto sin depender del cliente.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Perfil público de usuario (1:1 con auth.users). Todo lo que la app
-- necesita mostrar de "quién es" sin tocar auth.users directamente.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  makeup_reminder_enabled boolean not null default false,
  makeup_reminder_time time not null default '22:00',
  hygiene_reminder_enabled boolean not null default true,
  hygiene_reminder_time time not null default '21:30',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Crea el profile automáticamente cuando se registra un usuario nuevo.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper genérico: aplica el patrón estándar de RLS "solo dueño" a una tabla
-- que tenga columna user_id. Se invoca explícitamente por tabla más abajo
-- (Postgres no permite macros, así que repetimos el patrón a propósito
-- para que cada política quede explícita y auditable).

-- ============================================================
-- 1. BIENESTAR
-- ============================================================

create table public.wellness_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  eaten_at timestamptz not null default now(),
  meal_date date not null default (now() at time zone 'utc')::date,
  category text check (category in ('desayuno','almuerzo','cena','snack')),
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_wellness_meals_user_date on public.wellness_meals (user_id, meal_date desc);
create trigger trg_wellness_meals_updated_at before update on public.wellness_meals
  for each row execute function public.set_updated_at();
alter table public.wellness_meals enable row level security;
create policy "wellness_meals_all_own" on public.wellness_meals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.wellness_sleep (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sleep_date date not null default (now() at time zone 'utc')::date,
  slept_at timestamptz not null,
  woke_at timestamptz not null,
  duration_minutes integer generated always as (
    greatest(0, extract(epoch from (woke_at - slept_at)) / 60)::integer
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wellness_sleep_valid_range check (woke_at > slept_at)
);
create index idx_wellness_sleep_user_date on public.wellness_sleep (user_id, sleep_date desc);
create trigger trg_wellness_sleep_updated_at before update on public.wellness_sleep
  for each row execute function public.set_updated_at();
alter table public.wellness_sleep enable row level security;
create policy "wellness_sleep_all_own" on public.wellness_sleep
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.wellness_exercise (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_date date not null default (now() at time zone 'utc')::date,
  exercise_type text not null,
  duration_minutes integer check (duration_minutes >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_wellness_exercise_user_date on public.wellness_exercise (user_id, exercise_date desc);
create trigger trg_wellness_exercise_updated_at before update on public.wellness_exercise
  for each row execute function public.set_updated_at();
alter table public.wellness_exercise enable row level security;
create policy "wellness_exercise_all_own" on public.wellness_exercise
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.wellness_mood (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood_date date not null default (now() at time zone 'utc')::date,
  mood text not null check (mood in ('genial','bien','neutral','mal','agotado')),
  energy_level smallint check (energy_level between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mood_date)
);
create index idx_wellness_mood_user_date on public.wellness_mood (user_id, mood_date desc);
create trigger trg_wellness_mood_updated_at before update on public.wellness_mood
  for each row execute function public.set_updated_at();
alter table public.wellness_mood enable row level security;
create policy "wellness_mood_all_own" on public.wellness_mood
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 2. IMAGEN (closet log)
-- ============================================================

create table public.outfit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  outfit_date date not null default (now() at time zone 'utc')::date,
  description text,
  photo_path text, -- ruta dentro del bucket 'outfits', servida vía CDN de Storage
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, outfit_date)
);
create index idx_outfit_logs_user_date on public.outfit_logs (user_id, outfit_date desc);
create trigger trg_outfit_logs_updated_at before update on public.outfit_logs
  for each row execute function public.set_updated_at();
alter table public.outfit_logs enable row level security;
create policy "outfit_logs_all_own" on public.outfit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 3. CARA (peinados + maquillaje)
-- ============================================================

create table public.face_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  face_date date not null default (now() at time zone 'utc')::date,
  hairstyle text,
  wore_makeup boolean not null default false,
  removed_makeup boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, face_date)
);
create index idx_face_logs_user_date on public.face_logs (user_id, face_date desc);
create trigger trg_face_logs_updated_at before update on public.face_logs
  for each row execute function public.set_updated_at();
alter table public.face_logs enable row level security;
create policy "face_logs_all_own" on public.face_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 4. HIGIENE (checklist configurable + cumplimiento diario)
-- ============================================================

-- Ítems del checklist definidos por el usuario (ducha, hilo dental, etc).
create table public.hygiene_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_hygiene_items_user on public.hygiene_items (user_id, is_active, sort_order);
create trigger trg_hygiene_items_updated_at before update on public.hygiene_items
  for each row execute function public.set_updated_at();
alter table public.hygiene_items enable row level security;
create policy "hygiene_items_all_own" on public.hygiene_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Marca de cumplimiento por ítem y día. Una fila por (item, día).
create table public.hygiene_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hygiene_item_id uuid not null references public.hygiene_items(id) on delete cascade,
  log_date date not null default (now() at time zone 'utc')::date,
  completed boolean not null default true,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, hygiene_item_id, log_date)
);
create index idx_hygiene_logs_user_date on public.hygiene_logs (user_id, log_date desc);
create index idx_hygiene_logs_item on public.hygiene_logs (hygiene_item_id);
create trigger trg_hygiene_logs_updated_at before update on public.hygiene_logs
  for each row execute function public.set_updated_at();
alter table public.hygiene_logs enable row level security;
create policy "hygiene_logs_all_own" on public.hygiene_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 5. PELO
-- ============================================================

create table public.hair_wash_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  washed_at timestamptz not null default now(),
  wash_date date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_hair_wash_logs_user_date on public.hair_wash_logs (user_id, wash_date desc);
create trigger trg_hair_wash_logs_updated_at before update on public.hair_wash_logs
  for each row execute function public.set_updated_at();
alter table public.hair_wash_logs enable row level security;
create policy "hair_wash_logs_all_own" on public.hair_wash_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.hairstyle_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  style_date date not null default (now() at time zone 'utc')::date,
  hairstyle text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_hairstyle_logs_user_date on public.hairstyle_logs (user_id, style_date desc);
create trigger trg_hairstyle_logs_updated_at before update on public.hairstyle_logs
  for each row execute function public.set_updated_at();
alter table public.hairstyle_logs enable row level security;
create policy "hairstyle_logs_all_own" on public.hairstyle_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 6. ACTIVIDADES SOCIALES
-- ============================================================

create table public.social_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('laboral','amistosa','casual','familiar','cita','otro')),
  title text,
  companions text,
  activity_description text,
  scheduled_at timestamptz not null,
  is_past boolean not null default false,
  feeling text check (feeling in ('genial','bien','neutral','mal','agotado')),
  next_activity_id uuid references public.social_activities(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_social_activities_user_date on public.social_activities (user_id, scheduled_at desc);
create trigger trg_social_activities_updated_at before update on public.social_activities
  for each row execute function public.set_updated_at();
alter table public.social_activities enable row level security;
create policy "social_activities_all_own" on public.social_activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 7. GASTOS
-- ============================================================

create table public.expense_quick_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_date date not null default (now() at time zone 'utc')::date,
  name text not null,
  expense_type text not null,
  description text,
  amount numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_expense_quick_logs_user_date on public.expense_quick_logs (user_id, expense_date desc);
create trigger trg_expense_quick_logs_updated_at before update on public.expense_quick_logs
  for each row execute function public.set_updated_at();
alter table public.expense_quick_logs enable row level security;
create policy "expense_quick_logs_all_own" on public.expense_quick_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.expense_detailed_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_date date not null default (now() at time zone 'utc')::date,
  item_purchased text not null,
  purpose text,
  amount numeric(12,2) not null check (amount >= 0),
  expense_kind text not null check (expense_kind in ('fijo','extra','hormiga','innecesario')),
  could_wait boolean not null default false,
  remaining_balance numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_expense_detailed_logs_user_date on public.expense_detailed_logs (user_id, expense_date desc);
create trigger trg_expense_detailed_logs_updated_at before update on public.expense_detailed_logs
  for each row execute function public.set_updated_at();
alter table public.expense_detailed_logs enable row level security;
create policy "expense_detailed_logs_all_own" on public.expense_detailed_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 8. Rate limiting para Edge Functions sensibles
-- ============================================================

create table public.function_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  function_name text not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  primary key (user_id, function_name, window_start)
);
create index idx_function_rate_limits_lookup on public.function_rate_limits (user_id, function_name, window_start desc);
alter table public.function_rate_limits enable row level security;
-- Solo las Edge Functions (con la service role key) leen/escriben esta tabla.
create policy "function_rate_limits_service_only" on public.function_rate_limits
  for all using (false) with check (false);

-- ============================================================
-- 9. Storage: bucket privado para fotos de outfits (Imagen)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('outfits', 'outfits', false)
on conflict (id) do nothing;

-- Cada usuario solo puede leer/escribir dentro de su propia carpeta
-- outfits/<user_id>/... El path se construye del lado del cliente.
create policy "outfits_select_own"
  on storage.objects for select
  using (bucket_id = 'outfits' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "outfits_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'outfits' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "outfits_update_own"
  on storage.objects for update
  using (bucket_id = 'outfits' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "outfits_delete_own"
  on storage.objects for delete
  using (bucket_id = 'outfits' and (storage.foldername(name))[1] = auth.uid()::text);
