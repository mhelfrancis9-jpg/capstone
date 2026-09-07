-- =============================================================================
-- LnR Cycle Center — Bike Builder seed (idempotent)
--
-- Run this in the Supabase SQL Editor to populate:
--   1. bike_builder_steps  (15 step definitions)
--   2. categories          (15 builder categories)
--
-- NO products are inserted here. Products are managed entirely by the Admin
-- through the Admin Dashboard. Any product placed under a builder category
-- (Frameset, Handlebar, Stem, etc.) automatically appears in the customer
-- Bike Builder.
--
-- Safe to re-run (uses ON CONFLICT DO NOTHING / DO UPDATE).
-- =============================================================================

-- Ensure the set_updated_at() trigger function exists
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Ensure the trigger exists on bike_builder_steps (idempotent: no error if it already exists)
DO $$
BEGIN
  DROP TRIGGER IF EXISTS bike_builder_steps_set_updated_at ON public.bike_builder_steps;
  CREATE TRIGGER bike_builder_steps_set_updated_at
    BEFORE UPDATE ON public.bike_builder_steps
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 1. Seed 15 builder steps
-- =============================================================================
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



-- =============================================================================
-- 2. Seed 15 builder categories
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

-- =============================================================================
-- 3. Verification
-- =============================================================================
-- select 'bike_builder_steps' as tbl, count(*) as rows from public.bike_builder_steps
-- union all
-- select 'categories (builder)', count(*) from public.categories
--   where slug in ('frameset','handlebar','stem','seatpost','saddle','wheelset',
--     'tires','front-derailleur','rear-derailleur','crankset','cassette',
--     'chain','brakeset','rotors','pedals');
