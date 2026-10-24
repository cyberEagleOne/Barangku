# barangku

> **Rusak? Benerin dulu, jangan buang.**

Barangku adalah platform web penyedia jasa servis barang elektronik (Laptop & HP) terpercaya di kawasan Tangerang Raya. Platform ini menghubungkan pelanggan ke tukang servis lokal terdekat dengan transparansi biaya, perbandingan jarak akurat (PostGIS), estimasi harga yang jelas, serta pelacakan progres perbaikan secara *real-time*.

---

## 🛠️ Prasyarat Sistem

Sebelum menjalankan proyek, pastikan di komputer Anda sudah terpasang:
- **Node.js** (versi 18, 20, atau lebih baru) & **npm**
- **PostgreSQL** (versi 15+) dengan ekstensi geospasial **PostGIS**

> **Catatan Dual-Mode:** Jika PostgreSQL belum dipasang, proyek tetap dapat dijalankan menggunakan mode *in-memory fallback* otomatis.

---

## 🚀 Langkah Menjalankan Proyek

### 1. Instalasi Dependensi
Buka terminal di folder proyek dan jalankan:
```bash
npm install
```

### 2. Konfigurasi Lingkungan (`.env`)
Salin file template `.env.example` menjadi `.env`:
- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
- **macOS / Linux:**
  ```bash
  cp .env.example .env
  ```

Buka file `.env` dan sesuaikan kata sandi PostgreSQL Anda:
```env
DATABASE_URL=postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/barangku
PGPASSWORD=PASSWORD_POSTGRES_ANDA
```

### 3. Inisialisasi Database & Seeding Data
Jalankan perintah otomatis berikut untuk membuat database, memasang ekstensi PostGIS, tabel skema, dan mengisi data awal (bengkel Tangerang, akun demo, & ulasan):
```bash
npm run db:setup
```

### 4. Menjalankan Aplikasi
Jalankan server pengembangan:
```bash
npm run dev
```
Aplikasi web dapat diakses melalui peramban (browser) di:
👉 **`http://localhost:8443`**

*(Backend Express API sudah terintegrasi langsung di dalamnya melalui middleware Vite).*

---

## 💻 Daftar Perintah CLI (`package.json`)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server aplikasi lengkap (Frontend Vite + Backend Express) di port `8443` |
| `npm run db:setup` | Membuat database `barangku`, tabel relasional, ekstensi PostGIS, serta seeding data awal |
| `npm run db:backup` | Mengekspor snapshot database SQL ke folder cadangan `backups/` |
| `npm run server` | Menjalankan server Express API secara mandiri (*standalone*) di port `5000` |
| `npm run build` | Mengompilasi kode React & TypeScript untuk rilis produksi |
| `npm run preview` | Meninjau hasil kompilasi produksi secara lokal |
| `npm run format` | Menjalankan pemformatan kode dengan `oxfmt` |

---

## 🔑 Akun Demo untuk Pengujian

Gunakan akun berikut untuk menguji coba fitur autentikasi, pemesanan, dan dasbor:

| Peran (*Role*) | Email / Kontak | Kata Sandi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Pelanggan** | `demo@gmail.com` | `password123` | Sudah memiliki riwayat pesanan servis aktif |
| **Pelanggan** | `rina@email.com` | `password123` | Akun pelanggan alternatif |
| **Teknisi** | `dedi@barangku.id` | `password123` | Bengkel Mas Dedi Servis (Karawaci) |

---

## 📂 Struktur Utama Proyek

```text
Barangku/
├── src/                  # Kode antarmuka Frontend (React 19, Tailwind CSS v4)
│   ├── App.tsx           # Komponen root aplikasi & router hash
│   ├── Auth.tsx          # Komponen autentikasi (Masuk & Daftar)
│   ├── Tracking.tsx      # Halaman lacak status perbaikan servis
│   ├── api/              # Klien API frontend & mock data fallback
│   └── index.css         # Styling global Tailwind CSS v4
├── server/               # Kode Backend API (Express.js & TypeScript)
│   ├── app.ts            # Definisi aplikasi Express & rute
│   ├── index.ts          # Server runner standalone (port 5000)
│   ├── vitePlugin.ts     # Integrasi middleware Express ke dalam Vite (port 8443)
│   ├── routes/           # Rute API (auth, orders, technicians, reviews)
│   ├── services/         # Layanan bisnis (dbService, authService)
│   └── db/
│       ├── schema.sql    # Skema tabel relasional PostgreSQL & PostGIS
│       ├── seed.sql      # Data awal (bengkel, ulasan, koordinat geospasial)
│       ├── setupDb.ts    # Script otomatisasi database setup
│       └── backup.ts     # Script backup snapshot database
├── docs/                 # Dokumentasi arsitektur & handover
├── .env.example          # Contoh variabel lingkungan
└── package.json          # Dependensi & skrip CLI proyek
```
