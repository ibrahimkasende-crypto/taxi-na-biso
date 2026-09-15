-- Onboarding web chauffeur : véhicule en attente + bucket Storage privé.
-- Pas de tables web_* : mêmes vehicles / driver_documents que Rider et Driver.

create policy vehicles_driver_insert on public.vehicles
  for insert to authenticated
  with check (
    public.auth_role() = 'driver'
    and default_driver_id = auth.uid()
    and status = 'pending'
  );

create trigger trg_set_operator_id_vehicles
  before insert on public.vehicles
  for each row execute function public.set_operator_id();

create trigger trg_set_operator_id_driver_documents
  before insert on public.driver_documents
  for each row execute function public.set_operator_id();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'driver-documents',
  'driver-documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy driver_documents_storage_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'driver-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_staff()
    )
  );

create policy driver_documents_storage_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'driver-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy driver_documents_storage_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'driver-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'driver-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy driver_documents_storage_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'driver-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
