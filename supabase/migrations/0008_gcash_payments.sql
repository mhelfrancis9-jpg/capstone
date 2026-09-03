-- =============================================================================
-- LnR Cycle Center — GCash payments + merchant GCash settings
--
-- Apply order: 0001 -> 0002 -> 0003 -> 0004 -> 0005 -> 0006 -> 0007 -> 0008
--
-- Adds the live GCash payment flow on top of the existing order system:
--   * `gcash_payments` stores the customer's actual submitted payment proof
--     (sender name, phone, reference number, screenshot URL) and its review
--     state. One submission per order (unique order_id).
--   * `gcash_settings` is a singleton holding the merchant GCash QR code and
--     GCash number. The QR code is uploaded by the admin (Settings page) into
--     the existing public `images` storage bucket — it is never hardcoded.
--   * `orders.payment_status` gains a `rejected` value so the customer can
--     see a rejected GCash payment in their account.
--
-- Security model matches the rest of the schema:
--   * Payments are written with the service-role client only.
--   * Customers can read ONLY their own submission (RLS policy joins through
--     their linked order, exactly like order_items / order_status_history).
--   * `gcash_settings` is public-read so the storefront payment page can
--     render the QR code through the anon client (QR + number are not
--     sensitive). Writes stay service-role only.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- GCash payment submissions (one per order)
-- -----------------------------------------------------------------------------
create table if not exists public.gcash_payments (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null unique references public.orders (id) on delete cascade,
  sender_name      text not null,
  phone_number     text not null,
  reference_number text,
  screenshot_url   text not null,
  status           text not null default 'pending'
                   check (status in ('pending', 'paid', 'rejected')),
  rejection_reason text,
  created_at       timestamptz not null default now(),
  reviewed_at      timestamptz,
  reviewed_by      uuid references auth.users (id) on delete set null
);

create index if not exists gcash_payments_order_id_idx
  on public.gcash_payments (order_id);

-- -----------------------------------------------------------------------------
-- Merchant GCash settings (singleton)
-- -----------------------------------------------------------------------------
create table if not exists public.gcash_settings (
  id          boolean primary key default true check (id = true),
  qr_code_url text,
  gcash_number text,
  updated_at  timestamptz not null default now()
);

insert into public.gcash_settings (id, qr_code_url, gcash_number)
values (true, null, '09171234567')
on conflict (id) do nothing;

drop trigger if exists gcash_settings_set_updated_at on public.gcash_settings;
create trigger gcash_settings_set_updated_at
  before update on public.gcash_settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Orders — allow a rejected payment status
-- -----------------------------------------------------------------------------
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'rejected'));

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.gcash_payments enable row level security;
alter table public.gcash_settings enable row level security;

-- Customers — read only their own GCash submission (through their order).
drop policy if exists "gcash_payments_select_own" on public.gcash_payments;
create policy "gcash_payments_select_own"
  on public.gcash_payments for select
  to authenticated
  using (order_id in (
    select id from public.orders
    where customer_id in (
      select id from public.customers where auth_user_id = auth.uid()
    )
  ));

-- Storefront — public read of the merchant QR / GCash number.
drop policy if exists "gcash_settings_public_read" on public.gcash_settings;
create policy "gcash_settings_public_read"
  on public.gcash_settings for select
  to anon, authenticated
  using (true);
