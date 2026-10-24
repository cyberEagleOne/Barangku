-- ==============================================================================
-- Barangku Initial Seed Data
-- ==============================================================================

-- 1. Insert Initial Users (password is 'password123', hashed with bcrypt)
-- Hash generated for 'password123': $2b$10$ErKPCsv38cdZ90CeFoPo7.2OMQzHHfgNCiNbYxtav.cSb0lu8rngK
INSERT INTO users (id, name, email, phone, password_hash, role)
VALUES 
    ('00000000-0000-0000-0000-000000000099', 'Demo Pengguna', 'demo@gmail.com', '0812-9999-0001', '$2b$10$ErKPCsv38cdZ90CeFoPo7.2OMQzHHfgNCiNbYxtav.cSb0lu8rngK', 'pelanggan'),
    ('00000000-0000-0000-0000-000000000001', 'Rina Ayu', 'rina@email.com', '0812-0000-0001', '$2b$10$ErKPCsv38cdZ90CeFoPo7.2OMQzHHfgNCiNbYxtav.cSb0lu8rngK', 'pelanggan'),
    ('00000000-0000-0000-0000-000000000002', 'Mas Dedi Servis', 'dedi@barangku.id', '0812-0000-0000', '$2b$10$ErKPCsv38cdZ90CeFoPo7.2OMQzHHfgNCiNbYxtav.cSb0lu8rngK', 'tukang')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Technicians
INSERT INTO technicians (id, user_id, name, area, address, latitude, longitude, devices, rating, review_count, min_price, max_price, status, verified, photo_url)
VALUES 
(
    1,
    '00000000-0000-0000-0000-000000000002',
    'Mas Dedi Servis',
    'Karawaci',
    'Jl. Imam Bonjol No. 24, Karawaci, Kota Tangerang',
    -6.1950,
    106.6150,
    ARRAY['Laptop'],
    4.8,
    128,
    150000,
    450000,
    'open',
    true,
    'https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80'
),
(
    2,
    NULL,
    'Kang Arif Laptop',
    'Cikokol',
    'Jl. Teuku Umar No. 18, Cikokol, Kota Tangerang',
    -6.1850,
    106.6400,
    ARRAY['Laptop'],
    4.9,
    96,
    175000,
    600000,
    'open',
    true,
    'https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80'
),
(
    3,
    NULL,
    'Bengkel HP Bu Sari',
    'Bencongan',
    'Jl. Borobudur No. 12, Bencongan, Kelapa Dua, Tangerang',
    -6.2150,
    106.5950,
    ARRAY['HP'],
    4.7,
    84,
    100000,
    350000,
    'busy',
    true,
    'https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80'
),
(
    4,
    NULL,
    'Pak Agus Elektronik',
    'Kelapa Dua',
    'Jl. Raya Kelapa Dua No. 35, Kelapa Dua, Tangerang',
    -6.2300,
    106.6050,
    ARRAY['Laptop', 'HP'],
    4.6,
    57,
    125000,
    500000,
    'open',
    false,
    'https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80'
),
(
    5,
    NULL,
    'Rizky Servis HP',
    'Cibodas',
    'Jl. Prambanan Raya No. 8, Cibodas, Kota Tangerang',
    -6.1800,
    106.5850,
    ARRAY['HP'],
    4.8,
    112,
    80000,
    400000,
    'closed',
    true,
    'https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80'
),
(
    6,
    NULL,
    'Bima Komputer',
    'Gading Serpong',
    'Jl. Boulevard Gading Serpong No. 16, Tangerang',
    -6.2450,
    106.6280,
    ARRAY['Laptop'],
    4.9,
    73,
    200000,
    750000,
    'busy',
    true,
    'https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80'
),
(
    7,
    NULL,
    'BSD Gadget Care',
    'BSD City',
    'Ruko Golden Boulevard Blok W2 No. 15, BSD City, Serpong',
    -6.3015,
    106.6535,
    ARRAY['Laptop', 'HP'],
    4.9,
    64,
    150000,
    650000,
    'open',
    true,
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Populate geometry column if PostGIS extension exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
        UPDATE technicians SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE location IS NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Initial Reviews
INSERT INTO reviews (technician_id, reviewer_name, rating, review_text, service)
VALUES 
    (7, 'Kevin Sanjaya', 5, 'Servis laptop di BSD yang terpercaya banget. Ganti pasta dan bersihin kipas cepat, langsung dingin lagi.', 'Servis Laptop'),
    (7, 'Amanda Putri', 5, 'Ganti layar HP di sini rapi banget dan bergaransi. Recommended buat warga BSD!', 'Ganti Layar HP'),
    (1, 'Rina Ayu', 5, 'Laptop yang tadinya mati total akhirnya nyala lagi. Mas Dedi jelasin kerusakannya dengan sabar, biayanya juga sesuai perkiraan. Makasih ya!', 'Servis laptop mati total'),
    (1, 'Andi Pratama', 5, 'Nggak langsung disuruh ganti komponen. Dicek dulu, terus dikasih pilihan yang sesuai budget. Senang nemu tukang yang jujur dekat rumah.', 'Ganti baterai laptop'),
    (1, 'Dewi Lestari', 4, 'Pengerjaannya rapi. Sempat mundur sehari karena antrean, tapi dikabarin dulu jadi nggak bingung nunggu.', 'Pasang ulang sistem'),
    (1, 'Fajar Ramadhan', 5, 'Responsnya ramah dan penjelasannya gampang dimengerti. Barang dites bareng pas diambil. Sekarang sudah lancar lagi.', 'Bersihkan laptop'),
    (1, 'Siti Nurhaliza', 5, 'Harga sesuai kesepakatan, nggak ada biaya tambahan mendadak. Terima kasih sudah bantu!', 'Servis laptop'),
    (1, 'Bayu Saputra', 5, 'Lokasinya gampang dicari. Proses pengecekan jelas dan dikasih tahu dulu sebelum diperbaiki.', 'Servis laptop')
ON CONFLICT DO NOTHING;

-- 4. Initial Orders
INSERT INTO orders (
    code, customer_id, customer_name, customer_phone, technician_id,
    device, model, problem, notes, visit_date, visit_time,
    status, estimate_min, estimate_max, message, rejected, incoming
)
VALUES
(
    'BRK-2026-0142',
    '00000000-0000-0000-0000-000000000001',
    'Rina',
    '0812-0000-0001',
    1,
    'Laptop',
    'ASUS VivoBook 14',
    'Baterai drop',
    'Baterai drop. Kontak pelanggan: Rina (0812-0000-0001)',
    '2026-10-20',
    '09:00:00',
    2,
    150000,
    350000,
    'Laptop kamu sudah kami cek. Yang rusak baterainya, bisa diganti hari ini juga.',
    false,
    false
),
(
    'BRK-2026-0138',
    NULL,
    'Budi',
    '0812-0000-0002',
    3,
    'HP',
    'Samsung Galaxy A54',
    'Layar pecah',
    'Layar pecah. Kontak pelanggan: Budi (0812-0000-0002)',
    '2026-10-19',
    '10:00:00',
    4,
    300000,
    450000,
    'Layar HP sudah diganti dan dites sentuhannya. Normal semua!',
    false,
    false
),
(
    'BRK-2026-0155',
    NULL,
    'Fajar',
    '0812-0000-0003',
    1,
    'Laptop',
    'Lenovo IdeaPad Slim 3',
    'Mati total setelah kena air',
    'Mati total setelah kena air. Kontak pelanggan: Fajar (0812-0000-0003)',
    '2026-10-21',
    '11:00:00',
    0,
    200000,
    500000,
    'Pesanan masuk, menunggu konfirmasi tukang.',
    false,
    true
),
(
    'BRK-2026-0159',
    NULL,
    'Siti',
    '0812-0000-0004',
    1,
    'HP',
    'Xiaomi Redmi Note 12',
    'Konektor charger longgar',
    'Konektor charger longgar. Kontak pelanggan: Siti (0812-0000-0004)',
    '2026-10-21',
    '14:30:00',
    0,
    80000,
    150000,
    'Pesanan masuk, menunggu konfirmasi tukang.',
    false,
    true
)
ON CONFLICT (code) DO NOTHING;
