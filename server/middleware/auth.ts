import type { NextFunction, Request, Response } from "express"
import { verifyToken, type TokenPayload } from "../services/authService"

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim()
  }
  return null
}

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  const token = extractToken(req)
  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      req.user = payload
    }
  }
  next()
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = extractToken(req)
  if (!token) {
    return res
      .status(401)
      .json({ error: "Akses ditolak. Token autentikasi diperlukan." })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res
      .status(401)
      .json({
        error:
          "Sesi kedaluwarsa atau token tidak valid. Silakan masuk kembali.",
      })
  }

  req.user = payload
  next()
}

export function requireRole(role: "pelanggan" | "tukang") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Akses ditolak. Silakan masuk terlebih dahulu." })
    }
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({
          error: `Akses khusus ${role}. Peran Anda saat ini: ${req.user.role}.`,
        })
    }
    next()
  }
}
