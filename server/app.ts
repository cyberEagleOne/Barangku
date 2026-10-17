import cors from "cors"
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express"
import { isPostgresAvailable } from "./db/pool"
import { authRouter } from "./routes/auth"
import { ordersRouter } from "./routes/orders"
import { reviewsRouter } from "./routes/reviews"
import { techniciansRouter } from "./routes/technicians"

export const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "Barangku Backend API",
    time: new Date().toISOString(),
    postgresConnected: isPostgresAvailable(),
  })
})

// Route mountings
app.use("/api/auth", authRouter)
app.use("/api/technicians", techniciansRouter)
app.use("/api/orders", ordersRouter)
app.use("/api/reviews", reviewsRouter)

// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Barangku Backend Error]:", err)
  res.status(err.status || 500).json({
    error: err.message || "Terjadi kesalahan pada server internal.",
  })
})
