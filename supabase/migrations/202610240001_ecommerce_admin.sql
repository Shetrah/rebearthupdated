-- Rebearth Solutions: ecommerce, admin, POS, content management and storage.
-- Run this in Supabase SQL Editor before using the admin portal.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  address text not null default '',
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, address)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), coalesce(new.raw_user_meta_data->>'phone',''), coalesce(new.raw_user_meta_data->>'address',''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_rebearth on auth.users;
create trigger on_auth_user_created_rebearth after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(12,2) not null default 0 check (price >= 0),
  image_url text not null default '',
  category text not null default 'General',
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  user_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  customer_name text not null default 'Customer',
  customer_email text,
  customer_phone text,
  customer_address text,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  status text not null default 'pending' check (status in ('pending','processing','paid','fulfilled','cancelled','completed','new')),
  payment_status text not null default 'pending',
  payment_method text,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_user_id_idx on public.orders(user_id);

create table if not exists public.site_content (
  key text primary key,
  label text not null default '',
  value text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- Seed editable homepage fields with the website's existing copy and carousel images.
insert into public.site_content (key,label,value) values
('hero_title','Homepage hero title','WELCOME TO REBEARTH'),
('hero_accent','Homepage hero accent','SOLUTIONS'),
('hero_subtitle','Homepage hero description','Rebearth Solutions Limited drives sustainability in agriculture, blending innovation with eco-conscious solutions to secure a productive and resilient future.'),
('hero_images','Homepage hero images (JSON array of image URLs)','[\"https://images.pexels.com/photos/32585657/pexels-photo-32585657.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load\",\"https://images.pexels.com/photos/32585788/pexels-photo-32585788.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load\",\"https://images.pexels.com/photos/32585762/pexels-photo-32585762.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load\",\"https://images.pexels.com/photos/32585828/pexels-photo-32585828.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load\",\"https://images.pexels.com/photos/32585813/pexels-photo-32585813.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load\"]')
on conflict (key) do nothing;

-- Keep the existing invoice/payment integration supported.
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(), invoice_number text not null unique,
  customer_name text not null, customer_email text not null default '', customer_phone text not null default '', customer_address text not null default '',
  items jsonb not null default '[]'::jsonb, total_amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  user_id uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), invoice_id text not null,
  transaction_id text not null default '', mpesa_receipt_number text not null default '', phone_number text not null default '',
  amount numeric(12,2) not null default 0, status text not null default 'pending' check (status in ('pending','completed','failed')),
  user_id uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.site_content enable row level security;
alter table public.invoices add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.payments add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

drop policy if exists "profile read self or admin" on public.profiles;
create policy "profile read self or admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "profile update self or admin" on public.profiles;
create policy "profile update self or admin" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
drop policy if exists "profile insert self" on public.profiles;
create policy "profile insert self" on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "products public read active" on public.products;
create policy "products public read active" on public.products for select to anon, authenticated using (active = true or public.is_admin());
drop policy if exists "products admin manage" on public.products;
create policy "products admin manage" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders customer create" on public.orders;
create policy "orders customer create" on public.orders for insert to authenticated with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders customer read own or admin" on public.orders;
create policy "orders customer read own or admin" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders admin manage" on public.orders;
create policy "orders admin manage" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "site content public read" on public.site_content;
create policy "site content public read" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "site content admin manage" on public.site_content;
create policy "site content admin manage" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "invoices owner or admin read" on public.invoices;
create policy "invoices owner or admin read" on public.invoices for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "invoices authenticated create" on public.invoices;
create policy "invoices authenticated create" on public.invoices for insert to authenticated with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "invoices admin manage" on public.invoices;
create policy "invoices admin manage" on public.invoices for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "payments admin manage" on public.payments;
create policy "payments admin manage" on public.payments for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "payments owner insert" on public.payments;
create policy "payments owner insert" on public.payments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "payments owner read" on public.payments;
create policy "payments owner read" on public.payments for select to authenticated using (user_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media','site-media',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 10485760;
drop policy if exists "site media public read" on storage.objects;
create policy "site media public read" on storage.objects for select to anon, authenticated using (bucket_id = 'site-media');
drop policy if exists "site media admin upload" on storage.objects;
create policy "site media admin upload" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and public.is_admin());
drop policy if exists "site media admin update" on storage.objects;
create policy "site media admin update" on storage.objects for update to authenticated using (bucket_id = 'site-media' and public.is_admin()) with check (bucket_id = 'site-media' and public.is_admin());
drop policy if exists "site media admin delete" on storage.objects;
create policy "site media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and public.is_admin());

-- After creating your own account, promote that account securely in SQL Editor:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');

-- Prevent a customer from granting themselves admin privileges through profile updates.
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an administrator can change account roles';
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_role_trigger on public.profiles;
create trigger protect_profile_role_trigger before update on public.profiles for each row execute procedure public.protect_profile_role();
