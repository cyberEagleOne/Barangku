import {
  apiFetch,
  getAuthToken,
  getCachedUser,
  setAuthToken,
  setCachedUser,
} from "./client"
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
  try {
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
  } catch (err: any) {
    console.warn("[auth.login] API call failed, falling back:", err.message)
  }

  // Graceful fallback for offline dev/preview
  const trimmed = identity.trim()
  const derivedName = trimmed.includes("@")
    ? trimmed.split("@")[0].replace(/[._-]/g, " ").trim() || "Kamu"
    : role === "tukang"
      ? "Mas Dedi"
      : "Pelanggan Barangku"

  const fallbackUser: User = {
    id: `user-${Date.now()}`,
    name: derivedName,
    contact: trimmed,
    email: trimmed.includes("@") ? trimmed : undefined,
    phone: !trimmed.includes("@") ? trimmed : undefined,
    role,
    fresh: false,
  }
  setCachedUser(fallbackUser)
  return fallbackUser
}

export async function register(userData: {
  name: string
  email?: string
  phone?: string
  role: UserRole
  password?: string
  agreed?: boolean
}): Promise<User> {
  try {
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
  } catch (err: any) {
    console.warn("[auth.register] API call failed, falling back:", err.message)
  }

  const contact =
    userData.email?.trim() || userData.phone?.trim() || "0812-0000-0000"
  const fallbackUser: User = {
    id: `user-${Date.now()}`,
    name: userData.name.trim(),
    contact,
    email: userData.email?.trim(),
    phone: userData.phone?.trim(),
    role: userData.role,
    fresh: true,
  }
  setCachedUser(fallbackUser)
  return fallbackUser
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" })
  } catch (err) {
    console.warn("[auth.logout] error:", err)
  } finally {
    setAuthToken(null)
    setCachedUser(null)
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
