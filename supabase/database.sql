-- Run this in Supabase SQL Editor if image uploads fail with:
-- "Could not find the 'image_url' column of 'salons' in the schema cache"

alter table public.salons
add column if not exists image_url text;

create index if not exists salons_city_idx on public.salons (city);
create index if not exists services_salon_id_idx on public.services (salon_id);
create index if not exists bookings_salon_id_idx on public.bookings (salon_id);
create index if not exists salon_users_user_id_idx on public.salon_users (user_id);
create index if not exists salon_users_salon_id_idx on public.salon_users (salon_id);

-- Ask PostgREST/Supabase API to reload its schema cache immediately.
notify pgrst, 'reload schema';
