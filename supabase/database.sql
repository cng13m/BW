-- Run this in Supabase SQL Editor if image uploads fail with:
-- "Could not find the 'image_url' column of 'salons' in the schema cache"

alter table public.salons
add column if not exists image_url text;

create index if not exists salons_city_idx on public.salons (city);
create index if not exists services_salon_id_idx on public.services (salon_id);
create index if not exists bookings_salon_id_idx on public.bookings (salon_id);
create index if not exists salon_users_user_id_idx on public.salon_users (user_id);
create index if not exists salon_users_salon_id_idx on public.salon_users (salon_id);

alter table public.salons enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.salon_users enable row level security;

drop policy if exists "Public can view salons" on public.salons;
drop policy if exists "Authenticated users can create salons" on public.salons;
drop policy if exists "Salon owners can update salons" on public.salons;

create policy "Public can view salons"
on public.salons
for select
to public
using (true);

create policy "Authenticated users can create salons"
on public.salons
for insert
to authenticated
with check (true);

create policy "Salon owners can update salons"
on public.salons
for update
to authenticated
using (
  exists (
    select 1
    from public.salon_users su
    where su.salon_id = salons.id
      and su.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.salon_users su
    where su.salon_id = salons.id
      and su.user_id = auth.uid()
  )
);

drop policy if exists "Public can view services" on public.services;
drop policy if exists "Salon owners can create services" on public.services;
drop policy if exists "Salon owners can update services" on public.services;
drop policy if exists "Salon owners can delete services" on public.services;

create policy "Public can view services"
on public.services
for select
to public
using (true);

create policy "Salon owners can create services"
on public.services
for insert
to authenticated
with check (
  exists (
    select 1
    from public.salon_users su
    where su.salon_id = services.salon_id
      and su.user_id = auth.uid()
  )
);

create policy "Salon owners can update services"
on public.services
for update
to authenticated
using (
  exists (
    select 1
    from public.salon_users su
    where su.salon_id = services.salon_id
      and su.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.salon_users su
    where su.salon_id = services.salon_id
      and su.user_id = auth.uid()
  )
);

create policy "Salon owners can delete services"
on public.services
for delete
to authenticated
using (
  exists (
    select 1
    from public.salon_users su
    where su.salon_id = services.salon_id
      and su.user_id = auth.uid()
  )
);

drop policy if exists "Public can create bookings" on public.bookings;
drop policy if exists "Salon owners can view bookings" on public.bookings;
drop policy if exists "Salon owners can update bookings" on public.bookings;

create policy "Public can create bookings"
on public.bookings
for insert
to public
with check (true);

create policy "Salon owners can view bookings"
on public.bookings
for select
to authenticated
using (
  exists (
    select 1
    from public.salon_users su
    where su.salon_id = bookings.salon_id
      and su.user_id = auth.uid()
  )
);

create policy "Salon owners can update bookings"
on public.bookings
for update
to authenticated
using (
  exists (
    select 1
    from public.salon_users su
    where su.salon_id = bookings.salon_id
      and su.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.salon_users su
    where su.salon_id = bookings.salon_id
      and su.user_id = auth.uid()
  )
);

drop policy if exists "Users can view own salon links" on public.salon_users;
drop policy if exists "Users can create own salon links" on public.salon_users;

create policy "Users can view own salon links"
on public.salon_users
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create own salon links"
on public.salon_users
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.salons s
    where s.id = salon_users.salon_id
      and lower(s.email) = lower(auth.jwt() ->> 'email')
  )
);

-- Ask PostgREST/Supabase API to reload its schema cache immediately.
notify pgrst, 'reload schema';
