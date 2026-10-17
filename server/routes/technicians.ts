import { Router, type Response } from "express"
import { optionalAuth, type AuthenticatedRequest } from "../middleware/auth"
import { dbService } from "../services/dbService"

export const techniciansRouter = Router()

// GET /api/technicians
techniciansRouter.get("/", async (req, res: Response) => {
  try {
    const { device, sort, userLat, userLng } = req.query

    // filters can be string or array
    let filters: string[] = []
    if (Array.isArray(req.query.filters)) {
      filters = (req.query.filters as string[])
    } else if (typeof req.query.filters === "string") {
      filters = req.query.filters
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (typeof device === "string") {
      filters = [device]
    }

    const technicians = await dbService.searchTechnicians({
      device: typeof device === "string" ? device : undefined,
      filters,
      sort: typeof sort === "string" ? sort : undefined,
      userLat: userLat ? parseFloat(userLat as string) : undefined,
      userLng: userLng ? parseFloat(userLng as string) : undefined,
    })

    return res.json(technicians)
  } catch (error: any) {
    console.error("[technicians.search] Error:", error)
    return res
      .status(500)
      .json({ error: error.message || "Gagal mencari bengkel/tukang servis." })
  }
})

// GET /api/technicians/:id
techniciansRouter.get("/:id", async (req, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID tukang tidak valid." })
    }

    const technician = await dbService.getTechnicianById(id)
    if (!technician) {
      return res.status(404).json({ error: "Profil tukang tidak ditemukan." })
    }

    return res.json(technician)
  } catch (error: any) {
    console.error("[technicians.getById] Error:", error)
    return res
      .status(500)
      .json({ error: error.message || "Gagal memuat profil tukang." })
  }
})

// GET /api/technicians/:id/reviews
techniciansRouter.get("/:id/reviews", async (req, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID tukang tidak valid." })
    }

    const reviews = await dbService.getTechnicianReviews(id)
    return res.json(reviews)
  } catch (error: any) {
    console.error("[technicians.reviews] Error:", error)
    return res
      .status(500)
      .json({ error: error.message || "Gagal memuat ulasan tukang." })
  }
})

// POST /api/technicians/:id/reviews
techniciansRouter.post(
  "/:id/reviews",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10)
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID tukang tidak valid." })
      }

      const { name, rating, text, service } = req.body
      if (!text || !rating) {
        return res
          .status(400)
          .json({ error: "Ulasan dan bintang rating wajib diisi." })
      }

      const review = await dbService.addTechnicianReview(
        id,
        {
          name: name || req.user?.contact || "Pelanggan",
          rating: Number(rating),
          text,
          service: service || "Servis perangkat",
        },
        req.user?.id,
      )

      return res.status(201).json(review)
    } catch (error: any) {
      console.error("[technicians.addReview] Error:", error)
      return res
        .status(500)
        .json({ error: error.message || "Gagal mengirimkan ulasan." })
    }
  },
)

// GET /api/technicians/:id/status
techniciansRouter.get("/:id/status", async (req, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10) || 1
    const status = await dbService.getShopStatus(id)
    return res.json({ status })
  } catch (error: any) {
    console.error("[technicians.getStatus] Error:", error)
    return res
      .status(500)
      .json({
        error: error.message || "Gagal mengambil status operasional bengkel.",
      })
  }
})

// PUT /api/technicians/:id/status (or PATCH)
techniciansRouter.put("/:id/status", async (req, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10) || 1
    const { status } = req.body

    if (!["buka", "sibuk", "tutup"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status harus salah satu dari: buka, sibuk, tutup." })
    }

    const updated = await dbService.setShopStatus(status, id)
    return res.json({ status: updated })
  } catch (error: any) {
    console.error("[technicians.setStatus] Error:", error)
    return res
      .status(500)
      .json({
        error: error.message || "Gagal mengubah status operasional bengkel.",
      })
  }
})

// POST /api/technicians/register
techniciansRouter.post(
  "/register",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        name,
        phone,
        email,
        shopName,
        address,
        hours,
        services,
        minPrice,
      } = req.body

      if (!shopName && !name) {
        return res
          .status(400)
          .json({ error: "Nama bengkel atau nama pemilik wajib diisi." })
      }
      if (!phone && !email) {
        return res
          .status(400)
          .json({ error: "Nomor telepon atau email bengkel wajib diisi." })
      }

      const technician = await dbService.registerTechnicianShop({
        userId: req.user?.id,
        name,
        phone,
        email,
        shopName,
        address,
        hours,
        services,
        minPrice,
      })

      return res.status(201).json(technician)
    } catch (error: any) {
      console.error("[technicians.register] Error:", error)
      return res
        .status(500)
        .json({ error: error.message || "Gagal mendaftarkan bengkel tukang." })
    }
  },
)
