export interface PromoVoucher {
  id: string
  code: string
  title: string
  badge: string
  discount: string
  category: "all" | "servis" | "delivery" | "sparepart" | "pelajar"
  categoryLabel: string
  description: string
  minSpend: number
  maxDiscount: number
  validUntil: string
  remainingQuota: number
  isFeatured: boolean
  terms: string[]
}

export const PROMOTIONS: PromoVoucher[] = [
  {
    id: "promo-perdana",
    code: "BARANGKUBARU",
    title: "Diskon 25% Servis Perdana",
    badge: "Paling Populer",
    discount: "Diskon 25%",
    category: "servis",
    categoryLabel: "Servis Perdana",
    description: "Spesial buat kamu yang baru pertama kali benerin laptop atau HP di jaringan tukang Barangku se-Tangerang.",
    minSpend: 50000,
    maxDiscount: 40000,
    validUntil: "30 November 2026",
    remainingQuota: 48,
    isFeatured: true,
    terms: [
      "Berlaku khusus pengguna baru untuk order pertama.",
      "Maksimal potongan diskon Rp 40.000.",
      "Berlaku untuk semua jenis perangkat (Laptop & HP).",
      "Dapat digunakan di seluruh bengkel mitra Barangku di Tangerang.",
    ],
  },
  {
    id: "promo-ongkir",
    code: "ANTARTNGGRATIS",
    title: "Gratis Jemput & Antar Gadget",
    badge: "Bebas Repot",
    discount: "Gratis Jemput-Antar",
    category: "delivery",
    categoryLabel: "Antar-Jemput",
    description: "Lagi sibuk atau mager ke toko? Teknisi siap jemput perangkat rusakmu ke rumah dan antar kembali tanpa ongkir.",
    minSpend: 75000,
    maxDiscount: 25000,
    validUntil: "15 Desember 2026",
    remainingQuota: 32,
    isFeatured: true,
    terms: [
      "Berlaku untuk area Tangerang Kota, BSD, Karawaci, Gading Serpong, dan Ciputat.",
      "Jarak maksimal penjemputan 10 km dari lokasi bengkel mitra.",
      "Minimal estimasi biaya perbaikan Rp 75.000.",
      "Wajib menyertakan catatan alamat lengkap saat pemesanan.",
    ],
  },
  {
    id: "promo-baterai-lcd",
    code: "HEMATLAYAR50",
    title: "Potongan Rp 50.000 Ganti LCD & Baterai",
    badge: "Hemat Sparepart",
    discount: "Potongan Rp 50.000",
    category: "sparepart",
    categoryLabel: "Ganti Sparepart",
    description: "Layar retak, sentuh bermasalah, atau baterai kembung/drop? Benerin sekarang dengan diskon langsung suku cadang original.",
    minSpend: 150000,
    maxDiscount: 50000,
    validUntil: "31 Desember 2026",
    remainingQuota: 19,
    isFeatured: true,
    terms: [
      "Berlaku untuk penggantian komponen LCD touchscreen atau baterai.",
      "Minimal nilai servis total Rp 150.000.",
      "Termasuk garansi toko minimal 30 hari dari teknisi mitra.",
      "Berlaku untuk perangkat Android, iPhone, dan semua brand laptop.",
    ],
  },
  {
    id: "promo-mahasiswa",
    code: "KAMPUSHEMAT",
    title: "Diskon 20% Mahasiswa & Pelajar Tangerang",
    badge: "Khusus Mahasiswa",
    discount: "Diskon 20%",
    category: "pelajar",
    categoryLabel: "Pelajar / Kampus",
    description: "Laptop tugas ngelag, mati mendadak, atau keyboard error? Tunjukin Kartu Mahasiswa/Pelajar dan nikmati potongan servis.",
    minSpend: 40000,
    maxDiscount: 35000,
    validUntil: "31 Desember 2026",
    remainingQuota: 65,
    isFeatured: true,
    terms: [
      "Wajib menunjukkan KTM / Kartu Pelajar aktif saat serah terima barang.",
      "Berlaku untuk mahasiswa kampus sekitar Tangerang (UMN, Prasmul, UPH, Binus, UIN, dll).",
      "Maksimal potongan biaya pengerjaan Rp 35.000.",
      "Tidak dapat digabung dengan promo BARANGKUBARU.",
    ],
  },
  {
    id: "promo-pembersihan",
    code: "CLEANLAPTOP",
    title: "Servis Bersih Kipas & Thermal Paste",
    badge: "Perawatan Rutin",
    discount: "Cashback Rp 25.000",
    category: "servis",
    categoryLabel: "Perawatan Laptop",
    description: "Laptop cepat panas dan berisik? Waktunya deep clean debu dan repaste thermal compound agar performa kembali ngebut.",
    minSpend: 60000,
    maxDiscount: 25000,
    validUntil: "20 Desember 2026",
    remainingQuota: 40,
    isFeatured: false,
    terms: [
      "Berlaku untuk paket perawatan ganti thermal paste + pembersihan heatsink & kipas laptop.",
      "Cashback berlaku sebagai pengurang total biaya jasa.",
      "Berlaku di semua teknisi bertanda 'Spesialis Laptop'.",
    ],
  },
  {
    id: "promo-weekend",
    code: "WEEKENDSERVIS",
    title: "Weekend Flash Sale Servis HP",
    badge: "Sabtu - Minggu",
    discount: "Potongan Rp 30.000",
    category: "servis",
    categoryLabel: "Flash Sale",
    description: "Luangkan akhir pekanmu untuk benerin HP yang rusak. Hemat ekstra untuk booking kunjungan di hari Sabtu dan Minggu.",
    minSpend: 100000,
    maxDiscount: 30000,
    validUntil: "Setiap Akhir Pekan",
    remainingQuota: 25,
    isFeatured: false,
    terms: [
      "Hanya dapat diklaim dan digunakan untuk kunjungan di hari Sabtu atau Minggu.",
      "Minimal transaksi servis Rp 100.000.",
      "Kuota terbatas 25 pengguna setiap minggunya.",
    ],
  },
]
