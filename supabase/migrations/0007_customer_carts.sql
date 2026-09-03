-- =============================================================================
-- LnR Cycle Center — Customer saved carts
--
-- Apply order: 0001 -> 0002 -> 0003 -> 0004 -> 0005 -> 0006 -> 0007
--
-- Persists the storefront cart per authenticated customer so it survives
-- sign-out / sign-in cycles:
--   * One row per customer (PK on customer_id) storing the cart line items
--     as JSONB — the exact CartItem[] shape used by the client cart.
--   * The saved cart is NEVER deleted on logout. Sign-out only clears the
--     client-side copy; on the next sign-in the account's cart is restored.
--   * RLS: an authenticated customer can only read/write their OWN cart row,
--     so carts never leak between accounts sharing a browser/device.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Saved cart (one row per customer)
-- -----------------------------------------------------------------------------
create table if not exists public.customer_carts (
  customer_id uuid primary key references public.customers (id) on delete cascade,
  items       jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Updated-at trigger
-- -----------------------------------------------------------------------------
drop trigger if exists customer_carts_set_updated_at on public.customer_carts;

create trigger customer_carts_set_updated_at
  before update on public.customer_carts
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security — customers manage only their own cart row
-- (writes are also performed service-role server-side; these policies are
--  defense-in-depth so the anon/browser client can never touch another
--  customer's cart.)
-- -----------------------------------------------------------------------------
alter table public.customer_carts enable row level security;

drop policy if exists "customer_carts_select_own" on public.customer_carts;
create policy "customer_carts_select_own"
  on public.customer_carts for select
  to authenticated
  using (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ));

drop policy if exists "customer_carts_insert_own" on public.customer_carts;
create policy "customer_carts_insert_own"
  on public.customer_carts for insert
  to authenticated
  with check (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ));

drop policy if exists "customer_carts_update_own" on public.customer_carts;
create policy "customer_carts_update_own"
  on public.customer_carts for update
  to authenticated
  using (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ))
  with check (customer_id in (
    select id from public.customers where auth_user_id = auth.uid()
  ));
