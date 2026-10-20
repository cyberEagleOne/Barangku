import { Router, type Response } from "express"
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth"
import {
  comparePassword,
  generateToken,
  hashPassword,
} from "../services/authService"
import { dbService } from "../services/dbService"

export const authRouter = Router()

// POST /api/auth/register
authRouter.post("/register", async (req, res: Response) => {
  try {
    const { name, email, phone, password, role = "pelanggan" } = req.body

    if (!name || (!email && !phone)) {
      return res
        .status(400)
        .json({ error: "Nama dan kontak (email atau nomor HP) wajib diisi." })
    }

    const identity = email?.trim() || phone?.trim()
    const existing = await dbService.getUserByIdentity(identity)
    if (existing) {
      return res
        .status(409)
        .json({ error: "Akun dengan email/nomor HP ini sudah terdaftar." })
    }

    const plainPassword = password || "password123"
    const passwordHash = await hashPassword(plainPassword)

    const user = await dbService.createUser({
      name: name.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      passwordHash,
      role: role === "tukang" ? "tukang" : "pelanggan",
      fresh: true,
    })

    const token = generateToken({
      id: user.id,
      role: user.role,
      contact: user.contact,
    })

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        contact: user.contact,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fresh: user.fresh,
      },
      token,
    })
  } catch (error: any) {
    console.error("[auth.register] Error:", error)
    return res
      .status(500)
      .json({ error: error.message || "Gagal mendaftarkan akun." })
  }
})

// POST /api/auth/login
authRouter.post("/login", async (req, res: Response) => {
  try {
    const { identity, password, role = "pelanggan" } = req.body

    if (!identity) {
      return res.status(400).json({ error: "Email atau nomor HP wajib diisi." })
    }

    const trimmed = identity.trim()
    const user = await dbService.getUserByIdentity(trimmed)

    if (!user) {
      return res.status(404).json({
        error: "Akun belum terdaftar. Silakan daftar akun baru terlebih dahulu.",
      })
    }

    if (!password) {
      return res.status(400).json({ error: "Kata sandi wajib diisi." })
    }

    if (user.password_hash) {
      const match = await comparePassword(password, user.password_hash)
      if (!match) {
        return res
          .status(401)
          .json({ error: "Kata sandi salah. Silakan coba lagi." })
      }
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      contact: user.contact,
    })

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        contact: user.contact,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fresh: user.fresh,
      },
      token,
    })
  } catch (error: any) {
    console.error("[auth.login] Error:", error)
    return res
      .status(500)
      .json({ error: error.message || "Gagal memproses login." })
  }
})

// GET /api/auth/me
authRouter.get(
  "/me",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Belum masuk." })
      }

      const user = await dbService.getUserById(req.user.id)
      if (!user) {
        return res.status(404).json({ error: "Data akun tidak ditemukan." })
      }

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          contact: user.contact,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fresh: user.fresh,
        },
      })
    } catch (error: any) {
      console.error("[auth.me] Error:", error)
      return res
        .status(500)
        .json({ error: error.message || "Gagal mengambil data akun." })
    }
  },
)

// POST /api/auth/logout
authRouter.post("/logout", (_req, res: Response) => {
  return res.json({ success: true, message: "Berhasil keluar." })
})

// POST /api/auth/forgot-password
authRouter.post("/forgot-password", (req, res: Response) => {
  const { identity } = req.body
  if (!identity) {
    return res.status(400).json({ error: "Kontak wajib diisi." })
  }
  return res.json({
    success: true,
    message: "Tautan pemulihan kata sandi telah dikirim ke " + identity,
  })
})

