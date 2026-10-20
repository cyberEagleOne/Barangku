import {
  apiFetch,
  getAuthToken,
  getCachedUser,
  setAuthToken,
  setCachedUser,
} from "./client"
import { inMemoryStore, initialOrders } from "./mockData"
import type { User, UserRole } from "./types"

export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken()
  const cached = getCachedUser()

  if (!token && !cached) {
    return null
  }

  if (token) {
    try {
      const res = await apiFetch<{ user: User }>("/api/auth/me")
      if (res?.user) {
        setCachedUser(res.user)
        return res.user
      }
    } catch {
      // If token expired or network unreachable, fall back to cached
      if (cached) return cached
    }
  }

  return cached
}

export async function login(
  identity: string,
  password?: string,
  role: UserRole = "pelanggan",
): Promise<User> {
  const res = await apiFetch<{ user: User; token: string }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ identity, password, role }),
    },
  )

  if (res.token) {
    setAuthToken(res.token)
  }
  if (res.user) {
    setCachedUser(res.user)
    return res.user
  }

  throw new Error("Gagal memproses data akun.")
}

export async function register(userData: {
  name: string
  email?: string
  phone?: string
  role: UserRole
  password?: string
  agreed?: boolean
}): Promise<User> {
  const res = await apiFetch<{ user: User; token: string }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(userData),
    },
  )

  if (res.token) {
    setAuthToken(res.token)
  }
  if (res.user) {
    setCachedUser(res.user)
    return res.user
  }

  throw new Error("Gagal mendaftarkan akun.")
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" })
  } catch (err) {
    console.warn("[auth.logout] error:", err)
  } finally {
    setAuthToken(null)
    setCachedUser(null)
    inMemoryStore.orders = [...initialOrders]
    inMemoryStore.currentUser = null
  }
}

export async function requestPasswordReset(identity: string): Promise<void> {
  try {
    await apiFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ identity }),
    })
  } catch (err) {
    console.warn("[auth.requestPasswordReset] error:", err)
  }
}
