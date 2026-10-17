import { app } from "./app"
import { config } from "./config"
import { testPostgresConnection } from "./db/pool"

async function startServer() {
  console.log("----------------------------------------------------")
  console.log("⚡ Menjalankan Barangku Backend Server...")
  console.log("----------------------------------------------------")

  // Test PostgreSQL connection
  const hasPg = await testPostgresConnection()
  if (hasPg) {
    console.log("✅ PostgreSQL database terhubung dan siap digunakan.")
  } else {
    console.log("ℹ️  PostgreSQL belum terdeteksi (DATABASE_URL belum disetel).")
    console.log("   Backend berjalan dengan in-memory fallback persistence.")
    console.log(
      "   Saat rekan Anda selesai menyiapkan PostgreSQL, set DATABASE_URL di .env.",
    )
  }

  const server = app.listen(config.port, () => {
    console.log(
      `🚀 Barangku Backend API aktif di http://localhost:${config.port}`,
    )
    console.log(`   Health check: http://localhost:${config.port}/api/health`)
    console.log("----------------------------------------------------")
  })

  const shutdown = () => {
    console.log("\nMematikan server Barangku...")
    server.close(() => {
      console.log("Server berhasil dimatikan.")
      process.exit(0)
    })
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err)
  process.exit(1)
})
