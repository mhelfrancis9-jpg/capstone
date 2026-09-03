-- =============================================================================
-- LnR Cycle Center — Seed: product images + variants
--
-- Image URLs reuse the existing /public assets (and the /products PNGs used by
-- the admin mock). New images uploaded by the admin through the Products page
-- are stored as public URLs in the Supabase `images` bucket and are written to
-- this same table — one shared structure for the storefront and the admin.
-- =============================================================================

insert into public.product_images (id, product_id, url, alt, sort_order, is_primary)
values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000201',
   '/Customerpageimages/Intox-gravity-helmet-NO_360x.png', 'MET BLUEGRASS INTOX', 10, true),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000201',
   '/products/helmet-2.png', 'MET BLUEGRASS INTOX — alternate view', 20, false),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000201',
   '/products/helmet-3.png', 'MET BLUEGRASS INTOX — alternate view', 30, false),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000201',
   '/products/helmet-4.png', 'MET BLUEGRASS INTOX — alternate view', 40, false),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000202',
   '/Customerpageimages/203809-00-d-385229_360x.png', 'CLEANSPRING 600CC', 10, true),
  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000203',
   '/Customerpageimages/WN-Short-Endurance_Gel-10_1200x_8bacd308-1b55-4d30-be13-548041cacd34_360x.png',
   'BELLWETHER Women''s Endurance Gel Short', 10, true),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000204',
   '/Customerpageimages/41CWA6ZIqBL._SL400_360x.png', 'SIDI NANO RAIN SHOE COVER', 10, true),
  ('00000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000205',
   '/Customerpageimages/ScreenShot2021-02-03at3.32.28PM_360x.png', 'PROWAY BOTTLE CAGE', 10, true),
  ('00000000-0000-4000-8000-000000000309', '00000000-0000-4000-8000-000000000206',
   '/Customerpageimages/product_364445_360x.png', 'RACE DAY BIB SHORT', 10, true),
  ('00000000-0000-4000-8000-000000000310', '00000000-0000-4000-8000-000000000207',
   '/Customerpageimages/HELMET%209.png', 'CONTROL TOWER 2', 10, true),
  ('00000000-0000-4000-8000-000000000311', '00000000-0000-4000-8000-000000000208',
   '/Customerpageimages/51ycb37lFvL._AC_SX355_360x%201.png', 'SURELOCK FLEX COMBO COL 15 CABLE LOCK', 10, true),
  ('00000000-0000-4000-8000-000000000312', '00000000-0000-4000-8000-000000000209',
   '/Customerpageimages/490000102_360x%201.png', 'ROCKSHOX JUDY GOLD RL', 10, true),
  ('00000000-0000-4000-8000-000000000313', '00000000-0000-4000-8000-000000000210',
   '/Customerpageimages/59050b_360x%201.png', 'TRUVATIV NOIR T40 SEATPOST', 10, true),
  ('00000000-0000-4000-8000-000000000314', '00000000-0000-4000-8000-000000000211',
   '/Customerpageimages/610000137_360x.png', 'TRUVATIV X1R STEM', 10, true),
  ('00000000-0000-4000-8000-000000000315', '00000000-0000-4000-8000-000000000212',
   '/Customerpageimages/480000256_360x.png', 'TRUVATIV AKA ALL MOUNTAIN STEM', 10, true),
  ('00000000-0000-4000-8000-000000000316', '00000000-0000-4000-8000-000000000213',
   '/products/road-bike-elite.png', 'Road Bike Elite', 10, true)
on conflict (id) do nothing;

-- Variants --------------------------------------------------------------------
insert into public.product_variants (
  id, product_id, sku, name, size, color, price, stock, available, sort_order
)
values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000201',
   'MET-INTOX-L', 'L / BLACK CAMO', 'L (58/60 cm) (1160 g)', 'BLACK CAMO | MATT',
   3500.00, 5, true, 10),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000213',
   'RB-ELITE-S-BLK', 'S / Black', 'S', 'Black', 12000.00, 1, true, 10),
  ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000213',
   'RB-ELITE-M-BLK', 'M / Black', 'M', 'Black', 12000.00, 1, true, 20),
  ('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000213',
   'RB-ELITE-L-BLK', 'L / Black', 'L', 'Black', 12000.00, 1, true, 30),
  ('00000000-0000-4000-8000-000000000405', '00000000-0000-4000-8000-000000000213',
   'RB-ELITE-S-RED', 'S / Red', 'S', 'Red', 12000.00, 0, true, 40),
  ('00000000-0000-4000-8000-000000000406', '00000000-0000-4000-8000-000000000213',
   'RB-ELITE-M-RED', 'M / Red', 'M', 'Red', 12000.00, 1, true, 50),
  ('00000000-0000-4000-8000-000000000407', '00000000-0000-4000-8000-000000000213',
   'RB-ELITE-L-RED', 'L / Red', 'L', 'Red', 12000.00, 1, true, 60)
on conflict (id) do nothing;
