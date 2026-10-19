import { Router, type Response } from "express"
import { optionalAuth, type AuthenticatedRequest } from "../middleware/auth"
import { dbService } from "../services/dbService"

export const ordersRouter = Router()

// POST /api/orders
ordersRouter.post(
  "/",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        technician,
        technicianId,
        details,
        photoName,
        photoUrl,
        customerName,
        customerPhone,
        code,
      } = req.body

      const targetTechId = technicianId || technician?.id || 1
      if (!details || !details.device || !details.model || !details.problem) {
        return res
          .status(400)
          .json({
            error:
              "Rincian pesanan (perangkat, model, dan kerusakan) wajib diisi.",
          })
      }

      const order = await dbService.createOrder({
        technicianId: targetTechId,
        details,
        photoName,
        photoUrl,
        customerName:
          customerName || (req.user ? req.user.contact : "Pelanggan"),
        customerPhone:
          customerPhone || (req.user ? req.user.contact : "0812-0000-0000"),
        customerId: req.user?.id,
        code,
      })

      return res.status(201).json(order)
    } catch (error: any) {
      console.error("[orders.create] Error:", error)
      return res
        .status(500)
        .json({ error: error.message || "Gagal membuat pesanan baru." })
    }
  },
)

// GET /api/orders/my
ordersRouter.get(
  "/my",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userContact = (req.query.userContact as string) || req.user?.contact
      const userId = req.user?.id

      if (!userContact && !userId) {
        return res.json([])
      }

      const orders = await dbService.getMyOrders(userContact, userId)
      return res.json(orders)
    } catch (error: any) {
      console.error("[orders.my] Error:", error)
      return res
        .status(500)
        .json({ error: error.message || "Gagal memuat daftar pesanan Anda." })
    }
  },
)

// GET /api/orders/technician
ordersRouter.get(
  "/technician",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const technicianId = parseInt(req.query.technicianId as string, 10) || 1
      const orders = await dbService.getTechnicianOrders(technicianId)
      return res.json(orders)
    } catch (error: any) {
      console.error("[orders.technician] Error:", error)
      return res
        .status(500)
        .json({
          error: error.message || "Gagal memuat pesanan masuk untuk tukang.",
        })
    }
  },
)

// GET /api/orders/:code
ordersRouter.get("/:code", async (req, res: Response) => {
  try {
    const code = req.params.code as string
    const order = await dbService.getOrder(code)
    if (!order) {
      return res
        .status(404)
        .json({ error: `Pesanan dengan kode ${code} tidak ditemukan.` })
    }
    return res.json(order)
  } catch (error: any) {
    console.error("[orders.getByCode] Error:", error)
    return res
      .status(500)
      .json({ error: error.message || "Gagal mencari pesanan." })
  }
})

// PATCH /api/orders/:code/status
ordersRouter.patch(
  "/:code/status",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const code = req.params.code as string
      const { status, message, estimateMin, estimateMax, rejected, incoming } =
        req.body

      if (status === undefined || typeof status !== "number") {
        return res
          .status(400)
          .json({ error: "Kode status baru (number) wajib disertakan." })
      }

      if (status < -1 || status > 5) {
        return res
          .status(400)
          .json({ error: "Status pesanan harus bernilai antara -1 hingga 5." })
      }

      const updated = await dbService.updateOrderStatus(
        code,
        status,
        {
          message,
          estimateMin,
          estimateMax,
          rejected,
          incoming,
        },
        req.user?.id,
      )

      return res.json(updated)
    } catch (error: any) {
      console.error("[orders.updateStatus] Error:", error)
      return res
        .status(500)
        .json({ error: error.message || "Gagal memperbarui status pesanan." })
    }
  },
)

// POST /api/orders/:code/accept
ordersRouter.post(
  "/:code/accept",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const code = req.params.code as string
      const updated = await dbService.acceptOrder(code, req.user?.id)
      return res.json(updated)
    } catch (error: any) {
      console.error("[orders.accept] Error:", error)
      return res
        .status(500)
        .json({ error: error.message || "Gagal menerima pesanan." })
    }
  },
)

// POST /api/orders/:code/reject
ordersRouter.post(
  "/:code/reject",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const code = req.params.code as string
      const updated = await dbService.rejectOrder(code, req.user?.id)
      return res.json(updated)
    } catch (error: any) {
      console.error("[orders.reject] Error:", error)
      return res
        .status(500)
        .json({ error: error.message || "Gagal menolak pesanan." })
    }
  },
)
