-- =============================================================================
-- LnR Cycle Center — Seed: customers + orders + order items + status history
-- Mirrors the previous mock Orders / Customers managers.
-- =============================================================================

insert into public.customers (id, full_name, email, phone, address, notes, status)
values
  ('00000000-0000-4000-8000-000000000501', 'Juan Dela Cruz',   'juan.delacruz@email.com',   '+63 912 345 6789', '123 Main St, Manila, Philippines',        'Regular customer', 'active'),
  ('00000000-0000-4000-8000-000000000502', 'Maria Santos',     'maria.santos@email.com',    '+63 917 555 0123', '456 Mabini St, Quezon City, Philippines', null,               'active'),
  ('00000000-0000-4000-8000-000000000503', 'Pedro Garcia',     'pedro.garcia@email.com',    '+63 918 987 6543', '789 Rizal Ave, Cebu City, Philippines',   null,               'active'),
  ('00000000-0000-4000-8000-000000000504', 'Ana Reyes',        'ana.reyes@email.com',       '+63 915 111 2233', '101 Bonifacio St, Davao City, Philippines', null,              'active'),
  ('00000000-0000-4000-8000-000000000505', 'Carlos Mendoza',   'carlos.mendoza@email.com',  '+63 916 222 3344', '202 Luna St, Iloilo City, Philippines',    null,               'active'),
  ('00000000-0000-4000-8000-000000000506', 'Lisa Torres',      'lisa.torres@email.com',     '+63 919 333 4455', '303 Aguinaldo St, Baguio City, Philippines', null,              'active'),
  ('00000000-0000-4000-8000-000000000507', 'Roberto Cruz',     'roberto.cruz@email.com',    '+63 920 444 5566', '404 Magsaysay St, Cagayan de Oro, Philippines', null,          'active'),
  ('00000000-0000-4000-8000-000000000508', 'Sofia Ramos',      'sofia.ramos@email.com',     '+63 921 555 6677', '505 Katipunan St, Tabaco City, Albay, Philippines', null,       'active')
on conflict (id) do nothing;

-- Orders ----------------------------------------------------------------------
insert into public.orders (
  id, order_number, customer_id, customer_name, customer_email, customer_phone,
  shipping_address, subtotal, shipping_fee, discount, total,
  payment_method, payment_status, status, payment_reference, created_at
)
values
  ('00000000-0000-4000-8000-000000000601', 'ORD-2024-0001', '00000000-0000-4000-8000-000000000501',
   'Juan Dela Cruz', 'juan@email.com', '+63 912 345 6789',
   '123 Main St, Manila, Philippines', 15000.00, 0, 0, 15000.00,
   'gcash', 'pending', 'pending', null, '2024-01-15 09:12:00+00'),
  ('00000000-0000-4000-8000-000000000602', 'ORD-2024-0002', '00000000-0000-4000-8000-000000000502',
   'Maria Santos', 'maria@email.com', '+63 917 555 0123',
   '456 Mabini St, Quezon City, Philippines', 12000.00, 0, 0, 12000.00,
   'cod', 'pending', 'pending', null, '2024-01-16 10:05:00+00'),
  ('00000000-0000-4000-8000-000000000603', 'ORD-2024-0003', '00000000-0000-4000-8000-000000000503',
   'Pedro Garcia', 'pedro@email.com', '+63 918 987 6543',
   '789 Rizal Ave, Cebu City, Philippines', 16000.00, 0, 0, 16000.00,
   'cod', 'pending', 'shipping', null, '2024-01-14 14:30:00+00'),
  ('00000000-0000-4000-8000-000000000604', 'ORD-2024-0004', '00000000-0000-4000-8000-000000000504',
   'Ana Reyes', 'ana@email.com', '+63 915 111 2233',
   '101 Bonifacio St, Davao City, Philippines', 25000.00, 0, 0, 25000.00,
   'gcash', 'paid', 'completed', 'GC1234567890', '2024-01-10 08:45:00+00'),
  ('00000000-0000-4000-8000-000000000605', 'ORD-2024-0005', '00000000-0000-4000-8000-000000000505',
   'Carlos Mendoza', 'carlos@email.com', '+63 916 222 3344',
   '202 Luna St, Iloilo City, Philippines', 9500.00, 0, 0, 9500.00,
   'gcash', 'pending', 'pending', null, '2024-01-17 11:20:00+00'),
  ('00000000-0000-4000-8000-000000000606', 'ORD-2024-0006', '00000000-0000-4000-8000-000000000506',
   'Lisa Torres', 'lisa@email.com', '+63 919 333 4455',
   '303 Aguinaldo St, Baguio City, Philippines', 7800.00, 0, 0, 7800.00,
   'cod', 'pending', 'shipping', null, '2024-01-13 16:10:00+00'),
  ('00000000-0000-4000-8000-000000000607', 'ORD-2024-0007', '00000000-0000-4000-8000-000000000507',
   'Roberto Cruz', 'roberto@email.com', '+63 920 444 5566',
   '404 Magsaysay St, Cagayan de Oro, Philippines', 13500.00, 0, 0, 13500.00,
   'gcash', 'paid', 'completed', 'GC9876543210', '2024-01-09 13:00:00+00'),
  ('00000000-0000-4000-8000-000000000608', 'ORD-2024-0008', '00000000-0000-4000-8000-000000000508',
   'Sofia Ramos', 'sofia@email.com', '+63 921 555 6677',
   '505 Katipunan St, Tabaco City, Albay, Philippines', 9000.00, 0, 0, 9000.00,
   'cod', 'pending', 'pending', null, '2024-01-17 15:40:00+00')
on conflict (id) do nothing;

-- Order items ----------------------------------------------------------------
insert into public.order_items (
  id, order_id, product_id, product_variant_id, product_name, size, color,
  unit_price, quantity, line_total
)
values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000601',
   '00000000-0000-4000-8000-000000000214', null, 'Mountain Bike Pro', null, null,
   15000.00, 1, 15000.00),
  ('00000000-0000-4000-8000-000000000702', '00000000-0000-4000-8000-000000000602',
   '00000000-0000-4000-8000-000000000213', '00000000-0000-4000-8000-000000000402',
   'Road Bike Elite', 'S', 'Black', 12000.00, 1, 12000.00),
  ('00000000-0000-4000-8000-000000000703', '00000000-0000-4000-8000-000000000603',
   '00000000-0000-4000-8000-000000000215', null, 'City Cruiser', null, null,
   8000.00, 2, 16000.00),
  ('00000000-0000-4000-8000-000000000704', '00000000-0000-4000-8000-000000000604',
   '00000000-0000-4000-8000-000000000216', null, 'Electric Bike', null, null,
   25000.00, 1, 25000.00),
  ('00000000-0000-4000-8000-000000000705', '00000000-0000-4000-8000-000000000605',
   '00000000-0000-4000-8000-000000000217', null, 'BMX Freestyle', null, null,
   9500.00, 1, 9500.00),
  ('00000000-0000-4000-8000-000000000706', '00000000-0000-4000-8000-000000000606',
   '00000000-0000-4000-8000-000000000218', null, 'Folding Bike', null, null,
   7800.00, 1, 7800.00),
  ('00000000-0000-4000-8000-000000000707', '00000000-0000-4000-8000-000000000607',
   '00000000-0000-4000-8000-000000000219', null, 'Hybrid Bike', null, null,
   13500.00, 1, 13500.00),
  ('00000000-0000-4000-8000-000000000708', '00000000-0000-4000-8000-000000000608',
   '00000000-0000-4000-8000-000000000220', null, 'Kids Bike', null, null,
   4500.00, 2, 9000.00)
on conflict (id) do nothing;

-- Order status history --------------------------------------------------------
insert into public.order_status_history (id, order_id, status, note, created_by, created_at)
values
  ('00000000-0000-4000-8000-000000000801', '00000000-0000-4000-8000-000000000601', 'pending', 'Order placed', null, '2024-01-15 09:12:00+00'),
  ('00000000-0000-4000-8000-000000000802', '00000000-0000-4000-8000-000000000602', 'pending', 'Order placed', null, '2024-01-16 10:05:00+00'),
  ('00000000-0000-4000-8000-000000000803', '00000000-0000-4000-8000-000000000603', 'pending', 'Order placed', null, '2024-01-14 14:30:00+00'),
  ('00000000-0000-4000-8000-000000000804', '00000000-0000-4000-8000-000000000603', 'shipping', 'Order shipped', null, '2024-01-15 08:00:00+00'),
  ('00000000-0000-4000-8000-000000000805', '00000000-0000-4000-8000-000000000604', 'pending', 'Order placed', null, '2024-01-10 08:45:00+00'),
  ('00000000-0000-4000-8000-000000000806', '00000000-0000-4000-8000-000000000604', 'completed', 'Payment verified, order completed', null, '2024-01-12 10:00:00+00'),
  ('00000000-0000-4000-8000-000000000807', '00000000-0000-4000-8000-000000000605', 'pending', 'Order placed', null, '2024-01-17 11:20:00+00'),
  ('00000000-0000-4000-8000-000000000808', '00000000-0000-4000-8000-000000000606', 'pending', 'Order placed', null, '2024-01-13 16:10:00+00'),
  ('00000000-0000-4000-8000-000000000809', '00000000-0000-4000-8000-000000000606', 'shipping', 'Order shipped', null, '2024-01-14 09:00:00+00'),
  ('00000000-0000-4000-8000-000000000810', '00000000-0000-4000-8000-000000000607', 'pending', 'Order placed', null, '2024-01-09 13:00:00+00'),
  ('00000000-0000-4000-8000-000000000811', '00000000-0000-4000-8000-000000000607', 'completed', 'Payment verified, order completed', null, '2024-01-11 09:30:00+00'),
  ('00000000-0000-4000-8000-000000000812', '00000000-0000-4000-8000-000000000608', 'pending', 'Order placed', null, '2024-01-17 15:40:00+00')
on conflict (id) do nothing;

