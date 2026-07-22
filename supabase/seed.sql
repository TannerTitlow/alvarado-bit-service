-- Local development fixtures only. These rows are safe to recreate with `supabase db reset`.

INSERT INTO public.contact_submissions (id, created_at, name, email, phone, message, status)
VALUES
  ('10000000-0000-4000-8000-000000000001', '2026-07-01T14:30:00Z', 'Morgan Hayes', 'morgan.hayes@example.test', '817-555-0101', 'We need availability and pricing for 8 3/4 inch PDC bits for a North Texas water well project.', 'new'),
  ('10000000-0000-4000-8000-000000000002', '2026-06-30T09:15:00Z', 'Drew Bennett', 'drew.bennett@example.test', '432-555-0114', 'Please send a quote for two remanufactured bits and delivery to Odessa.', 'in_progress'),
  ('10000000-0000-4000-8000-000000000003', '2026-06-27T18:45:00Z', 'Casey Nguyen', 'casey.nguyen@example.test', NULL, 'Looking for a replacement bit for a 6 1/2 inch directional drilling job.', 'completed'),
  ('10000000-0000-4000-8000-000000000004', '2026-06-20T11:00:00Z', 'Jordan Patel', 'jordan.patel@example.test', '214-555-0192', 'Can someone call to discuss your inventory program?', 'archived')
ON CONFLICT (id) DO UPDATE SET
  created_at = EXCLUDED.created_at,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  message = EXCLUDED.message,
  status = EXCLUDED.status;

INSERT INTO public.drill_bit_models (
  id, display_name, nominal_size, bit_type, product_line, iadc_code, connection,
  list_price, description, image_url, active, sku, manufacturer_part_number,
  circulation_type, nominal_size_in, connection_size_in, connection_type,
  blade_count, cutter_count, body_material, manufacturer_specs
)
VALUES
  (1001, '6 1/2 in. PDC Performance', '6 1/2', 'PDC', 'Performance', 'M323', '4 1/2 IF', 4850.00, 'Versatile PDC bit for medium formations and directional work.', NULL, true, 'ABS-PDC-650-PERF', 'PDC-650-4B', 'standard', 6.500, 4.500, 'IF', 5, 35, 'Steel body', '{"formation":"medium","nozzle_count":6,"recommended_rpm":"80-180"}'::jsonb),
  (1002, '8 3/4 in. PDC Heavy Duty', '8 3/4', 'PDC', 'Heavy Duty', 'M423', '6 5/8 REG', 7350.00, 'Heavy-duty PDC configuration for demanding oilfield intervals.', NULL, true, 'ABS-PDC-875-HD', 'PDC-875-6B', 'standard', 8.750, 6.625, 'REG', 6, 48, 'Matrix body', '{"formation":"medium-hard","nozzle_count":7,"recommended_rpm":"60-140"}'::jsonb),
  (1003, '12 1/4 in. Tricone Mill Tooth', '12 1/4', 'Tricone', 'Mill Tooth', '117', '6 5/8 REG', 6200.00, 'Reliable mill-tooth tricone for soft to medium formations.', NULL, true, 'ABS-TC-1225-MT', 'TC-1225-117', 'standard', 12.250, 6.625, 'REG', NULL, NULL, 'Steel tooth', '{"formation":"soft-medium","bearing":"sealed journal"}'::jsonb),
  (1004, '9 7/8 in. Reverse Circulation PDC', '9 7/8', 'PDC', 'Reverse Circulation', 'M223', '6 5/8 REG', 8100.00, 'Reverse-circulation PDC bit for applications requiring improved cuttings removal.', NULL, true, 'ABS-RC-9875-PDC', 'RC-9875-5B', 'reverse_circulation', 9.875, 6.625, 'REG', 5, 40, 'Steel body', '{"formation":"soft-medium","nozzle_count":5,"flow_direction":"reverse"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  nominal_size = EXCLUDED.nominal_size,
  bit_type = EXCLUDED.bit_type,
  product_line = EXCLUDED.product_line,
  iadc_code = EXCLUDED.iadc_code,
  connection = EXCLUDED.connection,
  list_price = EXCLUDED.list_price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  active = EXCLUDED.active,
  sku = EXCLUDED.sku,
  manufacturer_part_number = EXCLUDED.manufacturer_part_number,
  circulation_type = EXCLUDED.circulation_type,
  nominal_size_in = EXCLUDED.nominal_size_in,
  connection_size_in = EXCLUDED.connection_size_in,
  connection_type = EXCLUDED.connection_type,
  blade_count = EXCLUDED.blade_count,
  cutter_count = EXCLUDED.cutter_count,
  body_material = EXCLUDED.body_material,
  manufacturer_specs = EXCLUDED.manufacturer_specs;

INSERT INTO public.inventory_units (id, model_id, asset_tag, status, condition, location, notes)
VALUES
  (2001, 1001, 'TEST-650-001', 'available', 'new', 'Texas main shop', 'Ready for dispatch'),
  (2002, 1001, 'TEST-650-002', 'reserved', 'remanufactured', 'Texas main shop', 'Reserved for water-well customer'),
  (2003, 1002, 'TEST-875-001', 'available', 'new', 'Texas main shop', NULL),
  (2004, 1002, 'TEST-875-002', 'in_repair', 'used', 'Texas main shop', 'Awaiting cutter inspection'),
  (2005, 1003, 'TEST-1225-001', 'sold', 'used', 'Georgia field stock', 'Retained for sales history testing'),
  (2006, 1003, 'TEST-1225-002', 'scrapped', 'used', 'Texas main shop', 'Retained for status filter testing'),
  (2007, 1004, 'TEST-RC-001', 'available', 'new', 'Georgia field stock', 'Reverse-circulation demonstration unit'),
  (2008, 1004, NULL, 'available', 'unknown', 'Incoming inspection', 'Unassigned asset tag')
ON CONFLICT (id) DO UPDATE SET
  model_id = EXCLUDED.model_id,
  asset_tag = EXCLUDED.asset_tag,
  status = EXCLUDED.status,
  condition = EXCLUDED.condition,
  location = EXCLUDED.location,
  notes = EXCLUDED.notes;

INSERT INTO public.featured_items (id, type, media_url, description, order_index)
VALUES
  ('20000000-0000-4000-8000-000000000001', 'image', 'field-operations.svg', 'Local fixture: PDC drilling operations', 0),
  ('20000000-0000-4000-8000-000000000002', 'image', 'field-inventory.svg', 'Local fixture: inventory ready for dispatch', 1)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  media_url = EXCLUDED.media_url,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

SELECT setval('public.drill_bit_models_id_seq', (SELECT max(id) FROM public.drill_bit_models));
SELECT setval('public.inventory_units_id_seq', (SELECT max(id) FROM public.inventory_units));
