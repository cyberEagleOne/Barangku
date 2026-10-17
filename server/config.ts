import dotenv from "dotenv"
dotenv.config()

export const config = {
  port: parseInt(
    process.env.BACKEND_PORT ||
      (process.env.PORT && process.env.PORT !== "8443"
        ? process.env.PORT
        : "5000"),
    10,
  ),
  jwtSecret: process.env.JWT_SECRET || "barangku-secret-key-2026-tangerang",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // PostgreSQL Database Configuration
  databaseUrl: process.env.DATABASE_URL || "",
  pg: {
    host: process.env.PGHOST || "localhost",
    port: parseInt(process.env.PGPORT || "5432", 10),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres",
    database: process.env.PGDATABASE || "barangku",
    ssl:
      process.env.PGSSLMODE === "require"
        ? { rejectUnauthorized: false }
        : undefined,
  },

  // Geospatial default center (Kota Tangerang)
  defaultLocation: {
    latitude: -6.1783,
    longitude: 106.6319,
  },
}
