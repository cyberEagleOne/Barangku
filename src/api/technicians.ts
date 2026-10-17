import { apiFetch } from "./client"
import {
  getMockReviewsForTechnician,
  inMemoryStore,
  initialTechnicians,
} from "./mockData"
import type { Review, ShopStatus, Technician } from "./types"

export async function searchTechnicians(options?: {
  device?: string
  filters?: string[]
  sort?: string
  userLat?: number
  userLng?: number
}): Promise<Technician[]> {
  try {
    const params = new URLSearchParams()
    if (options?.device) params.set("device", options.device)
    if (options?.sort) params.set("sort", options.sort)
    if (options?.userLat !== undefined) params.set("userLat", String(options.userLat))
    if (options?.userLng !== undefined) params.set("userLng", String(options.userLng))
    if (options?.filters && options.filters.length > 0) {
      params.set("filters", options.filters.join(","))
    }

    const queryStr = params.toString()
    const url = `/api/technicians${queryStr ? `?${queryStr}` : ""}`
    const data = await apiFetch<Technician[]>(url)
    if (Array.isArray(data)) {
      return data
    }
  } catch (err: any) {
    console.warn(
      "[technicians.search] API call failed, falling back:",
      err.message,
    )
  }

  // Fallback to local store
  const chosenFilters =
    options?.filters ?? (options?.device ? [options.device] : [])
  const sort = options?.sort ?? "distance"

  let list = inMemoryStore.technicians.filter((t) => {
    if (chosenFilters.includes("Laptop") && !t.devices.includes("Laptop"))
      return false
    if (chosenFilters.includes("HP") && !t.devices.includes("HP")) return false
    if (chosenFilters.includes("Terverifikasi") && !t.verified) return false
    if (chosenFilters.includes("Buka sekarang") && t.status !== "open")
      return false
    return true
  })

  list = list.sort((a, b) => {
    if (sort === "rating") {
      return (
        Number(b.rating.replace(",", ".")) - Number(a.rating.replace(",", "."))
      )
    }
    if (sort === "price") {
      return a.min - b.min
    }
    return a.distance - b.distance
  })

  return [...list]
}

export async function getTechnician(id: number): Promise<Technician | null> {
  try {
    const data = await apiFetch<Technician>(`/api/technicians/${id}`)
    if (data && data.id) {
      return data
    }
  } catch (err: any) {
    console.warn(
      "[technicians.getTechnician] API call failed, falling back:",
      err.message,
    )
  }

  const tech = inMemoryStore.technicians.find((t) => t.id === id)
  return tech ? { ...tech } : null
}

export async function getTechnicianReviews(id: number): Promise<Review[]> {
  try {
    const data = await apiFetch<Review[]>(`/api/technicians/${id}/reviews`)
    if (Array.isArray(data)) {
      return data
    }
  } catch (err: any) {
    console.warn(
      "[technicians.getReviews] API call failed, falling back:",
      err.message,
    )
  }

  const tech = inMemoryStore.technicians.find((t) => t.id === id)
  if (!tech) return []
  return getMockReviewsForTechnician(tech)
}

export async function getShopStatus(
  technicianId: number = 1,
): Promise<ShopStatus> {
  try {
    const data = await apiFetch<{ status: ShopStatus }>(
      `/api/technicians/${technicianId}/status`,
    )
    if (data?.status) {
      return data.status
    }
  } catch (err: any) {
    console.warn(
      "[technicians.getShopStatus] API call failed, falling back:",
      err.message,
    )
  }

  return inMemoryStore.shopStatus
}

export async function setShopStatus(
  status: ShopStatus,
  technicianId: number = 1,
): Promise<ShopStatus> {
  try {
    const data = await apiFetch<{ status: ShopStatus }>(
      `/api/technicians/${technicianId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      },
    )
    if (data?.status) {
      inMemoryStore.shopStatus = data.status
      return data.status
    }
  } catch (err: any) {
    console.warn(
      "[technicians.setShopStatus] API call failed, falling back:",
      err.message,
    )
  }

  inMemoryStore.shopStatus = status
  const tech = inMemoryStore.technicians.find((t) => t.id === technicianId)
  if (tech) {
    tech.status =
      status === "buka" ? "open" : status === "sibuk" ? "busy" : "closed"
  }
  return inMemoryStore.shopStatus
}

export async function getFeaturedReviews(): Promise<Review[]> {
  try {
    const data = await apiFetch<Review[]>("/api/reviews/featured")
    if (Array.isArray(data)) {
      return data
    }
  } catch (err: any) {
    console.warn(
      "[technicians.getFeaturedReviews] API call failed, falling back:",
      err.message,
    )
  }

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
}

export async function registerTechnicianShop(shopData: {
  name: string
  phone: string
  email?: string
  shopName: string
  address: string
  hours?: string
  services?: string[]
  minPrice?: string | number
}): Promise<Technician> {
  try {
    const data = await apiFetch<Technician>("/api/technicians/register", {
      method: "POST",
      body: JSON.stringify(shopData),
    })
    if (data && data.id) {
      return data
    }
  } catch (err: any) {
    console.warn(
      "[technicians.registerShop] API call failed, falling back:",
      err.message,
    )
  }

  const min =
    typeof shopData.minPrice === "string"
      ? parseInt(shopData.minPrice, 10) || 100000
      : shopData.minPrice || 100000
  const devices = shopData.services?.filter((s) =>
    ["Laptop", "HP"].includes(s),
  ) ?? ["Laptop", "HP"]
  const newTech: Technician = {
    id: inMemoryStore.technicians.length + 1,
    name: shopData.shopName || shopData.name || "Tukang Servis",
    area: "Karawaci",
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
    address: shopData.address || "Karawaci, Kota Tangerang",
  }

  inMemoryStore.technicians.push(newTech)
  return newTech
}

export async function addTechnicianReview(
  technicianId: number,
  reviewData: { name: string; rating: number; text: string; service: string },
): Promise<Review> {
  try {
    const data = await apiFetch<Review>(`/api/technicians/${technicianId}/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
    if (data) {
      return data
    }
  } catch (err: any) {
    console.warn("[technicians.addReview] API call failed, falling back:", err.message)
  }

  const newReview: Review = {
    name: reviewData.name || "Pelanggan",
    date: "Baru saja",
    rating: reviewData.rating,
    text: reviewData.text,
    service: reviewData.service || "Servis perangkat",
  }
  return newReview
}

