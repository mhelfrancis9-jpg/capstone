-- =============================================================================
-- LnR Cycle Center — Customer accounts + saved locations
--
-- Apply order: 0001 -> 0002 -> 0003 -> 0004 -> 0005 -> 0006
--
-- Adds the customer-side account system on top of the existing admin schema:
--   * Links the admin-managed `customers` directory to Supabase Auth
--     (customers.auth_user_id) so self-service signups map 1:1 to an
--     authenticated user.
--   * Introduces `customer_locations` (latitude/longitude/address/label) that
--     powers checkout delivery details and later map / delivery features.
--   * Snapshots the delivery coordinates onto each order so history stays
--     intact even if the customer edits their saved location later.
--   * Adds Row Level Security policies so an authenticated customer can only
--     ever read/update their OWN customer row, locations and orders.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Link customers to Supabase Auth
-- -----------------------------------------------------------------------------
alter table public.customers
  add column if not exists auth_user_id uuid references auth.users (id) on delete cascade;

-- At most one customer directory row per auth account.
create unique index if not exists customers_auth_user_id_idx
  on public.customers (auth_user_id)
  where auth_user_id is not null;

-- -----------------------------------------------------------------------------
-- Customer saved locations (checkout + future delivery / map features)
-- -----------------------------------------------------------------------------
create table if not exists public.customer_locations (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  label       text,
  address     text not null,
  latitude    double precision not null,
  longitude   double precision not null,
  is_default  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists customer_locations_customer_id_idx
  on public.customer_locations (customer_id, created_at desc);

-- The storefront manages a single "saved location" per customer for now;
-- the partial unique index keeps that guarantee at the database level.
create unique index if not exists customer_locations_one_default_idx
  on public.customer_locations (customer_id)
  where is_default;

-- -----------------------------------------------------------------------------
-- Orders — snapshot delivery coordinates (matches the shipping_address pattern)
-- -----------------------------------------------------------------------------
alter table public.orders
  add column if not exists shipping_latitude double precision,
  add column if not exists shipping_longitude double precision;

-- -----------------------------------------------------------------------------
-- Updated-at trigger for customer_locations
-- -----------------------------------------------------------------------------
drop trigger if exists customer_locations_set_updated_at on public.customer_locations;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.customer_locations enable row level security;

-- Customers — authenticated users manage only their own linked row.
-- (Admin service-role writes bypass RLS; the anon client can never touch
--  anyone else's row.)
drop policy if exists "customers_select_own" on public.customers;
create policy "customers_select_own"
  on public.customers for select
  to authenticated
  using (auth.uid() = auth_user_id);

drop policy if exists "customers_insert_own" on public.customers;
create policy "customers_insert_own"
  on public.customers for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

drop policy if exists "customers_update_own" on public.customers;
create policy "customers_update_own"
  on public.customers for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

create trigger customer_locations_set_updated_at
  before update on public.customer_locations
  for each row execute function public.set_updated_at();

-- Customer locations — own-row access through the linked customer.
drop policy if exists "customer_locations_select_own" on public.customer_locations;
create policy "customer_locations_select_own"
  on public.customer_locations for select
  to authenticated
  using (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ));

drop policy if exists "customer_locations_insert_own" on public.customer_locations;
create policy "customer_locations_insert_own"
  on public.customer_locations for insert
  to authenticated
  with check (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ));

drop policy if exists "customer_locations_update_own" on public.customer_locations;
create policy "customer_locations_update_own"
  on public.customer_locations for update
  to authenticated
  using (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ))
  with check (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ));

drop policy if exists "customer_locations_delete_own" on public.customer_locations;
create policy "customer_locations_delete_own"
  on public.customer_locations for delete
  to authenticated
  using (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ));

-- Orders / items / status history — authenticated customers can read only
-- the orders linked to their own customer row. Writes stay service-role only.
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ));

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own"
  on public.order_items for select
  to authenticated
  using (order_id in (
    select id from public.orders
    where customer_id in (
      select id from public.customers where auth_user_id = auth.uid()
    )
  ));

drop policy if exists "order_status_history_select_own" on public.order_status_history;
create policy "order_status_history_select_own"
  on public.order_status_history for select
  to authenticated
  using (order_id in (
    select id from public.orders
    where customer_id in (
      select id from public.customers where auth_user_id = auth.uid()
    )
  ));
