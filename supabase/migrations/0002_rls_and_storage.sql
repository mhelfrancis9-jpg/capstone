-- =============================================================================
-- LnR Cycle Center — Row Level Security + Storage policies (part 2 of 3)
--
-- Security model
-- -----------------------------------------------------------------------------
--  * Storefront reads (products/categories/images/variants) are allowed for
--    anon + authenticated through RLS, but ONLY rows in a publishable state
--    (e.g. products.status = 'active'). This is what lets the customer-facing
--    pages render products created in the admin panel without any secrets.
--  * Customers, orders, order items and status history have NO public
--    policies. They are only reachable server-side through the service-role
--    key (lib/supabase/admin.ts). The anon key can never read or write them.
--  * Admin writes are performed server-side with the service-role client,
--    which bypasses RLS entirely — the client never holds write privileges.
--  * Storage: the existing public `images` bucket keeps public reads, and
--    signed-in admins may upload/update/delete objects through it (used by
--    the Products manager for product photos).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- -----------------------------------------------------------------------------
-- Storefront reads (published data only)
-- -----------------------------------------------------------------------------
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read"
  on public.product_images for select
  to anon, authenticated
  using (true);

drop policy if exists "product_variants_public_read" on public.product_variants;
create policy "product_variants_public_read"
  on public.product_variants for select
  to anon, authenticated
  using (available = true);

-- -----------------------------------------------------------------------------
-- Customers / Orders / Order items / Status history
--   No policies on purpose: server-side service-role access only.
--   (If the storefront later adds customer accounts, link a profile table to
--    auth.users and add "authenticated reads own row" policies here.)
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Storage (`images` bucket)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "images_public_read" on storage.objects;
create policy "images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'images');

drop policy if exists "images_authenticated_upload" on storage.objects;
create policy "images_authenticated_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'images');

drop policy if exists "images_authenticated_update" on storage.objects;
create policy "images_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'images')
  with check (bucket_id = 'images');

drop policy if exists "images_authenticated_delete" on storage.objects;
create policy "images_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'images');
