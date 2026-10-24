import { config } from "../config"
import { isPostgresAvailable, query, withTransaction } from "../db/pool"

export interface UserEntity {
  id: string
  name: string
  contact: string
  email?: string
  phone?: string
  password_hash?: string
  role: "pelanggan" | "tukang"
  fresh?: boolean
}

export interface TechnicianEntity {
  id: number
  userId?: string
  name: string
  area: string
  address?: string
  devices: string[]
  rating: string
  reviews: number
  distance: number
  min: number
  max: number
  status: "open" | "busy" | "closed"
  verified: boolean
  photo?: string
  latitude?: number
  longitude?: number
  phone?: string
}

export interface ReviewEntity {
  name: string
  date: string
  rating: number
  text: string
  service: string
}

export interface BookingDetails {
  device: string
  model: string
  problem: string
  notes: string
  date: string
  time: string
}

export interface OrderStatusLog {
  status: number
  label: string
  timestamp: string
  date: string
  time: string
  note?: string
}

export interface OrderEntity {
  code: string
  technician: TechnicianEntity
  details: BookingDetails
  photoName?: string
  photoUrl?: string
  status: number
  estimateMin?: number
  estimateMax?: number
  message?: string
  rejected?: boolean
  incoming?: boolean
  customerName?: string
  customerPhone?: string
  customerId?: string
  technicianId?: number
  shop?: string
  statusLogs?: OrderStatusLog[]
  device?: string
  model?: string
  damage?: string
  date?: string
  time?: string
  isCustomerOrder?: boolean
}

// ---------------------------------------------------------------------------
// In-Memory Persistence Store (Fallback when PostgreSQL is not yet connected)
// ---------------------------------------------------------------------------
const memoryUsers: UserEntity[] = [
  {
    id: "user-demo",
    name: "Demo Pengguna",
    contact: "0812-9999-0001",
    email: "demo@gmail.com",
    phone: "0812-9999-0001",
    password_hash:
      "$2b$10$ErKPCsv38cdZ90CeFoPo7.2OMQzHHfgNCiNbYxtav.cSb0lu8rngK", // password123
    role: "pelanggan",
    fresh: false,
  },
  {
    id: "user-1",
    name: "Rina Ayu",
    contact: "0812-0000-0001",
    email: "rina@email.com",
    phone: "0812-0000-0001",
    password_hash:
      "$2b$10$ErKPCsv38cdZ90CeFoPo7.2OMQzHHfgNCiNbYxtav.cSb0lu8rngK", // password123
    role: "pelanggan",
    fresh: false,
  },
  {
    id: "user-2",
    name: "Mas Dedi Servis",
    contact: "0812-0000-0000",
    email: "dedi@barangku.id",
    phone: "0812-0000-0000",
    password_hash:
      "$2b$10$ErKPCsv38cdZ90CeFoPo7.2OMQzHHfgNCiNbYxtav.cSb0lu8rngK", // password123
    role: "tukang",
    fresh: false,
  },
]

const memoryTechnicians: TechnicianEntity[] = [
  {
    id: 1,
    userId: "user-2",
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
    latitude: -6.195,
    longitude: 106.615,
    phone: "081288880001",
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
    latitude: -6.185,
    longitude: 106.64,
    phone: "081388880002",
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
    latitude: -6.215,
    longitude: 106.595,
    phone: "081288880003",
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
    latitude: -6.23,
    longitude: 106.605,
    phone: "085788880004",
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
    latitude: -6.18,
    longitude: 106.585,
    phone: "087888880005",
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
    latitude: -6.245,
    longitude: 106.628,
    phone: "081988880006",
  },
  {
    id: 7,
    name: "BSD Gadget Care",
    area: "BSD City",
    devices: ["Laptop", "HP"],
    rating: "4,9",
    reviews: 64,
    distance: 0.8,
    min: 150000,
    max: 650000,
    status: "open",
    verified: true,
    photo:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    address: "Ruko Golden Boulevard Blok W2 No. 15, BSD City, Serpong",
    latitude: -6.3015,
    longitude: 106.6535,
    phone: "081288880007",
  },
]

const memoryReviews: Record<number, ReviewEntity[]> = {
  7: [
    {
      name: "Kevin Sanjaya",
      date: "1 minggu lalu",
      rating: 5,
      text: "Servis laptop di BSD yang terpercaya banget. Ganti pasta dan bersihin kipas cepat, langsung dingin lagi.",
      service: "Servis Laptop",
    },
    {
      name: "Amanda Putri",
      date: "2 minggu lalu",
      rating: 5,
      text: "Ganti layar HP di sini rapi banget dan bergaransi. Recommended buat warga BSD!",
      service: "Ganti Layar HP",
    },
  ],
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

const memoryOrders: OrderEntity[] = [
  {
    code: "BRK-2026-0150",
    technician: memoryTechnicians[0],
    technicianId: 1,
    customerId: "user-demo",
    shop: "Mas Dedi Servis",
    device: "Laptop",
    model: "Lenovo ThinkPad T14",
    damage: "Keyboard beberapa tombol tidak merespon",
    customerName: "Demo Pengguna",
    customerPhone: "0812-9999-0001",
    status: 2,
    estimateMin: 180000,
    estimateMax: 350000,
    message:
      "Laptop kamu sedang dalam tahap pengecekan. Suku cadang modul keyboard siap diganti.",
    date: "2026-10-24",
    time: "10:30",
    incoming: false,
    rejected: false,
    photoName: "",
    details: {
      device: "Laptop",
      model: "Lenovo ThinkPad T14",
      problem: "Keyboard beberapa tombol tidak merespon",
      notes: "Akun demo: demo@gmail.com (0812-9999-0001)",
      date: "2026-10-24",
      time: "10:30",
    },
    isCustomerOrder: true,
  },
  {
    code: "BRK-2026-0142",
    technician: memoryTechnicians[0],
    technicianId: 1,
    customerId: "user-1",
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
    isCustomerOrder: true,
  },
  {
    code: "BRK-2026-0138",
    technician: memoryTechnicians[2],
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
    isCustomerOrder: true,
  },
  {
    code: "BRK-2026-0155",
    technician: memoryTechnicians[0],
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
    technician: memoryTechnicians[0],
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

// Helper: Haversine distance in KM
function computeDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371 // Earth radius km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

// ===========================================================================
// Database Service Implementation
// ===========================================================================
export const dbService = {
  // -------------------------------------------------------------------------
  // User Management
  // -------------------------------------------------------------------------
  async getUserById(id: string): Promise<UserEntity | null> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          "SELECT id, name, email, phone, password_hash, role, fresh FROM users WHERE id = $1",
          [id],
        )
        if (res.rows.length === 0) return null
        const u = res.rows[0]
        return {
          id: u.id,
          name: u.name,
          contact: u.email || u.phone || "",
          email: u.email || undefined,
          phone: u.phone || undefined,
          password_hash: u.password_hash,
          role: u.role,
          fresh: u.fresh,
        }
      } catch (err) {
        console.error("[dbService.getUserById] Postgres error:", err)
      }
    }
    const found = memoryUsers.find((u) => u.id === id)
    return found ? { ...found } : null
  },

  async getUserByIdentity(identity: string): Promise<UserEntity | null> {
    const trimmed = identity.trim()
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          "SELECT id, name, email, phone, password_hash, role, fresh FROM users WHERE email = $1 OR phone = $1",
          [trimmed],
        )
        if (res.rows.length > 0) {
          const u = res.rows[0]
          return {
            id: u.id,
            name: u.name,
            contact: u.email || u.phone || trimmed,
            email: u.email || undefined,
            phone: u.phone || undefined,
            password_hash: u.password_hash,
            role: u.role,
            fresh: u.fresh,
          }
        }
      } catch (err) {
        console.error("[dbService.getUserByIdentity] Postgres error:", err)
      }
    }

    const found = memoryUsers.find(
      (u) =>
        u.contact === trimmed || u.email === trimmed || u.phone === trimmed,
    )
    return found ? { ...found } : null
  },

  async createUser(data: {
    name: string
    email?: string
    phone?: string
    passwordHash: string
    role: "pelanggan" | "tukang"
    fresh?: boolean
  }): Promise<UserEntity> {
    const contact = data.email?.trim() || data.phone?.trim() || "0812-0000-0000"

    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `INSERT INTO users (name, email, phone, password_hash, role, fresh)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, name, email, phone, role, fresh`,
          [
            data.name.trim(),
            data.email?.trim() || null,
            data.phone?.trim() || null,
            data.passwordHash,
            data.role,
            data.fresh ?? true,
          ],
        )
        const u = res.rows[0]
        return {
          id: u.id,
          name: u.name,
          contact: u.email || u.phone || contact,
          email: u.email || undefined,
          phone: u.phone || undefined,
          role: u.role,
          fresh: u.fresh,
        }
      } catch (err) {
        console.error(
          "[dbService.createUser] Postgres error, saving to memory fallback:",
          err,
        )
      }
    }

    const newUser: UserEntity = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      contact,
      email: data.email?.trim(),
      phone: data.phone?.trim(),
      password_hash: data.passwordHash,
      role: data.role,
      fresh: data.fresh ?? true,
    }
    memoryUsers.push(newUser)
    return newUser
  },

  // -------------------------------------------------------------------------
  // Technicians & Workshops
  // -------------------------------------------------------------------------
  async searchTechnicians(options?: {
    device?: string
    filters?: string[]
    sort?: string
    userLat?: number
    userLng?: number
  }): Promise<TechnicianEntity[]> {
    const chosenFilters =
      options?.filters ?? (options?.device ? [options.device] : [])
    const sort = options?.sort ?? "distance"
    const lat = options?.userLat ?? config.defaultLocation.latitude
    const lng = options?.userLng ?? config.defaultLocation.longitude

    if (isPostgresAvailable()) {
      try {
        // PostGIS geospatial query according to docs/HANDOFF.md Section 4.4
        let querySql = `
          SELECT 
            id, 
            user_id as "userId",
            name, 
            area, 
            address,
            devices, 
            rating, 
            review_count as reviews, 
            min_price as min, 
            max_price as max, 
            status, 
            verified,
            photo_url as photo,
            latitude,
            longitude,
            ROUND((ST_DistanceSphere(location, ST_MakePoint($1, $2)) / 1000.0)::numeric, 1) AS distance
          FROM technicians
          WHERE 1=1
        `
        const params: any[] = [lng, lat]
        let paramIdx = 3

        if (chosenFilters.includes("Laptop") && !chosenFilters.includes("HP")) {
          querySql += ` AND 'Laptop' = ANY(devices)`
        } else if (
          chosenFilters.includes("HP") &&
          !chosenFilters.includes("Laptop")
        ) {
          querySql += ` AND 'HP' = ANY(devices)`
        }

        if (chosenFilters.includes("Terverifikasi")) {
          querySql += ` AND verified = TRUE`
        }

        if (chosenFilters.includes("Buka sekarang")) {
          querySql += ` AND status = 'open'`
        }

        if (sort === "rating") {
          querySql += ` ORDER BY rating DESC, distance ASC`
        } else if (sort === "price") {
          querySql += ` ORDER BY min_price ASC, distance ASC`
        } else {
          querySql += ` ORDER BY distance ASC`
        }

        const res = await query(querySql, params)
        return res.rows.map((r) => ({
          ...r,
          id: Number(r.id),
          min: Number(r.min),
          max: Number(r.max),
          reviews: Number(r.reviews),
          distance: Number(r.distance || 1.0),
          rating: String(r.rating).replace(".", ","),
        }))
      } catch (err) {
        console.error(
          "[dbService.searchTechnicians] Postgres query error:",
          err,
        )
      }
    }

    // In-memory fallback
    let list = memoryTechnicians.map((t) => {
      const distance =
        t.latitude && t.longitude
          ? computeDistanceKm(lat, lng, t.latitude, t.longitude)
          : t.distance
      return { ...t, distance }
    })

    list = list.filter((t) => {
      if (chosenFilters.includes("Laptop") && !t.devices.includes("Laptop"))
        return false
      if (chosenFilters.includes("HP") && !t.devices.includes("HP"))
        return false
      if (chosenFilters.includes("Terverifikasi") && !t.verified) return false
      if (chosenFilters.includes("Buka sekarang") && t.status !== "open")
        return false
      return true
    })

    list = list.sort((a, b) => {
      if (sort === "rating") {
        return (
          Number(b.rating.replace(",", ".")) -
          Number(a.rating.replace(",", "."))
        )
      }
      if (sort === "price") {
        return a.min - b.min
      }
      return a.distance - b.distance
    })

    return [...list]
  },

  async getTechnicianById(id: number): Promise<TechnicianEntity | null> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `SELECT 
             id, user_id as "userId", name, area, address, devices, rating, 
             review_count as reviews, min_price as min, max_price as max, 
             status, verified, photo_url as photo, latitude, longitude
           FROM technicians WHERE id = $1`,
          [id],
        )
        if (res.rows.length > 0) {
          const r = res.rows[0]
          return {
            ...r,
            id: Number(r.id),
            min: Number(r.min),
            max: Number(r.max),
            reviews: Number(r.reviews),
            distance: 1.2,
            rating: String(r.rating).replace(".", ","),
          }
        }
      } catch (err) {
        console.error("[dbService.getTechnicianById] Postgres error:", err)
      }
    }

    const found = memoryTechnicians.find((t) => t.id === id)
    return found ? { ...found } : null
  },

  async getTechnicianReviews(technicianId: number): Promise<ReviewEntity[]> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `SELECT reviewer_name as name, TO_CHAR(created_at, 'DD Mon YYYY') as date, rating, review_text as text, service
           FROM reviews WHERE technician_id = $1 ORDER BY created_at DESC`,
          [technicianId],
        )
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            name: r.name,
            date: r.date,
            rating: Number(r.rating),
            text: r.text,
            service: r.service,
          }))
        }
      } catch (err) {
        console.error("[dbService.getTechnicianReviews] Postgres error:", err)
      }
    }

    if (memoryReviews[technicianId]) {
      return [...memoryReviews[technicianId]]
    }

    // Default reviews fallback
    const tech = memoryTechnicians.find((t) => t.id === technicianId)
    const hp = tech?.devices.length === 1 && tech.devices[0] === "HP"
    return [
      {
        name: "Rina Ayu",
        date: "2 minggu lalu",
        rating: 5,
        text: hp
          ? "Layar HP retak akhirnya beres. Hasilnya rapi dan enak dipakai lagi."
          : "Laptop yang tadinya mati total akhirnya nyala lagi. Kerusakannya dijelasin dengan sabar.",
        service: hp ? "Ganti layar HP" : "Servis laptop mati total",
      },
      {
        name: "Andi Pratama",
        date: "3 minggu lalu",
        rating: 5,
        text: "Nggak langsung disuruh ganti komponen. Dicek dulu, terus dikasih pilihan yang sesuai budget.",
        service: hp ? "Ganti baterai HP" : "Ganti baterai laptop",
      },
    ]
  },

  async getShopStatus(
    technicianId: number = 1,
  ): Promise<"buka" | "sibuk" | "tutup"> {
    const tech = await this.getTechnicianById(technicianId)
    if (!tech) return "buka"
    if (tech.status === "open") return "buka"
    if (tech.status === "busy") return "sibuk"
    return "tutup"
  },

  async setShopStatus(
    status: "buka" | "sibuk" | "tutup",
    technicianId: number = 1,
  ): Promise<"buka" | "sibuk" | "tutup"> {
    const mappedDbStatus =
      status === "buka" ? "open" : status === "sibuk" ? "busy" : "closed"

    if (isPostgresAvailable()) {
      try {
        await query(
          "UPDATE technicians SET status = $1, updated_at = NOW() WHERE id = $2",
          [mappedDbStatus, technicianId],
        )
        return status
      } catch (err) {
        console.error("[dbService.setShopStatus] Postgres error:", err)
      }
    }

    const tech = memoryTechnicians.find((t) => t.id === technicianId)
    if (tech) {
      tech.status = mappedDbStatus
    }
    return status
  },

  async registerTechnicianShop(data: {
    userId?: string
    name: string
    phone: string
    email?: string
    shopName: string
    address: string
    hours?: string
    services?: string[]
    minPrice?: string | number
  }): Promise<TechnicianEntity> {
    const min =
      typeof data.minPrice === "string"
        ? parseInt(data.minPrice, 10) || 100000
        : data.minPrice || 100000
    const devices = data.services?.filter((s) =>
      ["Laptop", "HP"].includes(s),
    ) ?? ["Laptop", "HP"]
    const shopName = data.shopName || data.name || "Tukang Servis"

    let area = "Karawaci"
    let lat = -6.195
    let lng = 106.615
    const addr = (data.address || "").toLowerCase()
    if (addr.includes("bsd")) {
      area = "BSD City"
      lat = -6.3015
      lng = 106.6535
    } else if (addr.includes("serpong")) {
      area = "Gading Serpong"
      lat = -6.245
      lng = 106.628
    } else if (addr.includes("cikokol")) {
      area = "Cikokol"
      lat = -6.185
      lng = 106.64
    } else if (addr.includes("ciledug")) {
      area = "Ciledug"
      lat = -6.225
      lng = 106.71
    } else if (addr.includes("cipondoh")) {
      area = "Cipondoh"
      lat = -6.185
      lng = 106.68
    } else if (addr.includes("cibodas")) {
      area = "Cibodas"
      lat = -6.18
      lng = 106.585
    } else if (addr.includes("kelapa dua") || addr.includes("bencongan")) {
      area = "Kelapa Dua"
      lat = -6.23
      lng = 106.605
    }

    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `INSERT INTO technicians (
            user_id, name, area, address, location, latitude, longitude,
            devices, rating, review_count, min_price, max_price, status, verified, photo_url
          ) VALUES (
            $1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $6, $5,
            $7, 5.0, 0, $8, $9, 'open', true, 'https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80'
          ) RETURNING id, user_id as "userId", name, area, address, devices, rating, review_count as reviews, min_price as min, max_price as max, status, verified, photo_url as photo`,
          [
            data.userId || null,
            shopName,
            area,
            data.address || `${area}, Tangerang`,
            lng,
            lat,
            devices.length ? devices : ["Laptop", "HP"],
            min,
            min * 3,
          ],
        )
        const r = res.rows[0]
        return {
          ...r,
          id: Number(r.id),
          min: Number(r.min),
          max: Number(r.max),
          reviews: Number(r.reviews),
          distance: 1.0,
          rating: "5,0",
        }
      } catch (err) {
        console.error("[dbService.registerTechnicianShop] Postgres error:", err)
      }
    }

    const newTech: TechnicianEntity = {
      id: memoryTechnicians.length + 1,
      userId: data.userId,
      name: shopName,
      area,
      devices: devices.length ? devices : ["Laptop", "HP"],
      rating: "5,0",
      reviews: 0,
      distance: 1.0,
      min,
      max: min * 3,
      status: "open",
      verified: true,
      photo:
        "https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80",
      address: data.address || `${area}, Tangerang`,
      latitude: lat,
      longitude: lng,
      phone: data.phone || "081288880000",
    }
    memoryTechnicians.push(newTech)
    return newTech
  },

  getFeaturedReviews(): ReviewEntity[] {
    return [
      {
        name: "Rina Ayu",
        date: "2 minggu lalu",
        rating: 5,
        text: "Laptop yang tadinya mati total akhirnya nyala lagi. Mas Dedi jelasin kerusakannya dengan sabar, biayanya juga sesuai perkiraan. Makasih ya!",
        service: "Servis laptop",
      },
      {
        name: "Andi Pratama",
        date: "3 minggu lalu",
        rating: 5,
        text: "Nggak langsung disuruh ganti komponen. Dicek dulu, terus dikasih pilihan yang pas di kantong. Senang nemu tukang yang jujur dekat rumah.",
        service: "Ganti baterai laptop",
      },
      {
        name: "Dewi Lestari",
        date: "1 bulan lalu",
        rating: 5,
        text: "Layar HP retak selesai tepat waktu dan hasilnya rapi. Nggak ada biaya tambahan di luar kesepakatan awal.",
        service: "Ganti layar HP",
      },
    ]
  },

  async addTechnicianReview(
    technicianId: number,
    reviewData: { name: string; rating: number; text: string; service: string },
    userId?: string,
  ): Promise<ReviewEntity> {
    const newReview: ReviewEntity = {
      name: reviewData.name.trim() || "Pelanggan",
      date: "Baru saja",
      rating: Math.max(1, Math.min(5, Math.round(reviewData.rating))),
      text: reviewData.text.trim(),
      service: reviewData.service.trim() || "Servis perangkat",
    }

    if (isPostgresAvailable()) {
      try {
        await query(
          `INSERT INTO reviews (technician_id, user_id, reviewer_name, rating, review_text, service)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            technicianId,
            userId || null,
            newReview.name,
            newReview.rating,
            newReview.text,
            newReview.service,
          ],
        )
      } catch (err) {
        console.error("[dbService.addTechnicianReview] Postgres error:", err)
      }
    }

    if (!memoryReviews[technicianId]) {
      memoryReviews[technicianId] = []
    }
    memoryReviews[technicianId].unshift(newReview)

    const tech = memoryTechnicians.find((t) => t.id === technicianId)
    if (tech) {
      tech.reviews += 1
      const totalRatings = memoryReviews[technicianId].reduce(
        (sum, r) => sum + r.rating,
        0,
      )
      const avg = totalRatings / memoryReviews[technicianId].length
      tech.rating = avg.toFixed(1).replace(".", ",")
    }

    return newReview
  },

  // -------------------------------------------------------------------------
  // Orders Management & Workflow (docs/HANDOFF.md Section 5)
  // -------------------------------------------------------------------------
  async getOrder(code: string): Promise<OrderEntity | null> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `SELECT 
             o.id, o.code, o.customer_id as "customerId", o.customer_name as "customerName", o.customer_phone as "customerPhone",
             o.technician_id as "technicianId", o.device, o.model, o.problem, o.notes,
             TO_CHAR(o.visit_date, 'YYYY-MM-DD') as visit_date,
             TO_CHAR(o.visit_time, 'HH24:MI') as visit_time,
             o.photo_name as "photoName", o.status, o.estimate_min as "estimateMin", o.estimate_max as "estimateMax",
             o.message, o.rejected, o.incoming,
             t.name as "shopName", t.area as "shopArea", t.address as "shopAddress", t.devices as "shopDevices",
             t.rating as "shopRating", t.review_count as "shopReviews", t.min_price as "shopMin", t.max_price as "shopMax",
             t.status as "shopStatus", t.verified as "shopVerified", t.photo_url as "shopPhoto"
           FROM orders o
           JOIN technicians t ON t.id = o.technician_id
           WHERE o.code = $1`,
          [code],
        )
        if (res.rows.length > 0) {
          const r = res.rows[0]
          const tech: TechnicianEntity = {
            id: Number(r.technicianId),
            name: r.shopName,
            area: r.shopArea,
            address: r.shopAddress,
            devices: r.shopDevices || ["Laptop"],
            rating: String(r.shopRating).replace(".", ","),
            reviews: Number(r.shopReviews),
            distance: 1.2,
            min: Number(r.estimateMin || r.shopMin),
            max: Number(r.estimateMax || r.shopMax),
            status: r.shopStatus,
            verified: r.shopVerified,
            photo: r.shopPhoto,
          }
          const details: BookingDetails = {
            device: r.device,
            model: r.model,
            problem: r.problem,
            notes: r.notes,
            date: r.visit_date,
            time: r.visit_time,
          }
          return {
            code: r.code,
            technician: tech,
            technicianId: tech.id,
            customerId: r.customerId,
            customerName: r.customerName,
            customerPhone: r.customerPhone,
            shop: tech.name,
            details,
            device: r.device,
            model: r.model,
            damage: r.problem,
            date: r.visit_date,
            time: r.visit_time,
            photoName: r.photoName || "",
            status: Number(r.status),
            estimateMin: Number(r.estimateMin),
            estimateMax: Number(r.estimateMax),
            message: r.message,
            rejected: r.rejected,
            incoming: r.incoming,
            isCustomerOrder: true,
          }
        }
      } catch (err) {
        console.error("[dbService.getOrder] Postgres error:", err)
      }
    }

    const found = memoryOrders.find((o) => o.code === code)
    return found ? { ...found } : null
  },

  async getMyOrders(
    userContact?: string,
    customerId?: string,
  ): Promise<OrderEntity[]> {
    if (!userContact && !customerId) {
      return []
    }

    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `SELECT 
             o.code, o.customer_id as "customerId", o.customer_name as "customerName", o.customer_phone as "customerPhone",
             o.technician_id as "technicianId", o.device, o.model, o.problem, o.notes,
             TO_CHAR(o.visit_date, 'YYYY-MM-DD') as visit_date,
             TO_CHAR(o.visit_time, 'HH24:MI') as visit_time,
             o.photo_name as "photoName", o.status, o.estimate_min as "estimateMin", o.estimate_max as "estimateMax",
             o.message, o.rejected, o.incoming,
             t.name as "shopName", t.area as "shopArea", t.address as "shopAddress", t.devices as "shopDevices",
             t.rating as "shopRating", t.review_count as "shopReviews", t.min_price as "shopMin", t.max_price as "shopMax",
             t.status as "shopStatus", t.verified as "shopVerified", t.photo_url as "shopPhoto"
           FROM orders o
           JOIN technicians t ON t.id = o.technician_id
           WHERE (
             ($1::text IS NOT NULL AND (o.customer_phone = $1 OR o.customer_name = $1))
             OR ($2::text IS NOT NULL AND o.customer_id::text = $2)
           )
           ORDER BY o.created_at DESC`,
          [userContact || null, customerId || null],
        )
        return res.rows.map((r) => ({
          code: r.code,
          technician: {
            id: Number(r.technicianId),
            name: r.shopName,
            area: r.shopArea,
            address: r.shopAddress,
            devices: r.shopDevices || ["Laptop"],
            rating: String(r.shopRating).replace(".", ","),
            reviews: Number(r.shopReviews),
            distance: 1.2,
            min: Number(r.estimateMin || r.shopMin),
            max: Number(r.estimateMax || r.shopMax),
            status: r.shopStatus,
            verified: r.shopVerified,
            photo: r.shopPhoto,
          },
          technicianId: Number(r.technicianId),
          shop: r.shopName,
          details: {
            device: r.device,
            model: r.model,
            problem: r.problem,
            notes: r.notes,
            date: r.visit_date,
            time: r.visit_time,
          },
          photoName: r.photoName || "",
          status: Number(r.status),
          estimateMin: Number(r.estimateMin),
          estimateMax: Number(r.estimateMax),
          message: r.message,
          rejected: r.rejected,
          incoming: r.incoming,
          customerName: r.customerName,
          customerPhone: r.customerPhone,
          device: r.device,
          model: r.model,
          damage: r.problem,
          date: r.visit_date,
          time: r.visit_time,
          isCustomerOrder: true,
        }))
      } catch (err) {
        console.error("[dbService.getMyOrders] Postgres error:", err)
      }
    }

    const list = memoryOrders.filter((o) => {
      const matchContact =
        userContact &&
        (o.customerPhone === userContact || o.customerName === userContact)
      const matchId =
        customerId &&
        (o.customerId === customerId || (o as any).id === customerId)
      return matchContact || matchId
    })
    return [...list]
  },

  async getTechnicianOrders(technicianId: number = 1): Promise<OrderEntity[]> {
    if (isPostgresAvailable()) {
      try {
        const res = await query(
          `SELECT 
             o.code, o.customer_id as "customerId", o.customer_name as "customerName", o.customer_phone as "customerPhone",
             o.technician_id as "technicianId", o.device, o.model, o.problem, o.notes,
             TO_CHAR(o.visit_date, 'YYYY-MM-DD') as visit_date,
             TO_CHAR(o.visit_time, 'HH24:MI') as visit_time,
             o.photo_name as "photoName", o.status, o.estimate_min as "estimateMin", o.estimate_max as "estimateMax",
             o.message, o.rejected, o.incoming,
             t.name as "shopName", t.area as "shopArea", t.address as "shopAddress", t.devices as "shopDevices",
             t.rating as "shopRating", t.review_count as "shopReviews", t.min_price as "shopMin", t.max_price as "shopMax",
             t.status as "shopStatus", t.verified as "shopVerified", t.photo_url as "shopPhoto"
           FROM orders o
           JOIN technicians t ON t.id = o.technician_id
           WHERE o.technician_id = $1
           ORDER BY o.created_at DESC`,
          [technicianId],
        )
        return res.rows.map((r) => ({
          code: r.code,
          technician: {
            id: Number(r.technicianId),
            name: r.shopName,
            area: r.shopArea,
            address: r.shopAddress,
            devices: r.shopDevices || ["Laptop"],
            rating: String(r.shopRating).replace(".", ","),
            reviews: Number(r.shopReviews),
            distance: 1.2,
            min: Number(r.estimateMin || r.shopMin),
            max: Number(r.estimateMax || r.shopMax),
            status: r.shopStatus,
            verified: r.shopVerified,
            photo: r.shopPhoto,
          },
          technicianId: Number(r.technicianId),
          shop: r.shopName,
          details: {
            device: r.device,
            model: r.model,
            problem: r.problem,
            notes: r.notes,
            date: r.visit_date,
            time: r.visit_time,
          },
          photoName: r.photoName || "",
          status: Number(r.status),
          estimateMin: Number(r.estimateMin),
          estimateMax: Number(r.estimateMax),
          message: r.message,
          rejected: r.rejected,
          incoming: r.incoming,
          customerName: r.customerName,
          customerPhone: r.customerPhone,
          device: r.device,
          model: r.model,
          damage: r.problem,
          date: r.visit_date,
          time: r.visit_time,
        }))
      } catch (err) {
        console.error("[dbService.getTechnicianOrders] Postgres error:", err)
      }
    }

    const list = memoryOrders.filter((o) => o.technicianId === technicianId)
    return [...list]
  },

  async createOrder(data: {
    technicianId: number
    details: BookingDetails
    photoName?: string
    photoUrl?: string
    customerName?: string
    customerPhone?: string
    customerId?: string
    code?: string
  }): Promise<OrderEntity> {
    const code =
      data.code || `BRK-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const tech =
      (await this.getTechnicianById(data.technicianId)) || memoryTechnicians[0]

    const customerName = data.customerName || "Pelanggan"
    const customerPhone = data.customerPhone || "0812-0000-0000"
    const photoName = data.photoName || ""
    const photoUrl = data.photoUrl || ""

    const now = new Date()
    const initialLog: OrderStatusLog = {
      status: 0,
      label: "Dipesan",
      timestamp: now.toISOString(),
      date: now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: now
        .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        .replace(":", "."),
      note: "Pesanan masuk, menunggu konfirmasi tukang.",
    }

    if (isPostgresAvailable()) {
      try {
        await withTransaction(async (client) => {
          const res = await client.query(
            `INSERT INTO orders (
              code, customer_id, customer_name, customer_phone, technician_id,
              device, model, problem, notes, visit_date, visit_time, photo_name,
              status, estimate_min, estimate_max, message, rejected, incoming
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9, $10, $11, $12,
              0, $13, $14, 'Pesanan masuk, menunggu konfirmasi tukang.', false, true
            ) RETURNING id`,
            [
              code,
              data.customerId || null,
              customerName,
              customerPhone,
              tech.id,
              data.details.device,
              data.details.model,
              data.details.problem,
              data.details.notes || "",
              data.details.date,
              data.details.time,
              photoName,
              tech.min,
              tech.max,
            ],
          )

          if (res.rows.length > 0) {
            // Log initial status in order_status_logs (docs/HANDOFF.md Section 4.2)
            await client.query(
              `INSERT INTO order_status_logs (order_id, previous_status, new_status, note, changed_by)
               VALUES ($1, NULL, 0, 'Pesanan dibuat oleh pelanggan', $2)`,
              [res.rows[0].id, data.customerId || null],
            )
          }
        })
      } catch (err) {
        console.error("[dbService.createOrder] Postgres error:", err)
      }
    }

    const newOrder: OrderEntity = {
      code,
      technician: tech,
      technicianId: tech.id,
      shop: tech.name,
      details: data.details,
      photoName,
      photoUrl,
      status: 0,
      estimateMin: tech.min,
      estimateMax: tech.max,
      message: "Pesanan masuk, menunggu konfirmasi tukang.",
      incoming: true,
      rejected: false,
      customerName,
      customerPhone,
      customerId: data.customerId,
      device: data.details.device,
      model: data.details.model,
      damage: data.details.problem,
      date: data.details.date,
      time: data.details.time,
      statusLogs: [initialLog],
      isCustomerOrder: true,
    }

    memoryOrders.unshift(newOrder)
    return newOrder
  },

  async updateOrderStatus(
    code: string,
    status: number,
    details?: {
      message?: string
      estimateMin?: number
      estimateMax?: number
      rejected?: boolean
      incoming?: boolean
    },
    changedByUserId?: string,
  ): Promise<OrderEntity> {
    const existing = await this.getOrder(code)
    if (!existing) {
      throw new Error(`Order ${code} tidak ditemukan.`)
    }

    const previousStatus = existing.status
    const newEstimateMin =
      details?.estimateMin !== undefined
        ? details.estimateMin
        : existing.estimateMin
    const newEstimateMax =
      details?.estimateMax !== undefined
        ? details.estimateMax
        : existing.estimateMax
    const newMessage =
      details?.message !== undefined ? details.message : existing.message
    const newRejected =
      details?.rejected !== undefined ? details.rejected : existing.rejected
    const newIncoming =
      details?.incoming !== undefined ? details.incoming : existing.incoming

    const statusLabels: Record<number, string> = {
      [-1]: "Ditolak",
      0: "Dipesan",
      1: "Diterima",
      2: "Dicek",
      3: "Diperbaiki",
      4: "Siap diambil",
      5: "Selesai",
    }

    const now = new Date()
    const nextLog: OrderStatusLog = {
      status,
      label: statusLabels[status] || `Status ${status}`,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: now
        .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        .replace(":", "."),
      note: newMessage || `Status diubah ke ${statusLabels[status] || status}`,
    }

    const existingLogs = existing.statusLogs && existing.statusLogs.length > 0
      ? existing.statusLogs
      : [
        {
          status: 0,
          label: "Dipesan",
          timestamp: now.toISOString(),
          date: now.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          time: now
            .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            .replace(":", "."),
          note: "Pesanan masuk.",
        },
      ]

    const updatedLogs = [...existingLogs, nextLog]

    if (isPostgresAvailable()) {
      try {
        await withTransaction(async (client) => {
          const res = await client.query(
            `UPDATE orders
             SET status = $1, estimate_min = $2, estimate_max = $3, message = $4,
                 rejected = $5, incoming = $6, updated_at = NOW()
             WHERE code = $7
             RETURNING id`,
            [
              status,
              newEstimateMin,
              newEstimateMax,
              newMessage,
              newRejected,
              newIncoming,
              code,
            ],
          )

          if (res.rows.length > 0) {
            // Log status transition audit log (docs/HANDOFF.md Section 4.2)
            await client.query(
              `INSERT INTO order_status_logs (order_id, previous_status, new_status, note, changed_by)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                res.rows[0].id,
                previousStatus,
                status,
                newMessage || `Status diubah ke ${status}`,
                changedByUserId || null,
              ],
            )
          }
        })
      } catch (err) {
        console.error("[dbService.updateOrderStatus] Postgres error:", err)
      }
    }

    const updated: OrderEntity = {
      ...existing,
      status,
      technician: {
        ...existing.technician,
        min: newEstimateMin ?? existing.technician.min,
        max: newEstimateMax ?? existing.technician.max,
      },
      message: newMessage,
      estimateMin: newEstimateMin,
      estimateMax: newEstimateMax,
      rejected: newRejected,
      incoming: newIncoming,
      statusLogs: updatedLogs,
    }

    const idx = memoryOrders.findIndex((o) => o.code === code)
    if (idx !== -1) {
      memoryOrders[idx] = updated
    }

    return updated
  },

  async acceptOrder(
    code: string,
    changedByUserId?: string,
  ): Promise<OrderEntity> {
    return this.updateOrderStatus(
      code,
      1,
      {
        incoming: false,
        rejected: false,
        message:
          "Pesanan diterima oleh tukang. Silakan bawa perangkat ke workshop sesuai jadwal.",
      },
      changedByUserId,
    )
  },

  async rejectOrder(
    code: string,
    changedByUserId?: string,
  ): Promise<OrderEntity> {
    return this.updateOrderStatus(
      code,
      -1,
      {
        incoming: false,
        rejected: true,
        message: "Maaf, tukang sedang tidak dapat menerima pesanan saat ini.",
      },
      changedByUserId,
    )
  },
}
