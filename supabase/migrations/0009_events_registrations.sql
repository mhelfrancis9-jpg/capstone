-- =============================================================================
-- LnR Cycle Center — Cycling events + event registrations (GCash-backed)
--
-- Apply order: 0001 -> 0002 -> ... -> 0008 -> 0009
--
-- Adds a customer-facing event program and a registration flow that mirrors
-- the existing GCash order payment:
--   * `events` holds published cycling events (fun rides, races, etc.).
--     Storefront reads are public but restricted to `status = 'published'`
--     through RLS, exactly like products.
--   * `event_registrations` is the customer's sign-up for an event. It stores
--     the rider details, the admin-configured GCash payment proof (screenshot
--     URL + review state) and a human-friendly registration code. One
--     registration per (event, customer) to keep the slot count honest.
--   * Registrations are written with the service-role client only; customers
--     may read ONLY their own rows (RLS joins through their customer row,
--     like gcash_payments).
--   * Event banners reuse the existing public `images` storage bucket (its
--     read/upload policies already exist in migration 0002).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Events
-- -----------------------------------------------------------------------------
create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  event_code       text not null unique,
  slug             text not null unique,
  title            text not null,
  category         text not null default 'Fun Ride',
  description      text,
  event_date       timestamptz not null,
  end_date         timestamptz,
  location         text not null,
  banner_image_url text,
  price            numeric(10, 2) not null default 0,
  capacity         integer not null default 0,
  slots_booked     integer not null default 0,
  organizer        text,
  status           text not null default 'draft'
                   check (status in ('draft', 'published', 'cancelled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists events_event_date_idx on public.events (event_date);
create index if not exists events_status_idx on public.events (status);

-- -----------------------------------------------------------------------------
-- Event registrations
-- -----------------------------------------------------------------------------
create table if not exists public.event_registrations (
  id                  uuid primary key default gen_random_uuid(),
  registration_code   text not null unique,
  event_id            uuid not null references public.events (id) on delete cascade,
  customer_id         uuid not null references public.customers (id) on delete cascade,
  customer_name       text not null,
  customer_email      text,
  customer_phone      text,
  rider_name          text not null,
  plate_number        text,
  category            text,
  amount_paid         numeric(10, 2) not null default 0,
  payment_method      text not null default 'gcash'
                      check (payment_method in ('gcash', 'cod')),
  payment_status      text not null default 'pending'
                      check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'rejected')),
  status              text not null default 'registered'
                      check (status in ('registered', 'cancelled')),
  proof_screenshot_url text,
  rejection_reason    text,
  reviewed_at         timestamptz,
  reviewed_by         uuid references auth.users (id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists event_registrations_event_id_idx
  on public.event_registrations (event_id);
create index if not exists event_registrations_customer_id_idx
  on public.event_registrations (customer_id);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists event_registrations_set_updated_at
  on public.event_registrations;
create trigger event_registrations_set_updated_at
  before update on public.event_registrations
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

-- Storefront — only published events are visible to anyone.
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read"
  on public.events for select
  to anon, authenticated
  using (status = 'published');

-- Customers — read only their own registrations (through their customer row).
drop policy if exists "event_registrations_select_own" on public.event_registrations;
create policy "event_registrations_select_own"
  on public.event_registrations for select
  to authenticated
  using (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ));
