-- =============================================================================
-- LnR Cycle Center — Seed: catalog (categories + products)
-- Mirrors the previous mock catalog so the storefront and every admin panel
-- show meaningful data right after migrations are applied.
-- Idempotent (on conflict do nothing) — safe to run more than once.
-- =============================================================================

insert into public.categories (id, name, slug, description, sort_order, is_active)
values
  ('00000000-0000-4000-8000-000000000101', 'Bikes',       'bikes',       'Complete bicycles for every rider',   10, true),
  ('00000000-0000-4000-8000-000000000102', 'Parts',       'parts',       'Bicycle components and spare parts', 20, true),
  ('00000000-0000-4000-8000-000000000103', 'Accessories', 'accessories', 'Gear, helmets and riding accessories', 30, true)
on conflict (id) do nothing;

insert into public.products (
  id, category_id, name, slug, sku, description, tagline, specs,
  price, compare_at_price, cost, stock, status,
  is_featured, is_new_arrival, sort_order
)
values
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000103',
    'MET BLUEGRASS INTOX', 'met-bluegrass-intox', 'MET-INTOX',
    'No excuse for not going fast. Full-face helmet engineered for downhill and BMX riding.',
    array['No excuse for not going fast', 'Full-Face Helmet for Downhill and BMX'],
    array['Hard ABS outer shell with EPS liner', 'Fully removable, hand washable comfort padding', 'MX style straps with Double-D buckle', 'Wide field of vision', 'Adjustable visor', 'Eject bag, neck brace and goggle compatible', 'Certifications CE; AS/NZS; ASTM'],
    3500.00, 4200.00, 2100.00, 5, 'active', true, true, 10
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000103',
    'CLEANSPRING 600CC', 'cleanspring-600cc', 'CSP-600CC',
    'Cleanspring 600cc water bottle — leak-proof cap and easy-squeeze body.',
    array[]::text[], array[]::text[],
    350.00, null, 150.00, 25, 'active', false, true, 20
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000103',
    'BELLWETHER Womens Endurance Gel Short', 'bellwether-endurance-gel-short', 'BW-GELSHORT',
    'Women''s endurance gel short with padded chamois for long rides.',
    array[]::text[], array[]::text[],
    2500.00, null, 1400.00, 12, 'active', false, true, 30
  ),
  (
    '00000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000103',
    'SIDI NANO RAIN SHOE COVER', 'sidi-nano-rain-shoe-cover', 'SIDI-RAINCOVER',
    'Waterproof rain shoe cover for wet-season riding.',
    array[]::text[], array[]::text[],
    2000.00, null, 1100.00, 8, 'active', false, true, 40
  ),
  (
    '00000000-0000-4000-8000-000000000205',
    '00000000-0000-4000-8000-000000000103',
    'PROWAY BOTTLE CAGE', 'proway-bottle-cage', 'PW-CAGE',
    'Lightweight aluminum bottle cage.',
    array[]::text[], array[]::text[],
    150.00, null, 70.00, 40, 'active', false, false, 50
  ),
  (
    '00000000-0000-4000-8000-000000000206',
    '00000000-0000-4000-8000-000000000103',
    'RACE DAY BIB SHORT', 'race-day-bib-short', 'RDB-BIBSHORT',
    'Race day bib short with breathable fabric.',
    array[]::text[], array[]::text[],
    1200.00, null, 650.00, 18, 'active', false, false, 60
  ),
  (
    '00000000-0000-4000-8000-000000000207',
    '00000000-0000-4000-8000-000000000103',
    'CONTROL TOWER 2', 'control-tower-2', 'CT-HELMET-2',
    'Control Tower 2 helmet — stylish protection for everyday rides.',
    array[]::text[], array[]::text[],
    1800.00, 2000.00, 950.00, 10, 'active', false, false, 70
  ),
  (
    '00000000-0000-4000-8000-000000000208',
    '00000000-0000-4000-8000-000000000103',
    'SURELOCK FLEX COMBO COL 15 CABLE LOCK', 'surelock-flex-combo-col-15-cable-lock', 'SL-CABLE15',
    'Flexible 15mm combination cable lock.',
    array[]::text[], array[]::text[],
    500.00, null, 220.00, 30, 'active', false, false, 80
  )
on conflict (id) do nothing;

insert into public.products (
  id, category_id, name, slug, sku, description, tagline, specs,
  price, compare_at_price, cost, stock, status,
  is_featured, is_new_arrival, sort_order
)
values
  (
    '00000000-0000-4000-8000-000000000209',
    '00000000-0000-4000-8000-000000000102',
    'ROCKSHOX JUDY GOLD RL', 'rockshox-judy-gold-rl', 'RS-JUDY-GOLD',
    'RockShox Judy Gold RL suspension fork with remote lockout.',
    array[]::text[], array[]::text[],
    13600.00, null, 8200.00, 4, 'active', true, false, 10
  ),
  (
    '00000000-0000-4000-8000-000000000210',
    '00000000-0000-4000-8000-000000000102',
    'TRUVATIV NOIR T40 SEATPOST', 'truvativ-noir-t40-seatpost', 'TV-NOIR-T40',
    'Truvativ Noir T40 alloy seatpost.',
    array[]::text[], array[]::text[],
    2750.00, null, 1500.00, 15, 'active', false, false, 20
  ),
  (
    '00000000-0000-4000-8000-000000000211',
    '00000000-0000-4000-8000-000000000102',
    'TRUVATIV X1R STEM', 'truvativ-x1r-stem', 'TV-X1R-STEM',
    'Truvativ X1R lightweight stem.',
    array[]::text[], array[]::text[],
    750.00, null, 380.00, 20, 'active', false, false, 30
  ),
  (
    '00000000-0000-4000-8000-000000000212',
    '00000000-0000-4000-8000-000000000102',
    'TRUVATIV AKA ALL MOUNTAIN STEM', 'truvativ-aka-all-mountain-stem', 'TV-AKA-STEM',
    'Truvativ AKA all-mountain stem.',
    array[]::text[], array[]::text[],
    750.00, null, 380.00, 20, 'active', false, false, 40
  ),
  (
    '00000000-0000-4000-8000-000000000213',
    '00000000-0000-4000-8000-000000000101',
    'Road Bike Elite', 'road-bike-elite', 'RB-ELITE',
    'High-performance road bike built for speed, comfort and long-distance endurance rides.',
    array[]::text[], array[]::text[],
    12000.00, 13500.00, 8500.00, 3, 'active', true, false, 10
  ),
  (
    '00000000-0000-4000-8000-000000000214',
    '00000000-0000-4000-8000-000000000101',
    'Mountain Bike Pro', 'mountain-bike-pro', 'MB-PRO',
    'All-terrain mountain bike with full suspension.',
    array[]::text[], array[]::text[],
    15000.00, null, 9800.00, 6, 'active', false, false, 20
  ),
  (
    '00000000-0000-4000-8000-000000000215',
    '00000000-0000-4000-8000-000000000101',
    'City Cruiser', 'city-cruiser', 'CC-CRUISER',
    'Comfortable city cruiser for everyday commutes.',
    array[]::text[], array[]::text[],
    8000.00, null, 5200.00, 4, 'active', false, false, 30
  ),
  (
    '00000000-0000-4000-8000-000000000216',
    '00000000-0000-4000-8000-000000000101',
    'Electric Bike', 'electric-bike', 'EB-ELECTRIC',
    'Electric bike with pedal assist and long-range battery.',
    array[]::text[], array[]::text[],
    25000.00, 28000.00, 17500.00, 2, 'active', false, false, 40
  ),
  (
    '00000000-0000-4000-8000-000000000217',
    '00000000-0000-4000-8000-000000000101',
    'BMX Freestyle', 'bmx-freestyle', 'BMX-FREESTYLE',
    'Durable BMX freestyle bike for tricks and park riding.',
    array[]::text[], array[]::text[],
    9500.00, null, 6200.00, 5, 'active', false, false, 50
  ),
  (
    '00000000-0000-4000-8000-000000000218',
    '00000000-0000-4000-8000-000000000101',
    'Folding Bike', 'folding-bike', 'FB-FOLDING',
    'Compact folding bike — perfect for storage and travel.',
    array[]::text[], array[]::text[],
    7800.00, null, 4900.00, 7, 'active', false, false, 60
  ),
  (
    '00000000-0000-4000-8000-000000000219',
    '00000000-0000-4000-8000-000000000101',
    'Hybrid Bike', 'hybrid-bike', 'HB-HYBRID',
    'Versatile hybrid bike for roads and light trails.',
    array[]::text[], array[]::text[],
    13500.00, null, 8700.00, 3, 'active', false, false, 70
  ),
  (
    '00000000-0000-4000-8000-000000000220',
    '00000000-0000-4000-8000-000000000101',
    'Kids Bike', 'kids-bike', 'KB-KIDS',
    'Sturdy kids bike with training-wheel-ready build.',
    array[]::text[], array[]::text[],
    4500.00, null, 2600.00, 8, 'active', false, false, 80
  )
on conflict (id) do nothing;

