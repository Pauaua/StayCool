-- Agenda Cool — módulos Gustos y Notas
-- Mismo patrón que 0001_init.sql: user_id -> auth.users, RLS "solo dueño",
-- timestamps, e índices sobre (user_id, fecha) para historial paginado.

-- ============================================================
-- GUSTOS
-- ============================================================

-- Registro rápido: para cosas random que te gustan, sin categorizar.
create table public.taste_quick_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  logged_date date not null default (now() at time zone 'utc')::date,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_taste_quick_logs_user_date on public.taste_quick_logs (user_id, logged_date desc);
create trigger trg_taste_quick_logs_updated_at before update on public.taste_quick_logs
  for each row execute function public.set_updated_at();
alter table public.taste_quick_logs enable row level security;
create policy "taste_quick_logs_all_own" on public.taste_quick_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Registro detallado: música, series, películas, libros. Los campos varían
-- bastante según la categoría (bandas/instrumentos para música, autor para
-- libros, director para películas, etc), así que los campos comunes quedan
-- como columnas y los específicos de cada categoría van en `details` (jsonb)
-- para no tener que migrar el esquema cada vez que se agregue un campo nuevo.
create table public.taste_detailed_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  logged_date date not null default (now() at time zone 'utc')::date,
  category text not null check (category in ('musica','serie','pelicula','libro','otro')),
  name text not null,
  genre text,
  notes text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_taste_detailed_logs_user_date on public.taste_detailed_logs (user_id, logged_date desc);
create index idx_taste_detailed_logs_user_category on public.taste_detailed_logs (user_id, category);
create trigger trg_taste_detailed_logs_updated_at before update on public.taste_detailed_logs
  for each row execute function public.set_updated_at();
alter table public.taste_detailed_logs enable row level security;
create policy "taste_detailed_logs_all_own" on public.taste_detailed_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- NOTAS (registro de ideas)
-- ============================================================

-- Registro rápido: nombre + descripción + cómo te sentiste con la idea.
create table public.note_quick_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  logged_date date not null default (now() at time zone 'utc')::date,
  name text not null,
  description text,
  feeling text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_note_quick_logs_user_date on public.note_quick_logs (user_id, logged_date desc);
create trigger trg_note_quick_logs_updated_at before update on public.note_quick_logs
  for each row execute function public.set_updated_at();
alter table public.note_quick_logs enable row level security;
create policy "note_quick_logs_all_own" on public.note_quick_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Registro detallado: contexto completo de la idea (dónde surgió, qué
-- pensabas, cómo te sentías).
create table public.note_detailed_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  logged_date date not null default (now() at time zone 'utc')::date,
  name text not null,
  location text,
  idea text not null,
  feelings text,
  thoughts text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_note_detailed_logs_user_date on public.note_detailed_logs (user_id, logged_date desc);
create trigger trg_note_detailed_logs_updated_at before update on public.note_detailed_logs
  for each row execute function public.set_updated_at();
alter table public.note_detailed_logs enable row level security;
create policy "note_detailed_logs_all_own" on public.note_detailed_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
