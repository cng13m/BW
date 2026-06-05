-- Run this in Supabase SQL Editor.
-- It fixes salon cover uploads by creating the missing Storage bucket
-- and policies for the app's path format: {salon_id}/cover.{ext}

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'salon-images',
  'salon-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view salon images" on storage.objects;
drop policy if exists "Salon owners can upload salon images" on storage.objects;
drop policy if exists "Salon owners can update salon images" on storage.objects;
drop policy if exists "Salon owners can delete salon images" on storage.objects;

create policy "Public can view salon images"
on storage.objects
for select
to public
using (bucket_id = 'salon-images');

create policy "Salon owners can upload salon images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'salon-images'
  and exists (
    select 1
    from public.salon_users su
    where su.user_id = auth.uid()
      and su.salon_id::text = (storage.foldername(name))[1]
  )
);

create policy "Salon owners can update salon images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'salon-images'
  and exists (
    select 1
    from public.salon_users su
    where su.user_id = auth.uid()
      and su.salon_id::text = (storage.foldername(name))[1]
  )
)
with check (
  bucket_id = 'salon-images'
  and exists (
    select 1
    from public.salon_users su
    where su.user_id = auth.uid()
      and su.salon_id::text = (storage.foldername(name))[1]
  )
);

create policy "Salon owners can delete salon images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'salon-images'
  and exists (
    select 1
    from public.salon_users su
    where su.user_id = auth.uid()
      and su.salon_id::text = (storage.foldername(name))[1]
  )
);
