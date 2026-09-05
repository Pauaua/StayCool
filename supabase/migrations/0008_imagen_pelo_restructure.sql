-- Reestructuración: Cara (solo maquillaje) y Vestuario pasan a vivir bajo el
-- módulo Imagen junto con Zapatos (nuevo, mismo patrón que outfit_logs). El
-- campo "hairstyle" de face_logs se elimina porque el peinado del día ya
-- vive en hairstyle_logs (módulo Pelo) — mantenerlo en los dos lados era
-- data duplicada. Pelo suma un perfil de cabello (características,
-- productos, teñido) de fila única por usuario, editable.

alter table public.face_logs drop column if exists hairstyle;

create table public.shoe_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shoe_date date not null default (now() at time zone 'utc')::date,
  description text,
  photo_path text, -- ruta dentro del bucket 'shoes'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, shoe_date)
);
create index idx_shoe_logs_user_date on public.shoe_logs (user_id, shoe_date desc);
create trigger trg_shoe_logs_updated_at before update on public.shoe_logs
  for each row execute function public.set_updated_at();
alter table public.shoe_logs enable row level security;
create policy "shoe_logs_all_own" on public.shoe_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('shoes', 'shoes', false)
on conflict (id) do nothing;

create policy "shoes_select_own"
  on storage.objects for select
  using (bucket_id = 'shoes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "shoes_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'shoes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "shoes_update_own"
  on storage.objects for update
  using (bucket_id = 'shoes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "shoes_delete_own"
  on storage.objects for delete
  using (bucket_id = 'shoes' and (storage.foldername(name))[1] = auth.uid()::text);

-- Perfil de cabello: fila única por usuario, se edita cuando cambia algo (no
-- es un log diario como el resto de los módulos).
create table public.hair_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hair_characteristics text,
  uses_products boolean not null default false,
  products_used text,
  is_dyed boolean not null default false,
  dye_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_hair_profile_updated_at before update on public.hair_profile
  for each row execute function public.set_updated_at();
alter table public.hair_profile enable row level security;
create policy "hair_profile_all_own" on public.hair_profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
