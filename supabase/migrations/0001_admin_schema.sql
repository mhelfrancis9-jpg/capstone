-- =============================================================================
-- LnR Cycle Center — Admin system schema (part 1 of 3)
--
-- Apply order: 0001 -> 0002 -> 0003 in the Supabase SQL editor
-- (Dashboard -> SQL Editor) or with the Supabase CLI:
--   supabase db push
--
-- Tables: categories, products, product_images, product_variants,
--         customers, orders, order_items, order_status_history
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------

-- Sets updated_at on UPDATE (attached to every tracked table below).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Human-friendly URL slug from a product/category name.
create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(trim(coalesce(value, '')), '[^a-zA-Z0-9]+', '-', 'g'),
        '-{2,}', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
  );
$$;

-- -----------------------------------------------------------------------------
-- Categories
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists categories_sort_order_idx
  on public.categories (sort_order, name);

-- -----------------------------------------------------------------------------
-- Products
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid references public.categories (id) on delete restrict,
  name             text not null,
  slug             text not null unique,
  sku              text unique,
  description      text,
  tagline          text[] not null default '{}',
  specs            text[] not null default '{}',
  price            numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price >= 0),
  cost             numeric(12,2) check (cost >= 0),
  stock            integer not null default 0 check (stock >= 0),
  status           text not null default 'active'
                   check (status in ('draft', 'active', 'inactive', 'archived')),
  is_featured      boolean not null default false,
  is_new_arrival   boolean not null default false,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists products_category_id_idx
  on public.products (category_id);
create index if not exists products_status_idx
  on public.products (status);
create index if not exists products_price_idx
  on public.products (price);
create index if not exists products_created_at_idx
  on public.products (created_at desc);
create index if not exists products_is_new_arrival_idx
  on public.products (is_new_arrival) where is_new_arrival;
create index if not exists products_is_featured_idx
  on public.products (is_featured) where is_featured;

-- Full-text search over name / description / taglines (drives storefront
-- search). This is a plain column kept up to date by a trigger. PostgreSQL
-- requires every function used in a generated column OR a functional index
-- expression to be IMMUTABLE, and text-search functions like to_tsvector()
-- are not — that is what raised "42P17: generation expression is not
-- immutable" and then "42P17: functions in index expression must be marked
-- IMMUTABLE". A trigger runs at write time (non-immutable functions are
-- fine there) and the GIN index below sits on the plain stored column.
alter table public.products
  add column if not exists search_vector tsvector;

-- Keeps search_vector in sync on every INSERT / UPDATE of a product.
create or replace function public.products_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
      setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(array_to_string(new.tagline, ' '), '')), 'C');
  return new;
end;
$$;

drop trigger if exists products_search_vector_trg on public.products;
create trigger products_search_vector_trg
  before insert or update on public.products
  for each row execute function public.products_search_vector_update();

-- Backfill rows that already exist (new writes are covered by the trigger).
update public.products
  set search_vector =
      setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(array_to_string(tagline, ' '), '')), 'C');

create index if not exists products_search_vector_idx
  on public.products using gin (search_vector);

-- -----------------------------------------------------------------------------
-- Product images (public URLs served from the `images` storage bucket)
-- -----------------------------------------------------------------------------
create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,
  alt        text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx
  on public.product_images (product_id, sort_order);

-- At most one primary (thumbnail) image per product.
create unique index if not exists product_images_one_primary_idx
  on public.product_images (product_id) where is_primary;

-- -----------------------------------------------------------------------------
-- Product variants (size / color / SKU / per-variant price & stock)
-- -----------------------------------------------------------------------------
create table if not exists public.product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku        text unique,
  name       text,
  size       text,
  color      text,
  price      numeric(12,2) not null check (price >= 0),
  stock      integer not null default 0 check (stock >= 0),
  available  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id, sort_order);


-- -----------------------------------------------------------------------------
-- Customers — admin-managed directory (walk-in + online buyers). Kept
-- independent of auth.users so the shop can track buyers without accounts.
-- -----------------------------------------------------------------------------
create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  email      text unique,
  phone      text,
  address    text,
  notes      text,
  status     text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_email_idx
  on public.customers (email);
create index if not exists customers_name_idx
  on public.customers (lower(full_name));

-- -----------------------------------------------------------------------------
-- Orders — customer + payment fields are snapshotted so history stays intact
-- even if the linked customer/product rows are later edited or removed.
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique,
  customer_id       uuid references public.customers (id) on delete set null,
  customer_name     text not null,
  customer_email    text,
  customer_phone    text,
  shipping_address  text,
  subtotal          numeric(12,2) not null check (subtotal >= 0),
  shipping_fee      numeric(12,2) not null default 0 check (shipping_fee >= 0),
  discount          numeric(12,2) not null default 0 check (discount >= 0),
  total             numeric(12,2) not null check (total >= 0),
  payment_method    text not null check (payment_method in ('gcash', 'cod')),
  payment_status    text not null default 'pending'
                    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  status            text not null default 'pending'
                    check (status in ('pending', 'shipping', 'completed', 'cancelled')),
  payment_reference text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_customer_id_idx
  on public.orders (customer_id);
create index if not exists orders_status_idx
  on public.orders (status);
create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

-- -----------------------------------------------------------------------------
-- Order items — line-level snapshot of what was purchased.
-- -----------------------------------------------------------------------------
create table if not exists public.order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references public.orders (id) on delete cascade,
  product_id         uuid references public.products (id) on delete set null,
  product_variant_id uuid references public.product_variants (id) on delete set null,
  product_name       text not null,
  size               text,
  color              text,
  unit_price         numeric(12,2) not null check (unit_price >= 0),
  quantity           integer not null check (quantity > 0),
  line_total         numeric(12,2) not null check (line_total >= 0)
);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);
create index if not exists order_items_product_id_idx
  on public.order_items (product_id);

-- -----------------------------------------------------------------------------
-- Order status history — audit trail of every status change.
-- -----------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  status     text not null,
  note       text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_id_idx
  on public.order_status_history (order_id, created_at);

-- -----------------------------------------------------------------------------
-- Updated-at triggers
-- -----------------------------------------------------------------------------
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

