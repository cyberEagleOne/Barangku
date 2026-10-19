import { apiFetch, getCachedUser } from "./client"
import { inMemoryStore, initialTechnicians } from "./mockData"
import type { BookingDetails, Order, OrderStatus, Technician } from "./types"

export async function getOrder(code: string): Promise<Order | null> {
  try {
    const data = await apiFetch<Order>(
      `/api/orders/${encodeURIComponent(code)}`,
    )
    if (data && data.code) {
      return data
    }
  } catch (err: any) {
    console.warn(
      "[orders.getOrder] API call failed, falling back:",
      err.message,
    )
  }

  const found = inMemoryStore.orders.find((o) => o.code === code)
  return found ? { ...found } : null
}

export async function getMyOrders(userContact?: string): Promise<Order[]> {
  const effectiveContact =
    userContact ||
    getCachedUser()?.contact ||
    getCachedUser()?.phone ||
    getCachedUser()?.email

  try {
    const query = effectiveContact
      ? `?userContact=${encodeURIComponent(effectiveContact)}`
      : ""
    const data = await apiFetch<Order[]>(`/api/orders/my${query}`)
    if (Array.isArray(data)) {
      return data
    }
  } catch (err: any) {
    console.warn(
      "[orders.getMyOrders] API call failed, falling back:",
      err.message,
    )
  }

  if (!effectiveContact) {
    return []
  }

  const normalized = effectiveContact.trim().toLowerCase()
  const list = inMemoryStore.orders.filter((o) => {
    const phone = o.customerPhone?.trim().toLowerCase()
    const name = o.customerName?.trim().toLowerCase()
    const id = (o as any).customerId?.trim().toLowerCase()
    return phone === normalized || name === normalized || id === normalized
  })
  return [...list]
}

export async function getTechnicianOrders(
  technicianId?: number,
): Promise<Order[]> {
  try {
    const query = technicianId ? `?technicianId=${technicianId}` : ""
    const data = await apiFetch<Order[]>(`/api/orders/technician${query}`)
    if (Array.isArray(data)) {
      return data
    }
  } catch (err: any) {
    console.warn(
      "[orders.getTechnicianOrders] API call failed, falling back:",
      err.message,
    )
  }

  const list = inMemoryStore.orders.filter(
    (o) => !technicianId || o.technicianId === technicianId,
  )
  return [...list]
}

export async function createOrder(data: {
  technician: Technician
  details: BookingDetails
  photoName?: string
  photoUrl?: string
  customerName?: string
  customerPhone?: string
  customerId?: string
  code?: string
}): Promise<Order> {
  const cachedUser = getCachedUser()
  const finalCustomerName =
    data.customerName ||
    cachedUser?.name ||
    cachedUser?.contact ||
    "Pelanggan"
  const finalCustomerPhone =
    data.customerPhone ||
    cachedUser?.phone ||
    cachedUser?.contact ||
    "0812-0000-0000"
  const finalCustomerId = data.customerId || cachedUser?.id

  try {
    const result = await apiFetch<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        technicianId: data.technician?.id,
        technician: data.technician,
        details: data.details,
        photoName: data.photoName,
        photoUrl: data.photoUrl,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        code: data.code,
      }),
    })
    if (result && result.code) {
      const orderWithUser = {
        ...result,
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
      }
      // Also cache in local memory store for instant cross-tab/memory sync
      inMemoryStore.orders = [
        orderWithUser,
        ...inMemoryStore.orders.filter((o) => o.code !== result.code),
      ]
      return orderWithUser
    }
  } catch (err: any) {
    console.warn(
      "[orders.createOrder] API call failed, falling back:",
      err.message,
    )
  }

  const code =
    data.code || `BRK-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const tech = data.technician || initialTechnicians[0]
  const now = new Date()

  const newOrder: Order & { isCustomerOrder?: boolean; customerId?: string } = {
    code,
    technician: tech,
    technicianId: tech.id,
    shop: tech.name,
    details: data.details,
    photoName: data.photoName || "",
    photoUrl: data.photoUrl || "",
    status: 0,
    estimateMin: tech.min,
    estimateMax: tech.max,
    message: "Pesanan masuk, menunggu konfirmasi tukang.",
    incoming: true,
    rejected: false,
    customerName: finalCustomerName,
    customerPhone: finalCustomerPhone,
    customerId: finalCustomerId,
    device: data.details.device,
    model: data.details.model,
    damage: data.details.problem,
    date: data.details.date,
    time: data.details.time,
    statusLogs: [
      {
        status: 0,
        label: "Dipesan",
        timestamp: now.toISOString(),
        date: now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(":", "."),
        note: "Pesanan masuk, menunggu konfirmasi tukang.",
      },
    ],
    isCustomerOrder: true,
  }

  inMemoryStore.orders = [
    newOrder,
    ...inMemoryStore.orders.filter((o) => o.code !== code),
  ]
  return { ...newOrder }
}

export async function updateOrderStatus(
  code: string,
  status: OrderStatus,
  details?: {
    message?: string
    estimateMin?: number
    estimateMax?: number
    rejected?: boolean
    incoming?: boolean
  },
): Promise<Order> {
  try {
    const result = await apiFetch<Order>(
      `/api/orders/${encodeURIComponent(code)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
          ...details,
        }),
      },
    )
    if (result && result.code) {
      const idx = inMemoryStore.orders.findIndex((o) => o.code === code)
      if (idx !== -1) {
        inMemoryStore.orders[idx] = result
      }
      return result
    }
  } catch (err: any) {
    console.warn(
      "[orders.updateOrderStatus] API call failed, falling back:",
      err.message,
    )
  }

  const orderIndex = inMemoryStore.orders.findIndex((o) => o.code === code)
  if (orderIndex === -1) {
    throw new Error(`Order ${code} tidak ditemukan.`)
  }

  const existing = inMemoryStore.orders[orderIndex]
  const newEstimateMin =
    details?.estimateMin !== undefined
      ? details.estimateMin
      : existing.estimateMin
  const newEstimateMax =
    details?.estimateMax !== undefined
      ? details.estimateMax
      : existing.estimateMax

  const updated: Order = {
    ...existing,
    status,
    technician: {
      ...existing.technician,
      min: newEstimateMin ?? existing.technician.min,
      max: newEstimateMax ?? existing.technician.max,
    },
    ...(details?.message !== undefined ? { message: details.message } : {}),
    ...(details?.estimateMin !== undefined
      ? { estimateMin: details.estimateMin }
      : {}),
    ...(details?.estimateMax !== undefined
      ? { estimateMax: details.estimateMax }
      : {}),
    ...(details?.rejected !== undefined ? { rejected: details.rejected } : {}),
    ...(details?.incoming !== undefined ? { incoming: details.incoming } : {}),
  }

  inMemoryStore.orders[orderIndex] = updated
  return { ...updated }
}

export async function acceptOrder(code: string): Promise<Order> {
  try {
    const result = await apiFetch<Order>(
      `/api/orders/${encodeURIComponent(code)}/accept`,
      {
        method: "POST",
      },
    )
    if (result && result.code) {
      const idx = inMemoryStore.orders.findIndex((o) => o.code === code)
      if (idx !== -1) {
        inMemoryStore.orders[idx] = result
      }
      return result
    }
  } catch (err: any) {
    console.warn(
      "[orders.acceptOrder] API call failed, falling back:",
      err.message,
    )
  }

  return updateOrderStatus(code, 1, { incoming: false, rejected: false })
}

export async function rejectOrder(code: string): Promise<Order> {
  try {
    const result = await apiFetch<Order>(
      `/api/orders/${encodeURIComponent(code)}/reject`,
      {
        method: "POST",
      },
    )
    if (result && result.code) {
      const idx = inMemoryStore.orders.findIndex((o) => o.code === code)
      if (idx !== -1) {
        inMemoryStore.orders[idx] = result
      }
      return result
    }
  } catch (err: any) {
    console.warn(
      "[orders.rejectOrder] API call failed, falling back:",
      err.message,
    )
  }

  return updateOrderStatus(code, -1, { incoming: false, rejected: true })
}
