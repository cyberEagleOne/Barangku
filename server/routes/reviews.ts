import { Router, type Response } from "express"
import { dbService } from "../services/dbService"

export const reviewsRouter = Router()

// GET /api/reviews/featured
reviewsRouter.get("/featured", (_req, res: Response) => {
  try {
    const featured = dbService.getFeaturedReviews()
    return res.json(featured)
  } catch (error: any) {
    console.error("[reviews.featured] Error:", error)
    return res
      .status(500)
      .json({ error: error.message || "Gagal memuat testimoni unggulan." })
  }
})
