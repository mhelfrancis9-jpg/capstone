-- =============================================================================
-- LnR Cycle Center — Bike Builder: schema + seed data
-- =============================================================================

-- 1. Builder step definitions
create table if not exists public.bike_builder_steps (
  id                 uuid primary key default gen_random_uuid(),
  step_number        integer not null unique,
  name               text not null,
  description        text not null,
  customization_axes jsonb not null default '[]'::jsonb,
  notice             text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger bike_builder_steps_set_updated_at
  before update on public.bike_builder_steps
  for each row execute function public.set_updated_at();

-- 2. Product to step mapping
create table if not exists public.bike_builder_products (
  id          uuid primary key default gen_random_uuid(),
  step_number integer not null references public.bike_builder_steps (step_number) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (step_number, product_id)
);

create index if not exists bike_builder_products_step_idx
  on public.bike_builder_products (step_number, sort_order);

-- 3. RLS
alter table public.bike_builder_steps enable row level security;
alter table public.bike_builder_products enable row level security;

drop policy if exists "bike_builder_steps_public_read" on public.bike_builder_steps;
create policy "bike_builder_steps_public_read"
  on public.bike_builder_steps for select to anon, authenticated using (true);

drop policy if exists "bike_builder_products_public_read" on public.bike_builder_products;
create policy "bike_builder_products_public_read"
  on public.bike_builder_products for select to anon, authenticated using (true);

-- 4. Seed builder steps
insert into public.bike_builder_steps (step_number, name, description, customization_axes, notice)
values
  (1, 'Frameset',
       'The foundation of your build. Select your Frameset. Available in carbon or alloy, aero or relaxed, BSA or BB86. Upgrade to aero seatpost, integrated cockpit, and full-carbon fork as options.',
       '[{"label":"Size","options":["Small","Medium","Large","X-Large"]},{"label":"Color","options":["Matte Black","Deep Forest","Signal Yellow","Raw Alloy"]}]'::jsonb,
       'Medium is recommended for riders around 5''6"–5''10" (168–178cm). Your fitter confirms the final fit before assembly.'),
  (2, 'Handlebars',
       'Select your handlebar. Choose from compact drop, ergonomic, or aero profiles. Options include alloy or carbon, internal routing, and stem-matched cockpit upgrades.',
       '[{"label":"Handlebar Width C-C","options":["380mm","400mm","420mm","440mm"]}]'::jsonb, null),
  (3, 'Stems',
       'Choose your stem. Alloy for value, carbon for weight savings. Select length, angle, and steerer clamp size.',
       '[{"label":"Stem Length","options":["80mm","90mm","100mm","110mm"]},{"label":"Steerer Tube Size","options":["1 1/8\"","1 1/4\""]}]'::jsonb, null),
  (4, 'Seatpost',
       'Choose your seatpost. Alloy for reliability, carbon for comfort and weight. Confirm diameter and set-back for your Frameset.',
       '[{"label":"Diameter","options":["27.2mm","30.9mm","31.6mm"]},{"label":"Color","options":["Black","Silver","Red"]}]'::jsonb, null),
  (5, 'Saddle',
       'Select your saddle. Pick a shape that matches your sit-bone width and riding style.',
       '[]'::jsonb, null),
  (6, 'Wheelset',
       'Choose your wheelset. Deeper rims for aero gains, shallower for climb-friendly builds. Confirm axle standard and freehub body.',
       '[{"label":"Rim Height or Depth","options":["35mm","45mm","50mm","60mm"]},{"label":"Freehub Body Standard","options":["Shimano HG","SRAM XDR","Campagnolo"]}]'::jsonb, null),
  (7, 'Tires',
       'Select your tire width. Match tire size to your Frameset and Wheelset clearance.',
       '[{"label":"Tire Size","options":["700x25c","700x28c","700x30c","700x32c"]}]'::jsonb, null),
  (8, 'Front Derailleur',
       'Choose your front derailleur. Confirm pull ratio and mount style.',
       '[]'::jsonb, null),
  (9, 'Rear Derailleur',
       'Choose your rear derailleur. Match to your Cassette range and chain speed.',
       '[]'::jsonb, null),
  (10, 'Crankset',
       'Select your crankset. Set your chainring sizes for riding style and terrain.',
       '[]'::jsonb, null),
  (11, 'Cassette / Cog',
       'Choose your cassette. Match to your Rear Derailleur capacity and riding style.',
       '[]'::jsonb, null),
  (12, 'Chain',
       'Select the correct chain for your Drivetrain speed. Must match your Derailleurs and Cassette.',
       '[]'::jsonb, null),
  (13, 'Brakeset',
       'Choose your brakes. Hydraulic disc for best stopping power, mechanical disc for easy maintenance.',
       '[]'::jsonb, null),
  (14, 'Rotors',
       'Choose your rotor size and color. Larger rotors for mountain and heavy riders.',
       '[{"label":"Rotor Size","options":["140mm","160mm","180mm"]},{"label":"Color","options":["Black","Silver","Red"]}]'::jsonb, null),
  (15, 'Pedals',
       'Select your pedal system. Platform for casual use, clipless for road performance.',
       '[]'::jsonb, null)
on conflict (step_number) do update set
  name = excluded.name, description = excluded.description,
  customization_axes = excluded.customization_axes, notice = excluded.notice,
  updated_at = now();

-- 5. Seed bike builder products (under existing "Parts" category)
-- Category: 00000000-0000-4000-8000-000000000102 (Parts)

-- Step 1: Frameset
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000102',
   'Apex Road Frameset', 'apex-road-frameset', 'BB-FR-001',
   'Full carbon frameset, aero seatpost, full-carbon fork, BSA.',
   array['Full carbon frameset', 'Aero seatpost, full-carbon fork, BSA']::text[],
   array['Carbon T800 monocoque', 'BSA threaded BB', '4mm/5mm axle spacing', 'Internal cable routing']::text[],
   18500.00, 10, 'active', 10),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000102',
   'Velocity Carbon Frameset', 'velocity-carbon-frameset', 'BB-FR-002',
   'Premium carbon frameset with integrated cockpit and aero seatpost.',
   array['Premium carbon', 'Integrated cockpit']::text[],
   array['Carbon T1000 monocoque', 'BB86 press-fit', 'Rear thru-axle 142x12', 'Full internal routing']::text[],
   32000.00, 6, 'active', 20),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000102',
   'Trail Pro Aluminum Frameset', 'trail-pro-aluminum-frameset', 'BB-FR-003',
   'Durable alloy frameset with straight-blade alloy fork and rack mounts.',
   array['Durable alloy', 'Rack and fender mounts']::text[],
   array['6061-T6 hydroformed alloy', 'BSA threaded BB', 'Rack and fender mounts', 'Mechanical + hydraulic ready']::text[],
   15000.00, 12, 'active', 30)
on conflict (id) do nothing;

-- Step 2: Handlebars
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000102',
   'Aero Compact Bar', 'aero-compact-bar', 'BB-HB-001',
   'Compact drop aero bar with short reach and shallow drop for endurance.',
   array['Compact drop', 'Aero profile']::text[],
   array['6061 alloy', '31.8mm clamp', 'Reach 75mm / Drop 125mm', 'Internal routing']::text[],
   3500.00, 15, 'active', 10),
  ('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000102',
   'Carbon Race Bar', 'carbon-race-bar', 'BB-HB-002',
   'Full carbon race bar for maximum stiffness and lowest weight.',
   array['Full carbon', 'Race fit']::text[],
   array['T700 carbon', '31.8mm clamp', 'Reach 80mm / Drop 130mm', '380-440mm widths']::text[],
   8000.00, 8, 'active', 20),
  ('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000102',
   'Classic Road Bar', 'classic-road-bar', 'BB-HB-003',
   'Classic round-drop alloy bar for traditional fit and feel.',
   array['Classic round drop', 'Alloy']::text[],
   array['6061 alloy', '31.8mm clamp', 'Reach 85mm / Drop 140mm', '400-440mm widths']::text[],
   2500.00, 20, 'active', 30)
on conflict (id) do nothing;

-- Step 3: Stems
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000102',
   'Forged 90 Alloy Stem', 'forged-90-alloy-stem', 'BB-ST-001',
   'Forged alloy stem, lightweight and reliable for everyday road riding.',
   array['Forged alloy', 'Lightweight']::text[],
   array['6061 forged alloy', '31.8mm clamp', '1 1/8 inch steerer', 'Plus or minus 7 degree angle']::text[],
   2000.00, 20, 'active', 10),
  ('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000102',
   'Race 100 Alloy Stem', 'race-100-alloy-stem', 'BB-ST-002',
   'Race-oriented alloy stem with negative rise for aggressive positioning.',
   array['Race geometry', 'Negative rise']::text[],
   array['2014 alloy', '31.8mm clamp', '1 1/8 inch steerer', 'Minus 17 degree angle']::text[],
   2800.00, 15, 'active', 20),
  ('00000000-0000-4000-8000-000000000509', '00000000-0000-4000-8000-000000000102',
   'Carbon 100 Stem', 'carbon-100-stem', 'BB-ST-003',
   'Full carbon stem for maximum weight savings and vibration damping.',
   array['Full carbon', 'Vibration damping']::text[],
   array['Carbon monocoque', '31.8mm clamp', '1 1/8 inch steerer', 'Plus or minus 10 degree angle']::text[],
   6500.00, 6, 'active', 30)
on conflict (id) do nothing;

-- Step 4: Seatpost
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000510', '00000000-0000-4000-8000-000000000102',
   'Alloy Seatpost', 'alloy-seatpost', 'BB-SP-001',
   'Reliable alloy seatpost with micro-adjust head and setback.',
   array['Alloy', 'Micro-adjust']::text[],
   array['6061 alloy', '27.2mm diameter', '350mm length', '20mm setback']::text[],
   1200.00, 25, 'active', 10),
  ('00000000-0000-4000-8000-000000000511', '00000000-0000-4000-8000-000000000102',
   'Carbon Seatpost', 'carbon-seatpost', 'BB-SP-002',
   'Full carbon seatpost for comfort and weight savings.',
   array['Full carbon', 'Comfort']::text[],
   array['T700 carbon', '27.2mm diameter', '350mm length', '15mm setback']::text[],
   5500.00, 8, 'active', 20),
  ('00000000-0000-4000-8000-000000000512', '00000000-0000-4000-8000-000000000102',
   'Alloy Race Seatpost', 'alloy-race-seatpost', 'BB-SP-003',
   'Lightweight alloy race seatpost with zero offset.',
   array['Zero offset', 'Race']::text[],
   array['7075 alloy', '27.2mm diameter', '350mm length', '0mm offset']::text[],
   3000.00, 12, 'active', 30)
on conflict (id) do nothing;

-- Step 5: Saddle
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000513', '00000000-0000-4000-8000-000000000102',
   'Endurance Saddle', 'endurance-saddle', 'BB-SA-001',
   'Wide-profile endurance saddle with thick padding for long rides.',
   array['Wide profile', 'Thick padding']::text[],
   array['Chromoly rails', '155mm width', 'Pressure-relief channel', 'Synthetic cover']::text[],
   2500.00, 18, 'active', 10),
  ('00000000-0000-4000-8000-000000000514', '00000000-0000-4000-8000-000000000102',
   'Race Pro Saddle', 'race-pro-saddle', 'BB-SA-002',
   'Narrow race saddle with carbon rails and minimal padding.',
   array['Carbon rails', 'Race fit']::text[],
   array['Carbon rails', '130mm width', 'Full cutout', 'Microfiber cover']::text[],
   8000.00, 6, 'active', 20),
  ('00000000-0000-4000-8000-000000000515', '00000000-0000-4000-8000-000000000102',
   'All-Day Saddle', 'all-day-saddle', 'BB-SA-003',
   'Mid-width saddle balanced for all-day comfort and performance.',
   array['Mid-width', 'Balanced']::text[],
   array['Titanium rails', '143mm width', 'Central relief zone', 'Leather cover']::text[],
   4000.00, 10, 'active', 30)
on conflict (id) do nothing;

-- Step 6: Wheelset
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000516', '00000000-0000-4000-8000-000000000102',
   'Aero 35 Carbon', 'aero-35-carbon', 'BB-WS-001',
   '35mm deep carbon clincher, great all-rounder for flat and rolling terrain.',
   array['35mm depth', 'Carbon clincher']::text[],
   array['Carbon T700', '35mm rim depth', '23mm internal width', 'Tubeless-ready', 'Centerlock disc']::text[],
   35000.00, 4, 'active', 10),
  ('00000000-0000-4000-8000-000000000517', '00000000-0000-4000-8000-000000000102',
   'Endurance 45 Alloy', 'endurance-45-alloy', 'BB-WS-002',
   '45mm deep alloy wheelset for endurance and training.',
   array['45mm depth', 'Alloy']::text[],
   array['6061 alloy', '45mm rim depth', '21mm internal width', 'Clincher', '6-bolt disc']::text[],
   18000.00, 8, 'active', 20),
  ('00000000-0000-4000-8000-000000000518', '00000000-0000-4000-8000-000000000102',
   'Race 50 Carbon', 'race-50-carbon', 'BB-WS-003',
   '50mm deep aero carbon wheelset for race-day performance.',
   array['50mm depth', 'Race aero']::text[],
   array['Carbon T800', '50mm rim depth', '25mm internal width', 'Tubeless-ready', 'Centerlock disc']::text[],
   42000.00, 3, 'active', 30)
on conflict (id) do nothing;

-- Step 7: Tires
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000519', '00000000-0000-4000-8000-000000000102',
   'RoadGrip 25c', 'roadgrip-25c', 'BB-TI-001',
   'Fast-rolling 700x25c road tire with low rolling resistance.',
   array['700x25c', 'Fast rolling']::text[],
   array['700x25c', '120 TPI', 'Folding bead', 'Puncture guard']::text[],
   2000.00, 30, 'active', 10),
  ('00000000-0000-4000-8000-000000000520', '00000000-0000-4000-8000-000000000102',
   'RoadGrip 28c', 'roadgrip-28c', 'BB-TI-002',
   'Versatile 700x28c tire balancing speed and comfort.',
   array['700x28c', 'Versatile']::text[],
   array['700x28c', '120 TPI', 'Folding bead', 'Puncture guard']::text[],
   2200.00, 30, 'active', 20),
  ('00000000-0000-4000-8000-000000000521', '00000000-0000-4000-8000-000000000102',
   'Race Slick 30c', 'race-slick-30c', 'BB-TI-003',
   'Supple 700x30c slick tire for endurance and light gravel.',
   array['700x30c', 'Endurance']::text[],
   array['700x30c', '150 TPI', 'Folding bead', 'Tubeless-ready']::text[],
   3500.00, 20, 'active', 30)
on conflict (id) do nothing;

-- Step 8: Front Derailleur
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000522', '00000000-0000-4000-8000-000000000102',
   'ShiftPro Front Derailleur', 'shiftpro-front-derailleur', 'BB-FD-001',
   'Smooth-shifting front derailleur compatible with 50/34 and 52/36 chainrings.',
   array['11-speed', 'Braze-on']::text[],
   array['11-speed', 'Braze-on mount', '2x compatible', 'Alloy body']::text[],
   3500.00, 12, 'active', 10),
  ('00000000-0000-4000-8000-000000000523', '00000000-0000-4000-8000-000000000102',
   'RaceFront Derailleur', 'racefront-derailleur', 'BB-FD-002',
   'High-performance front derailleur with carbon cage for precise shifts.',
   array['12-speed', 'Carbon cage']::text[],
   array['12-speed', 'Braze-on mount', '2x compatible', 'Carbon cage']::text[],
   5500.00, 8, 'active', 20)
on conflict (id) do nothing;

-- Step 9: Rear Derailleur
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000524', '00000000-0000-4000-8000-000000000102',
   'ShiftPro Rear Derailleur', 'shiftpro-rear-derailleur', 'BB-RD-001',
   'Reliable rear derailleur with wide gear range for all-around riding.',
   array['11-speed', 'Shadow design']::text[],
   array['11-speed', 'Max 34T cassette', 'Direct mount', 'Alloy body']::text[],
   5000.00, 12, 'active', 10),
  ('00000000-0000-4000-8000-000000000525', '00000000-0000-4000-8000-000000000102',
   'Race12 Rear Derailleur', 'race12-rear-derailleur', 'BB-RD-002',
   'Top-tier 12-speed rear derailleur with carbon cage and precise indexing.',
   array['12-speed', 'Carbon cage']::text[],
   array['12-speed', 'Max 36T cassette', 'Direct mount', 'Carbon + alloy']::text[],
   8000.00, 6, 'active', 20)
on conflict (id) do nothing;

-- Step 10: Crankset
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000526', '00000000-0000-4000-8000-000000000102',
   'Forge 50/34 Crankset', 'forge-50-34-crankset', 'BB-CK-001',
   'Compact 50/34T alloy crankset for versatile road gearing.',
   array['50/34T compact', 'Alloy']::text[],
   array['50/34T chainrings', '170mm arms', '110 BCD', 'Hollow alloy', 'BB86 compatible']::text[],
   7000.00, 10, 'active', 10),
  ('00000000-0000-4000-8000-000000000527', '00000000-0000-4000-8000-000000000102',
   'Race 52/36 Crankset', 'race-52-36-crankset', 'BB-CK-002',
   'Mid-compact 52/36T crankset for race-oriented setups.',
   array['52/36T mid-compact', 'Race']::text[],
   array['52/36T chainrings', '172.5mm arms', '110 BCD', 'Carbon composite', 'BB86 compatible']::text[],
   9500.00, 6, 'active', 20)
on conflict (id) do nothing;

-- Step 11: Cassette
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000528', '00000000-0000-4000-8000-000000000102',
   '11-32T Cassette', '11-32t-cassette', 'BB-CS-001',
   'Wide-range 11-32T cassette for climbing and all-around riding.',
   array['11-32T', '11-speed']::text[],
   array['11-speed', '11-32T range', '1125g', 'HG freehub compatible']::text[],
   2500.00, 20, 'active', 10),
  ('00000000-0000-4000-8000-000000000529', '00000000-0000-4000-8000-000000000102',
   '11-28T Cassette', '11-28t-cassette', 'BB-CS-002',
   'Race-oriented 11-28T cassette for tight gear steps and fast flats.',
   array['11-28T', '11-speed']::text[],
   array['11-speed', '11-28T range', '1060g', 'HG freehub compatible']::text[],
   2500.00, 20, 'active', 20)
on conflict (id) do nothing;

-- Step 12: Chain
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000530', '00000000-0000-4000-8000-000000000102',
   '11-Speed Chain', '11-speed-chain', 'BB-CH-001',
   'Durable 11-speed chain with link pin for easy sizing.',
   array['11-speed', '116 links']::text[],
   array['11-speed', '116 links', 'Nickel plated', 'MissingLink included']::text[],
   1200.00, 40, 'active', 10),
  ('00000000-0000-4000-8000-000000000531', '00000000-0000-4000-8000-000000000102',
   '12-Speed Chain', '12-speed-chain', 'BB-CH-002',
   'Premium 12-speed chain with hollow pins for weight savings.',
   array['12-speed', '126 links']::text[],
   array['12-speed', '126 links', 'Silver finish', 'Hollow pins', 'MissingLink included']::text[],
   1500.00, 30, 'active', 20)
on conflict (id) do nothing;

-- Step 13: Brakeset
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000532', '00000000-0000-4000-8000-000000000102',
   'Hydra Disc Brakeset', 'hydra-disc-brakeset', 'BB-BR-001',
   'Hydraulic disc brake set, front and rear calipers with levers.',
   array['Hydraulic disc', 'Front + Rear']::text[],
   array['Hydraulic disc', 'Mineral oil', 'Two-piston caliper', '160mm default rotor']::text[],
   8000.00, 8, 'active', 10),
  ('00000000-0000-4000-8000-000000000533', '00000000-0000-4000-8000-000000000102',
   'Race Hydraulic Brakeset', 'race-hydraulic-brakeset', 'BB-BR-002',
   'Race-grade four-piston hydraulic disc brakes with carbon levers.',
   array['Race hydraulic', 'Four-piston']::text[],
   array['Hydraulic disc', 'DOT fluid', 'Four-piston caliper', 'Carbon lever']::text[],
   12000.00, 4, 'active', 20)
on conflict (id) do nothing;

-- Step 14: Rotors
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000534', '00000000-0000-4000-8000-000000000102',
   '160mm Steel Rotor', '160mm-steel-rotor', 'BB-RT-001',
   'Standard 160mm steel rotor for road and light gravel use.',
   array['160mm', 'Steel']::text[],
   array['160mm diameter', 'Steel braking surface', '6-bolt mount', '1.8mm thickness']::text[],
   800.00, 40, 'active', 10),
  ('00000000-0000-4000-8000-000000000535', '00000000-0000-4000-8000-000000000102',
   '140mm Alloy Rotor', '140mm-alloy-rotor', 'BB-RT-002',
   'Lightweight 140mm alloy rotor for rear wheel and weight-conscious builds.',
   array['140mm', 'Alloy']::text[],
   array['140mm diameter', 'Alloy carrier', '6-bolt mount', '1.8mm thickness']::text[],
   1200.00, 25, 'active', 20),
  ('00000000-0000-4000-8000-000000000536', '00000000-0000-4000-8000-000000000102',
   '180mm Steel Rotor', '180mm-steel-rotor', 'BB-RT-003',
   'Oversized 180mm steel rotor for heavy riders and steep descents.',
   array['180mm', 'Steel']::text[],
   array['180mm diameter', 'Steel braking surface', '6-bolt mount', '2.0mm thickness']::text[],
   900.00, 30, 'active', 30)
on conflict (id) do nothing;

-- Step 15: Pedals
insert into public.products (id, category_id, name, slug, sku, description, tagline, specs, price, stock, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000537', '00000000-0000-4000-8000-000000000102',
   'Platform Pedal', 'platform-pedal', 'BB-PD-001',
   'Wide alloy platform pedal with replaceable pins for casual riding.',
   array['Platform', 'Alloy']::text[],
   array['CNC alloy body', 'Sealed bearings', 'Replaceable pins', '100x100mm platform']::text[],
   1500.00, 25, 'active', 10),
  ('00000000-0000-4000-8000-000000000538', '00000000-0000-4000-8000-000000000102',
   'Clipless Road Pedal', 'clipless-road-pedal', 'BB-PD-002',
   'SPD-SL compatible clipless road pedal with wide body for stability.',
   array['SPD-SL', 'Road']::text[],
   array['Chromoly spindle', 'Wide composite body', 'Adjustable tension', '6 degree float']::text[],
   5000.00, 10, 'active', 20),
  ('00000000-0000-4000-8000-000000000539', '00000000-0000-4000-8000-000000000102',
   'Race Carbon Pedal', 'race-carbon-pedal', 'BB-PD-003',
   'Ultra-light carbon body clipless pedal for race-day performance.',
   array['Carbon body', 'Race']::text[],
   array['Carbon composite body', 'Titanium spindle', 'Adjustable float', 'Narrow Q-factor']::text[],
   9000.00, 4, 'active', 30)
on conflict (id) do nothing;

-- 6. Link products to builder steps
insert into public.bike_builder_products (step_number, product_id, sort_order)
values
  (1,  '00000000-0000-4000-8000-000000000501', 10),
  (1,  '00000000-0000-4000-8000-000000000502', 20),
  (1,  '00000000-0000-4000-8000-000000000503', 30),
  (2,  '00000000-0000-4000-8000-000000000504', 10),
  (2,  '00000000-0000-4000-8000-000000000505', 20),
  (2,  '00000000-0000-4000-8000-000000000506', 30),
  (3,  '00000000-0000-4000-8000-000000000507', 10),
  (3,  '00000000-0000-4000-8000-000000000508', 20),
  (3,  '00000000-0000-4000-8000-000000000509', 30),
  (4,  '00000000-0000-4000-8000-000000000510', 10),
  (4,  '00000000-0000-4000-8000-000000000511', 20),
  (4,  '00000000-0000-4000-8000-000000000512', 30),
  (5,  '00000000-0000-4000-8000-000000000513', 10),
  (5,  '00000000-0000-4000-8000-000000000514', 20),
  (5,  '00000000-0000-4000-8000-000000000515', 30),
  (6,  '00000000-0000-4000-8000-000000000516', 10),
  (6,  '00000000-0000-4000-8000-000000000517', 20),
  (6,  '00000000-0000-4000-8000-000000000518', 30),
  (7,  '00000000-0000-4000-8000-000000000519', 10),
  (7,  '00000000-0000-4000-8000-000000000520', 20),
  (7,  '00000000-0000-4000-8000-000000000521', 30),
  (8,  '00000000-0000-4000-8000-000000000522', 10),
  (8,  '00000000-0000-4000-8000-000000000523', 20),
  (9,  '00000000-0000-4000-8000-000000000524', 10),
  (9,  '00000000-0000-4000-8000-000000000525', 20),
  (10, '00000000-0000-4000-8000-000000000526', 10),
  (10, '00000000-0000-4000-8000-000000000527', 20),
  (11, '00000000-0000-4000-8000-000000000528', 10),
  (11, '00000000-0000-4000-8000-000000000529', 20),
  (12, '00000000-0000-4000-8000-000000000530', 10),
  (12, '00000000-0000-4000-8000-000000000531', 20),
  (13, '00000000-0000-4000-8000-000000000532', 10),
  (13, '00000000-0000-4000-8000-000000000533', 20),
  (14, '00000000-0000-4000-8000-000000000534', 10),
  (14, '00000000-0000-4000-8000-000000000535', 20),
  (14, '00000000-0000-4000-8000-000000000536', 30),
  (15, '00000000-0000-4000-8000-000000000537', 10),
  (15, '00000000-0000-4000-8000-000000000538', 20),
  (15, '00000000-0000-4000-8000-000000000539', 30)
on conflict (step_number, product_id) do nothing;
