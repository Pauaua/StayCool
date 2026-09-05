-- Agenda Cool — foto en peinados + presupuesto mensual de gastos.

-- ============================================================
-- 1. Foto en peinados (mismo patrón que outfit_logs/bucket 'outfits')
-- ============================================================

alter table public.hairstyle_logs
  add column photo_path text;

insert into storage.buckets (id, name, public)
values ('hairstyles', 'hairstyles', false)
on conflict (id) do nothing;

create policy "hairstyles_select_own"
  on storage.objects for select
  using (bucket_id = 'hairstyles' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "hairstyles_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'hairstyles' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "hairstyles_update_own"
  on storage.objects for update
  using (bucket_id = 'hairstyles' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "hairstyles_delete_own"
  on storage.objects for delete
  using (bucket_id = 'hairstyles' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 2. Presupuesto mensual de gastos
-- ============================================================
-- Se descuenta automáticamente del total gastado en el mes (calculado en la
-- Edge Function gastos-resumen); por eso ya no hace falta preguntar "con
-- cuánto quedaste" en cada gasto grande — remaining_balance queda como
-- columna histórica para los registros viejos, pero deja de pedirse.

alter table public.profiles
  add column monthly_budget numeric(12,2);
