-- Productos que la usuaria usa en el rostro, separados en dos categorías:
-- limpieza facial (skincare) y maquillaje. Es un registro informativo (no
-- un log diario como face_logs), con precio y puntuación para poder comparar
-- productos con el tiempo.

create table public.face_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('limpieza_facial', 'maquillaje')),
  name text not null,
  brand text,
  price numeric(10,2) check (price >= 0),
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_face_products_user_category on public.face_products (user_id, category, created_at desc);
create trigger trg_face_products_updated_at before update on public.face_products
  for each row execute function public.set_updated_at();
alter table public.face_products enable row level security;
create policy "face_products_all_own" on public.face_products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
