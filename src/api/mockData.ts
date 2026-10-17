import type { Order, Review, ShopStatus, Technician, User } from "./types"

export const initialTechnicians: Technician[] = [
  {
    id: 1,

    name: "Mas Dedi Servis",

    area: "Karawaci",

    devices: ["Laptop"],

    rating: "4,8",

    reviews: 128,

    distance: 1.2,

    min: 150000,

    max: 450000,

    status: "open",

    verified: true,

    photo:
      "https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80",

    address: "Jl. Imam Bonjol No. 24, Karawaci, Kota Tangerang",
  },

  {
    id: 2,

    name: "Kang Arif Laptop",

    area: "Cikokol",

    devices: ["Laptop"],

    rating: "4,9",

    reviews: 96,

    distance: 2.1,

    min: 175000,

    max: 600000,

    status: "open",

    verified: true,

    photo:
      "https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80",

    address: "Jl. Teuku Umar No. 18, Cikokol, Kota Tangerang",
  },

  {
    id: 3,

    name: "Bengkel HP Bu Sari",

    area: "Bencongan",

    devices: ["HP"],

    rating: "4,7",

    reviews: 84,

    distance: 2.8,

    min: 100000,

    max: 350000,

    status: "busy",

    verified: true,

    photo:
      "https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80",

    address: "Jl. Borobudur No. 12, Bencongan, Kelapa Dua, Tangerang",
  },

  {
    id: 4,

    name: "Pak Agus Elektronik",

    area: "Kelapa Dua",

    devices: ["Laptop", "HP"],

    rating: "4,6",

    reviews: 57,

    distance: 3.4,

    min: 125000,

    max: 500000,

    status: "open",

    verified: false,

    photo:
      "https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80",

    address: "Jl. Raya Kelapa Dua No. 35, Kelapa Dua, Tangerang",
  },

  {
    id: 5,

    name: "Rizky Servis HP",

    area: "Cibodas",

    devices: ["HP"],

    rating: "4,8",

    reviews: 112,

    distance: 4.2,

    min: 80000,

    max: 400000,

    status: "closed",

    verified: true,

    photo:
      "https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80",

    address: "Jl. Prambanan Raya No. 8, Cibodas, Kota Tangerang",
  },

  {
    id: 6,

    name: "Bima Komputer",

    area: "Gading Serpong",

    devices: ["Laptop"],

    rating: "4,9",

    reviews: 73,

    distance: 5.6,

    min: 200000,

    max: 750000,

    status: "busy",

    verified: true,

    photo:
      "https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80",

    address: "Jl. Boulevard Gading Serpong No. 16, Tangerang",
  },
]

export const initialReviews: Record<number, Review[]> = {
  1: [
    {
      name: "Rina Ayu",
      date: "2 minggu lalu",
      rating: 5,
      text: "Laptop yang tadinya mati total akhirnya nyala lagi. Mas Dedi jelasin kerusakannya dengan sabar, biayanya juga sesuai perkiraan. Makasih ya!",
      service: "Servis laptop mati total",
    },

    {
      name: "Andi Pratama",
      date: "3 minggu lalu",
      rating: 5,
      text: "Nggak langsung disuruh ganti komponen. Dicek dulu, terus dikasih pilihan yang sesuai budget. Senang nemu tukang yang jujur dekat rumah.",
      service: "Ganti baterai laptop",
    },

    {
      name: "Dewi Lestari",
      date: "1 bulan lalu",
      rating: 4,
      text: "Pengerjaannya rapi. Sempat mundur sehari karena antrean, tapi dikabarin dulu jadi nggak bingung nunggu.",
      service: "Pasang ulang sistem",
    },

    {
      name: "Fajar Ramadhan",
      date: "1 bulan lalu",
      rating: 5,
      text: "Responsnya ramah dan penjelasannya gampang dimengerti. Barang dites bareng pas diambil. Sekarang sudah lancar lagi.",
      service: "Bersihkan laptop",
    },

    {
      name: "Siti Nurhaliza",
      date: "2 bulan lalu",
      rating: 5,
      text: "Harga sesuai kesepakatan, nggak ada biaya tambahan mendadak. Terima kasih sudah bantu!",
      service: "Servis laptop",
    },

    {
      name: "Bayu Saputra",
      date: "2 bulan lalu",
      rating: 5,
      text: "Lokasinya gampang dicari. Proses pengecekan jelas dan dikasih tahu dulu sebelum diperbaiki.",
      service: "Servis laptop",
    },
  ],
}

export function getMockReviewsForTechnician(t: Technician): Review[] {
  if (initialReviews[t.id]) return initialReviews[t.id]

  const hp = t.devices.length === 1 && t.devices[0] === "HP"

  return [
    {
      name: "Rina Ayu",
      date: "2 minggu lalu",
      rating: 5,
      text: hp
        ? "Layar HP retak akhirnya beres. Hasilnya rapi dan enak dipakai lagi. Biayanya dijelasin dari awal."
        : "Laptop yang tadinya mati total akhirnya nyala lagi. Kerusakannya dijelasin dengan sabar, biayanya juga sesuai perkiraan. Makasih ya!",
      service: hp ? "Ganti layar HP" : "Servis laptop mati total",
    },

    {
      name: "Andi Pratama",
      date: "3 minggu lalu",
      rating: 5,
      text: "Nggak langsung disuruh ganti komponen. Dicek dulu, terus dikasih pilihan yang sesuai budget. Senang nemu tukang yang jujur dekat rumah.",
      service: hp ? "Ganti baterai HP" : "Ganti baterai laptop",
    },

    {
      name: "Dewi Lestari",
      date: "1 bulan lalu",
      rating: 4,
      text: "Pengerjaannya rapi. Sempat mundur sehari karena antrean, tapi dikabarin dulu jadi nggak bingung nunggu.",
      service: hp ? "Perbaikan konektor HP" : "Pasang ulang sistem",
    },

    {
      name: "Fajar Ramadhan",
      date: "1 bulan lalu",
      rating: 5,
      text: "Responsnya ramah dan penjelasannya gampang dimengerti. Barang dites bareng pas diambil. Sekarang sudah lancar lagi.",
      service: hp ? "Servis HP" : "Bersihkan laptop",
    },

    {
      name: "Siti Nurhaliza",
      date: "2 bulan lalu",
      rating: 5,
      text: "Harga sesuai kesepakatan, nggak ada biaya tambahan mendadak. Terima kasih sudah bantu!",
      service: hp ? "Ganti baterai HP" : "Servis laptop",
    },

    {
      name: "Bayu Saputra",
      date: "2 bulan lalu",
      rating: 5,
      text: "Lokasinya gampang dicari. Proses pengecekan jelas dan dikasih tahu dulu sebelum diperbaiki.",
      service: hp ? "Servis HP" : "Servis laptop",
    },
  ]
}

export const initialOrders: Order[] = [
  {
    code: "BRK-2026-0142",

    technician: initialTechnicians[0],

    technicianId: 1,

    shop: "Mas Dedi Servis",

    device: "Laptop",

    model: "ASUS VivoBook 14",

    damage: "Baterai drop",

    customerName: "Rina",

    customerPhone: "0812-0000-0001",

    status: 2,

    estimateMin: 150000,

    estimateMax: 350000,

    message:
      "Laptop kamu sudah kami cek. Yang rusak baterainya, bisa diganti hari ini juga.",

    date: "2026-10-20",

    time: "09:00",

    incoming: false,

    rejected: false,

    photoName: "",

    details: {
      device: "Laptop",

      model: "ASUS VivoBook 14",

      problem: "Baterai drop",

      notes: "Baterai drop. Kontak pelanggan: Rina (0812-0000-0001)",

      date: "2026-10-20",

      time: "09:00",
    },
  },

  {
    code: "BRK-2026-0138",

    technician: initialTechnicians[2],

    technicianId: 3,

    shop: "Bengkel HP Bu Sari",

    device: "HP",

    model: "Samsung Galaxy A54",

    damage: "Layar pecah",

    customerName: "Budi",

    customerPhone: "0812-0000-0002",

    status: 4,

    estimateMin: 300000,

    estimateMax: 450000,

    message: "Layar HP sudah diganti dan dites sentuhannya. Normal semua!",

    date: "2026-10-19",

    time: "10:00",

    incoming: false,

    rejected: false,

    photoName: "",

    details: {
      device: "HP",

      model: "Samsung Galaxy A54",

      problem: "Layar pecah",

      notes: "Layar pecah. Kontak pelanggan: Budi (0812-0000-0002)",

      date: "2026-10-19",

      time: "10:00",
    },
  },

  {
    code: "BRK-2026-0155",

    technician: initialTechnicians[0],

    technicianId: 1,

    shop: "Mas Dedi Servis",

    device: "Laptop",

    model: "Lenovo IdeaPad Slim 3",

    damage: "Mati total setelah kena air",

    customerName: "Fajar",

    customerPhone: "0812-0000-0003",

    status: 0,

    estimateMin: 200000,

    estimateMax: 500000,

    message: "Pesanan masuk, menunggu konfirmasi tukang.",

    date: "2026-10-21",

    time: "11:00",

    incoming: true,

    rejected: false,

    photoName: "",

    details: {
      device: "Laptop",

      model: "Lenovo IdeaPad Slim 3",

      problem: "Mati total setelah kena air",

      notes:
        "Mati total setelah kena air. Kontak pelanggan: Fajar (0812-0000-0003)",

      date: "2026-10-21",

      time: "11:00",
    },
  },

  {
    code: "BRK-2026-0159",

    technician: initialTechnicians[0],

    technicianId: 1,

    shop: "Mas Dedi Servis",

    device: "HP",

    model: "Xiaomi Redmi Note 12",

    damage: "Konektor charger longgar",

    customerName: "Siti",

    customerPhone: "0812-0000-0004",

    status: 0,

    estimateMin: 80000,

    estimateMax: 150000,

    message: "Pesanan masuk, menunggu konfirmasi tukang.",

    date: "2026-10-21",

    time: "14:30",

    incoming: true,

    rejected: false,

    photoName: "",

    details: {
      device: "HP",

      model: "Xiaomi Redmi Note 12",

      problem: "Konektor charger longgar",

      notes:
        "Konektor charger longgar. Kontak pelanggan: Siti (0812-0000-0004)",

      date: "2026-10-21",

      time: "14:30",
    },
  },
]

export const mockUsers: User[] = [
  {
    id: "user-1",

    name: "Rina Ayu",

    contact: "0812-0000-0001",

    email: "rina@email.com",

    phone: "0812-0000-0001",

    role: "pelanggan",

    fresh: false,
  },

  {
    id: "user-2",

    name: "Mas Dedi Servis",

    contact: "0812-0000-0000",

    phone: "0812-0000-0000",

    role: "tukang",

    fresh: false,
  },
]

// In-memory shared state across demo functions

export const inMemoryStore = {
  technicians: [...initialTechnicians],

  orders: [...initialOrders],

  reviews: { ...initialReviews },

  users: [...mockUsers],

  currentUser: null as User | null,

  shopStatus: "buka" as ShopStatus,
}
