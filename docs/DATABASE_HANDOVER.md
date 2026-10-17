# DOKUMENTASI HANDOVER BACKEND & PANDUAN SISTEM DATABASE BARANGKU

Dokumen ini disusun untuk rekan pengembang (*Database Engineer / Backend Developer*) sebagai panduan resmi mengenai arsitektur backend yang telah dibangun, perubahan terbaru yang telah diimplementasikan, struktur skema database PostgreSQL + PostGIS, serta langkah-langkah yang perlu dilakukan untuk melanjutkan dan menyempurnakan sistem database.

---

## 1. Ringkasan Proyek & Arsitektur Backend

**Barangku** adalah platform web penyedia jasa servis barang elektronik (Laptop & HP) terpercaya di kawasan Tangerang Raya. Platform ini menghubungkan pelanggan ke tukang servis lokal terdekat dengan prinsip transparansi biaya, perbandingan jarak akurat, estimasi harga jelas, serta pelacakan progres perbaikan secara *real-time*.

### Arsitektur Backend:
- **Runtime & Bahasa**: Node.js (v20+ / v22) & TypeScript 5.7.
- **Web Framework**: Express.js (berjalan pada port `5000` mandiri, atau terhubung otomatis melalui Vite proxy pada port `8443`).
- **Autentikasi**: JSON Web Token (JWT) dengan *secure cookie* / header `Authorization: Bearer <token>`, dan enkripsi password menggunakan `bcryptjs`.
- **Database Engine**: PostgreSQL 15+ dengan ekstensi spasial **PostGIS** dan **pgcrypto**.
- **Mekanisme Dual-Mode (Resilience)**:
  - Backend dirancang dengan **koneksi cerdas ber-fallback** di [`server/db/pool.ts`](file:///e:/Project_Barangku/Barangku/server/db/pool.ts).
  - Jika PostgreSQL belum dinyalakan atau variabel lingkungan belum diisi, backend secara otomatis beralih ke *in-memory store* ([`server/services/dbService.ts`](file:///e:/Project_Barangku/Barangku/server/services/dbService.ts)) sehingga aplikasi web tetap dapat diuji coba tanpa hambatan (*zero downtime development*).
  - Begitu variabel `DATABASE_URL` diaktifkan dan database tersambung, backend otomatis mengeksekusi query database relasional secara penuh.

---

## 2. Fitur Backend yang Telah Selesai Dikerjakan

Seluruh rute API utama telah selesai diimplementasikan dan telah teruji kompatibilitasnya dengan antarmuka frontend:

| Modul | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **Kesehatan Sistem** | `GET /api/health` | Memeriksa status server dan status koneksi PostgreSQL |
| **Autentikasi** | `POST /api/auth/register` | Mendaftarkan akun pelanggan baru atau tukang |
| | `POST /api/auth/login` | Masuk menggunakan email / nomor WhatsApp & kata sandi |
| | `GET /api/auth/me` | Mengambil profil pengguna yang sedang login melalui token |
| | `POST /api/auth/logout` | Menghapus sesi / cookie autentikasi |
| **Teknisi & Toko** | `GET /api/technicians` | Mencari daftar bengkel dengan filter perangkat, urutan jarak terdekat, rating, dan filter status |
| | `GET /api/technicians/:id` | Mengambil data detail profil bengkel servis |
| | `PATCH /api/technicians/status` | Mengubah status operasional toko (`open`, `busy`, `closed`) khusus teknisi |
| **Pesanan / Order** | `POST /api/orders` | Membuat pesanan servis baru dengan kode booking unik (format `BRK-YYYY-XXXX`) |
| | `GET /api/orders/:code` | Mengambil status dan riwayat tahapan perbaikan berdasarkan kode booking |
| | `GET /api/orders/my/list` | Mengambil seluruh daftar pesanan milik pelanggan yang sedang login |
| | `GET /api/orders/technician/list` | Mengambil daftar pesanan masuk untuk teknisi yang sedang login |
| | `PATCH /api/orders/:code/status` | Memperbarui tahapan status servis (0: Menunggu Konfirmasi s/d 4: Selesai / -1: Dibatalkan) beserta catatan log riwayat |
| **Ulasan** | `GET /api/reviews/featured` | Mengambil ulasan unggulan untuk ditampilkan pada Beranda |
| | `GET /api/reviews/technician/:id`| Mengambil daftar ulasan untuk teknisi tertentu |

---

## 3. Rangkuman Perubahan Keseluruhan (Full Project Changelog & Architecture Evolution)

Berikut adalah rekapitulasi **keseluruhan perubahan dan evolusi sistem** dari awal proyek (yang semula hanya berupa mockup frontend statis berbasis data dummy di browser) hingga bertransformasi menjadi arsitektur full-stack yang siap diintegrasikan dengan database riil:

### A. Transformasi Arsitektur: Dari Mock Frontend Menjadi Full-Stack
1. **Pembangunan Server Backend Mandiri (`server/`)**:
   - Membangun server Express.js + TypeScript terpisah yang dapat dijalankan secara mandiri (`npm run server` di port `5000`) maupun terintegrasi otomatis dengan Vite dev server (`npm run dev` di port `8443` via [`server/vitePlugin.ts`](file:///e:/Project_Barangku/Barangku/server/vitePlugin.ts)).
   - Memisahkan logika aplikasi ke dalam struktur modular: rute (`server/routes/`), layanan data layer (`server/services/`), middleware keamanan (`server/middleware/`), serta skema database (`server/db/`).
2. **Arsitektur Dual-Mode (PostgreSQL + In-Memory Fallback)**:
   - Dibuat layer abstraksi data [`server/services/dbService.ts`](file:///e:/Project_Barangku/Barangku/server/services/dbService.ts) dan connection pool [`server/db/pool.ts`](file:///e:/Project_Barangku/Barangku/server/db/pool.ts).
   - Backend mampu mendeteksi ketersediaan database secara dinamis. Jika PostgreSQL belum tersambung, backend otomatis menggunakan in-memory store tanpa crash (*zero-downtime developer experience*).
3. **Penyusunan Skema Relasional & Seeding Data**:
   - Merancang skema PostgreSQL lengkap dengan tipe ENUM, tabel relasional, constraint foreign key, dan ekstensi spatial PostGIS di [`server/db/schema.sql`](file:///e:/Project_Barangku/Barangku/server/db/schema.sql).
   - Menyiapkan data awal bengkel servis di Tangerang beserta koordinat riil dan ulasan pelanggan di [`server/db/seed.sql`](file:///e:/Project_Barangku/Barangku/server/db/seed.sql).
4. **Migrasi Frontend API Client (`src/api/`)**:
   - Mengubah seluruh pemanggilan data di frontend dari semula membaca objek statis lokal (`mockData.ts`) menjadi HTTP request ke endpoint backend REST API via [`src/api/client.ts`](file:///e:/Project_Barangku/Barangku/src/api/client.ts) dengan dukungan kredensial cookie & JWT.

### B. Autentikasi, Otorisasi, dan Manajemen Peran (Roles)
1. **Sistem Login Ganda & Keamanan Password**:
   - Pelanggan dan teknisi dapat mendaftar dan login menggunakan **email** maupun **nomor telepon/WhatsApp**.
   - Password disimpan dalam bentuk hash terenkripsi menggunakan algoritma `bcryptjs` (salt rounds: 10).
2. **Manajemen Sesi dengan JWT**:
   - Mengimplementasikan token JWT dengan masa aktif 7 hari yang disimpan dalam cookie HttpOnly yang aman dan header `Authorization: Bearer`.
3. **Proteksi Rute Frontend Berdasarkan Peran (`role`)**:
   - Membedakan alur pengguna `pelanggan` dan `tukang`.
   - Mengamankan rute transaksi (`#pesan/:id`, `#lacak/:code`, `#pesanan-saya`, `#profil`) agar mewajibkan login.
   - Mengamankan portal teknisi (`#dashboard-tukang`, `#pesanan-tukang/:code`) dengan validasi hak akses. Jika akun pelanggan mencoba membuka rute ini, sistem menampilkan layar penolakan akses khusus yang terarah.
   - Menyediakan fitur upgrade akun pelanggan menjadi mitra teknisi di `#daftar-tukang`.

### C. Siklus Hidup Pemesanan (Order Lifecycle) & Pelacakan Real-Time
1. **Alur Pemesanan Servis Dinamis (`#pesan/:id`)**:
   - Formulir pemesanan terhubung langsung ke database untuk menyimpan rincian keluhan, merk & tipe perangkat, jadwal kunjungan, serta catatan pelanggan.
   - Menghasilkan kode pelacakan unik berformat `BRK-YYYY-XXXX` secara otomatis.
2. **Pelacakan Transparan 5 Tahapan (`#lacak/:code`)**:
   - Menyediakan visualisasi progres servis: (0) Menunggu Konfirmasi, (1) Pesanan Diterima, (2) Pengecekan, (3) Pengerjaan, (4) Selesai / Siap Diambil, serta (-1) Dibatalkan.
   - Menampilkan kartu snapshot teknisi, estimasi biaya, dan rincian kunjungan.
3. **Pencatatan Audit Trail Status (`order_status_logs`)**:
   - Setiap pembaruan status oleh teknisi otomatis tercatat ke dalam tabel riwayat lengkap dengan timestamp dan catatan progres dari teknisi.
4. **Portal Manajemen Teknisi (`#dashboard-tukang`)**:
   - Teknisi dapat menerima atau menolak order masuk, memperbarui estimasi biaya, mengubah status operasional toko (`open`, `busy`, `closed`), dan memantau riwayat pekerjaan servis.

### D. Geolocation GPS, Wilayah Tangerang, dan Perhitungan Jarak
1. **Modul Wilayah Terpadu (`src/locations.ts`)**:
   - Mendefinisikan titik referensi koordinat untuk 9 area utama Tangerang Raya (Karawaci, Cikokol, BSD City, Gading Serpong, Bencongan, Kelapa Dua, Cibodas, Cipondoh, Ciledug).
2. **Perhitungan Jarak Geodesik Akurat**:
   - Menghitung jarak garis lurus (dalam kilometer) antara posisi pengguna (GPS atau kecamatan terpilih) ke masing-masing bengkel menggunakan formula Haversine / PostGIS `ST_Distance`.
   - Angka jarak ditampilkan transparan di kartu teknisi (*contoh: "1,2 km dari kamu"*) dan digunakan sebagai dasar pengurutan (*sorting* terdekat).
3. **Deteksi GPS Cerdas Tanpa Timeout**:
   - Mengganti pemanggilan GPS bawaan browser yang lambat dengan helper dua tahap ([`requestCurrentPosition()`](file:///e:/Project_Barangku/Barangku/src/locations.ts)): mencoba pembacaan cepat berbasis jaringan (~200ms) terlebih dahulu, lalu beralih ke akurasi tinggi jika diperlukan.
   - Menyimpan koordinat GPS terakhir ke `localStorage` ([`saveLocation()`](file:///e:/Project_Barangku/Barangku/src/locations.ts)) dan menyinkronkannya ke parameter URL hash (`?lokasi=GPS&lat=...&lng=...`).
4. **Pencegahan Bug GPS Reset ke Karawaci**:
   - Menghilangkan fallback koordinat Karawaci yang sebelumnya ter-hardcode pada query `lokasi=GPS`.
   - Menjadikan pencarian di Beranda ([src/Home.tsx](file:///e:/Project_Barangku/Barangku/src/Home.tsx)) bersifat `async` untuk menunggu koordinat selesai terbaca, mencegah *race condition* yang memicu fallback ke Karawaci.

### E. Evolusi Visualisasi Peta: Penghapusan Skematik & Transisi ke Leaflet
1. **Penghapusan Total Peta Skematik SVG Statis**:
   - Awalnya sistem memiliki dua mode peta: peta skematik SVG statis (dengan gambar jalan statis seperti *Jl. Imam Bonjol*, blok-blok hardcode, dan persentase CSS `result-pin-1`) dan peta Leaflet.
   - Peta skematik tersebut telah **dihapus secara keseluruhan** bersama tombol toggle-nya, menghilangkan kebingungan pengguna dan menghapus kode hardcode yang tidak diperlukan.
2. **Peta Interaktif Leaflet + OpenStreetMap Sebagai Peta Tunggal**:
   - Seluruh visualisasi peta kini 100% menggunakan Leaflet ([src/MapLeaflet.tsx](file:///e:/Project_Barangku/Barangku/src/MapLeaflet.tsx)).
   - Pin tukang diposisikan secara presisi pada peta sesuai koordinat bujur dan lintang dari database.
   - Posisi pengguna ditandai dengan marker biru pulsing (*"Kamu di sini"*).
3. **Penyelarasan Nomor Urut Pin Peta dengan Daftar Tukang**:
   - Pin di peta menampilkan nomor urut jarak terdekat (`#1`, `#2`, dst.) yang sinkron secara presisi dengan nomor urut kartu di sebelah kiri.
4. **Perbaikan Default Selection Terdekat (Rank #1)**:
   - Menghilangkan hardcode `selected = 1` di [src/App.tsx](file:///e:/Project_Barangku/Barangku/src/App.tsx) yang sebelumnya selalu mengunci Mas Dedi Servis (ID 1 di Karawaci).
   - Diperbarui menjadi dinamis memilih `res[0].id`, sehingga teknisi yang terpilih pertama kali di peta selalu merupakan teknisi nomor 1 paling dekat dari koordinat pengguna.
   - Popup peta disempurnakan: menampilkan label `★ #1 PALING DEKAT DARI KAMU` untuk ranking 1, dan `URUTAN #${rank} (jarak km)` untuk urutan berikutnya.

### F. Penyeragaman Antarmuka Modal Pemilihan Lokasi
1. **Desain Kartu GPS yang Senada**:
   - Tombol "Gunakan Lokasi GPS Saya" diubah dari button biasa di tengah ("beda sendiri") menjadi kartu seragam dengan opsi kecamatan:
     - Badge kotak ikon 32×32 px (ikon `Navigation` untuk GPS, `MapPin` untuk kecamatan).
     - Judul: **Gunakan Lokasi GPS Saya**.
     - Subtitle dinamis: *"Aktif — Menggunakan posisi kamu saat ini"* atau *"Deteksi otomatis posisi perangkat kamu"*.
     - Tanda centang hijau `✓` saat aktif.
   - Karawaci dipastikan tidak pernah tercentang saat GPS sedang aktif.
2. **Penambahan Data Wilayah BSD City**:
   - Menambahkan data bengkel *BSD Gadget Care* (lat: `-6.3015`, lng: `106.6535`) di seed database dan daftar lokasi frontend untuk memastikan pengujian di area BSD City/Tangerang Selatan terbukti akurat.

---

## 4. Struktur Skema Database (PostgreSQL + PostGIS)

File sumber: [`server/db/schema.sql`](file:///e:/Project_Barangku/Barangku/server/db/schema.sql) dan [`server/db/seed.sql`](file:///e:/Project_Barangku/Barangku/server/db/seed.sql).

### Diagram Relasi Antar Tabel (ERD Sederhana):
```
users (id: UUID)
  ├── 1:N ──> orders (customer_id)
  ├── 1:1 ──> technicians (user_id)
  └── 1:N ──> reviews (user_id)

technicians (id: BIGSERIAL)
  ├── 1:N ──> orders (technician_id)
  └── 1:N ──> reviews (technician_id)

orders (id: UUID)
  └── 1:N ──> order_status_logs (order_id)
```

### Rincian Tabel Utama:

#### 1. Tabel `users`
Menyimpan kredensial pengguna (pelanggan dan akun teknisi).
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `name` (VARCHAR(120), Nama lengkap)
- `email` (VARCHAR(255), Unik)
- `phone` (VARCHAR(30), Unik, nomor telepon/WhatsApp)
- `password_hash` (VARCHAR(255), hash bcrypt)
- `role` (`user_role`: `'pelanggan'` atau `'tukang'`)
- `fresh` (BOOLEAN, penanda akun baru)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### 2. Tabel `technicians`
Menyimpan profil workshop/bengkel servis elektronik.
- `id` (BIGSERIAL, Primary Key)
- `user_id` (UUID, Foreign Key ke `users.id`, nullable)
- `name` (VARCHAR(150), Nama bengkel servis)
- `area` (VARCHAR(100), Contoh: `'Karawaci'`, `'Cikokol'`, `'BSD City'`)
- `address` (TEXT, Alamat lengkap fisik)
- `location` (`GEOMETRY(Point, 4326)`, Koordinat PostGIS Point (Bujur, Lintang))
- `latitude` (NUMERIC(10, 7), Nilai lintang desimal)
- `longitude` (NUMERIC(10, 7), Nilai bujur desimal)
- `devices` (TEXT[], Array perangkat yang didukung: `ARRAY['Laptop', 'HP']`)
- `rating` (NUMERIC(2, 1), Rata-rata bintang, misal `4.8`)
- `review_count` (INTEGER, Jumlah ulasan)
- `min_price`, `max_price` (BIGINT, Rentang estimasi ongkos pengerjaan dasar dalam Rupiah)
- `status` (`shop_status`: `'open'`, `'busy'`, `'closed'`)
- `verified` (BOOLEAN, Status verifikasi tim Barangku)
- `photo_url` (TEXT, Tautan foto bengkel)

#### 3. Tabel `orders`
Menyimpan transaksi pemesanan servis dari pelanggan.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `code` (VARCHAR(30), Unik, kode pelacakan publik, contoh: `'BRK-2026-1024'`)
- `customer_id` (UUID, Foreign Key ke `users.id`, nullable untuk guest booking)
- `customer_name` (VARCHAR(120), Nama pemesan)
- `customer_phone` (VARCHAR(30), Nomor kontak)
- `technician_id` (BIGINT, Foreign Key ke `technicians.id`)
- `device` (VARCHAR(50), `'Laptop'` atau `'HP'`)
- `model` (VARCHAR(120), Merk/seri perangkat)
- `problem` (VARCHAR(150), Kategori kendala / keluhan)
- `notes` (TEXT, Deskripsi keluhan tambahan)
- `visit_date` (DATE, Tanggal rencana kunjungan / antar barang)
- `visit_time` (TIME, Waktu rencana kunjungan)
- `status` (SMALLINT, Kode tahapan servis: `0`: Baru, `1`: Diterima, `2`: Pengecekan, `3`: Pengerjaan, `4`: Selesai, `-1`: Ditolak)
- `estimate_min`, `estimate_max` (BIGINT, Estimasi biaya yang disepakati)
- `message` (TEXT, Pesan dari teknisi ke pelanggan)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### 4. Tabel `order_status_logs`
Menyimpan jejak audit (*audit trail*) setiap perubahan status pesanan.
- `id` (BIGSERIAL, Primary Key)
- `order_id` (UUID, Foreign Key ke `orders.id`)
- `previous_status`, `new_status` (SMALLINT)
- `note` (TEXT, Catatan pembaruan, misal: *"Komponen LCD telah diganti, sedang uji coba sistem."*)
- `changed_by` (UUID, Foreign Key ke `users.id`)
- `created_at` (TIMESTAMPTZ)

#### 5. Tabel `reviews`
Menyimpan ulasan dan testimoni pelanggan.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `technician_id` (BIGINT, Foreign Key ke `technicians.id`)
- `user_id` (UUID, Foreign Key ke `users.id`)
- `reviewer_name` (VARCHAR(120))
- `rating` (SMALLINT, Rentang 1 s/d 5)
- `review_text` (TEXT)
- `service` (VARCHAR(100), Jenis perbaikan yang dilakukan)
- `created_at` (TIMESTAMPTZ)

---

## 5. Panduan Instalasi & Menjalankan Database

Bagi rekan pengembang yang akan menyambungkan database lokal atau server staging:

### Langkah 1: Siapkan PostgreSQL & Ekstensi PostGIS
Pastikan PostgreSQL sudah terpasang. Di Windows / Linux / macOS, pastikan modul **PostGIS** telah terpasang.
Buka terminal PostgreSQL (psql):
```sql
CREATE DATABASE barangku;
\c barangku;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### Langkah 2: Konfigurasi File Environment (`.env`)
Salin file [`.env.example`](file:///e:/Project_Barangku/Barangku/.env.example) menjadi `.env` di direktori utama:
```bash
cp .env.example .env
```
Buka file `.env` dan atur URL koneksi database:
```env
# Rekomendasi Format Connection String:
DATABASE_URL=postgresql://postgres:password_kamu@localhost:5432/barangku

# Atau format parameter individual:
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password_kamu
PGDATABASE=barangku
```

### Langkah 3: Jalankan Skema Database
Eksekusi file skema untuk membuat tipe ENUM, tabel, dan indeks spasial:
```bash
# Melalui psql terminal:
psql -U postgres -d barangku -f server/db/schema.sql
```

### Langkah 4: Jalankan Data Awal (Seeding)
Isi database dengan data bengkel di Tangerang, ulasan, serta akun demo default:
```bash
psql -U postgres -d barangku -f server/db/seed.sql
```

> **Akun Demo Default (setelah seeding):**
> - **Pelanggan**: `rina@email.com` / Sandi: `password123`
> - **Teknisi**: `dedi@barangku.id` / Sandi: `password123`

---

## 6. Verifikasi & Pengujian Koneksi Database

1. **Jalankan Server Backend**:
   ```bash
   npm run server
   ```
2. **Cek Log di Terminal**:
   Saat backend menyala, perhatikan pesan log koneksi:
   ```
   [PostgreSQL] Connected successfully to database at 2026-10-17T...
   Backend API server running on http://localhost:5000
   ```
   *(Jika database belum tersambung, server akan otomatis menampilkan pesan fallback in-memory tanpa crash).*

3. **Uji Endpoint Kesehatan**:
   Buka browser atau kirim request curl:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Respon yang diharapkan jika database PostgreSQL aktif:
   ```json
   {
     "status": "ok",
     "database": "postgresql",
     "timestamp": "2026-10-17T..."
   }
   ```

---

## 7. Checklist Tugas Lanjutan untuk Rekan Database Engineer (Next Steps)

Berikut adalah daftar tugas terarah yang direkomendasikan untuk rekan pengembang database:

- [ ] **1. Verifikasi Ekstensi PostGIS di Server**:
  Pastikan query spasial berjalan mulus dengan menjalankan:
  ```sql
  SELECT PostGIS_Version();
  ```
- [ ] **2. Integrasi Query Spasial Terdekat di dbService**:
  Di [`server/services/dbService.ts`](file:///e:/Project_Barangku/Barangku/server/services/dbService.ts), pastikan fungsi `searchTechnicians` saat mode PostgreSQL aktif memanfaatkan operator KNN (*k-nearest neighbors*) `<->` dan fungsi jarak PostGIS:
  ```sql
  SELECT 
    id, name, area, address, devices, rating, review_count as reviews,
    min_price as min, max_price as max, status, verified, photo_url as photo,
    latitude, longitude,
    ST_Distance(
      location, 
      ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography
    ) / 1000 AS distance
  FROM technicians
  ORDER BY location <-> ST_SetSRID(ST_MakePoint($lng, $lat), 4326) ASC;
  ```
- [ ] **3. Implementasi Database Transaction pada Pembuatan Order**:
  Pada fungsi `createOrder`, bungkus penulisan ke tabel `orders` dan penambahan log awal ke tabel `order_status_logs` menggunakan transaksi:
  ```sql
  BEGIN;
  INSERT INTO orders (...) VALUES (...);
  INSERT INTO order_status_logs (...) VALUES (...);
  COMMIT;
  ```
- [ ] **4. Manajemen Migrasi Skema (Opsional / Rekomendasi)**:
  Untuk mempermudah pembaruan skema di masa depan tanpa menghapus data yang ada, pertimbangkan untuk memasang tool migrasi ringan seperti `node-pg-migrate`, `Knex.js`, atau `Prisma`.
- [ ] **5. Backup dan Sanitasi Data Produksi**:
  Menyiapkan script backup otomatis berkala (misal: `pg_dump`) dan aturan retensi log pesanan.

---

## 8. Kontak & Referensi File Terkait

- **Konfigurasi Server & Pool**: [`server/config.ts`](file:///e:/Project_Barangku/Barangku/server/config.ts) & [`server/db/pool.ts`](file:///e:/Project_Barangku/Barangku/server/db/pool.ts)
- **Skema SQL**: [`server/db/schema.sql`](file:///e:/Project_Barangku/Barangku/server/db/schema.sql)
- **Seed Data SQL**: [`server/db/seed.sql`](file:///e:/Project_Barangku/Barangku/server/db/seed.sql)
- **Contoh Environment**: [`.env.example`](file:///e:/Project_Barangku/Barangku/.env.example)
- **Service Data Layer**: [`server/services/dbService.ts`](file:///e:/Project_Barangku/Barangku/server/services/dbService.ts)
- **Spesifikasi Route Frontend & Tipe Data**: [`docs/HANDOFF.md`](file:///e:/Project_Barangku/Barangku/docs/HANDOFF.md)
