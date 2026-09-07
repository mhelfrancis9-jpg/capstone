-- =============================================================================
-- LnR Cycle Center — Seed: builder categories
-- Inserts the 15 Bike Builder step categories into the public.categories
-- table so they appear in the admin CategoryPicker under "Build Steps" and
-- any product added under these categories is automatically discoverable by
-- the customer-facing Bike Builder.
--
-- Slugs MUST match the keys in components/admin/products/categoryConfig.ts
-- exactly — the CategoryPicker and customization-axes logic depend on them.
-- =============================================================================

insert into public.categories (id, name, slug, description, sort_order, is_active)
values
  ('00000000-0000-4000-8000-000000000111', 'Frameset',          'frameset',          'Frame and fork packages',              110, true),
  ('00000000-0000-4000-8000-000000000112', 'Handlebar',         'handlebar',         'Handlebar and cockpit components',     120, true),
  ('00000000-0000-4000-8000-000000000113', 'Stem',              'stem',              'Stems and steerer clamps',             130, true),
  ('00000000-0000-4000-8000-000000000114', 'Seatpost',          'seatpost',          'Seatposts and seat clamps',            140, true),
  ('00000000-0000-4000-8000-000000000115', 'Saddle',            'saddle',            'Saddles and seat accessories',         150, true),
  ('00000000-0000-4000-8000-000000000116', 'Wheelset',          'wheelset',          'Wheelsets and wheel components',       160, true),
  ('00000000-0000-4000-8000-000000000117', 'Tires',             'tires',             'Tires and inner tubes',                170, true),
  ('00000000-0000-4000-8000-000000000118', 'Front Derailleur',  'front-derailleur',  'Front derailleurs',                    180, true),
  ('00000000-0000-4000-8000-000000000119', 'Rear Derailleur',   'rear-derailleur',   'Rear derailleurs',                     190, true),
  ('00000000-0000-4000-8000-00000000011a', 'Crankset',          'crankset',          'Cranksets and chainrings',             200, true),
  ('00000000-0000-4000-8000-00000000011b', 'Cassette',          'cassette',          'Cassettes and cogs',                   210, true),
  ('00000000-0000-4000-8000-00000000011c', 'Chain',             'chain',             'Chains',                               220, true),
  ('00000000-0000-4000-8000-00000000011d', 'Brakeset',          'brakeset',          'Brakesets and brake levers',           230, true),
  ('00000000-0000-4000-8000-00000000011e', 'Rotors',            'rotors',            'Disc brake rotors',                    240, true),
  ('00000000-0000-4000-8000-00000000011f', 'Pedals',            'pedals',            'Pedals and cleats',                    250, true)
on conflict (id) do update set
  name        = excluded.name,
  slug        = excluded.slug,
  description = excluded.description,
  sort_order  = excluded.sort_order,
  is_active   = excluded.is_active,
  updated_at  = now();
