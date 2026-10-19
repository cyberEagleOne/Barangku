import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"
import pg from "pg"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env
dotenv.config()

const { Client } = pg

async function runSetup() {
  console.log("\n==================================================")
  console.log("🛠️  Barangku Database Setup & PostGIS Initializer")
  console.log("==================================================\n")

  const host = process.env.PGHOST || "localhost"
  const port = parseInt(process.env.PGPORT || "5432", 10)
  const user = process.env.PGUSER || "postgres"
  const password = process.env.PGPASSWORD || "postgres"
  const targetDb = process.env.PGDATABASE || "barangku"

  let connectionUrl = process.env.DATABASE_URL
  if (!connectionUrl) {
    connectionUrl = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${targetDb}`
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(connectionUrl)
  } catch {
    console.error("❌ Format DATABASE_URL tidak valid:", connectionUrl)
    process.exit(1)
  }

  const dbNameToUse = parsedUrl.pathname.replace(/^\//, "") || targetDb
  const adminDbUrl = new URL(parsedUrl.toString())
  adminDbUrl.pathname = "/postgres"

  console.log(`📡 Menghubungkan ke PostgreSQL di ${parsedUrl.host}...`)
  console.log(`👤 Pengguna: ${parsedUrl.username}`)
  console.log(`🗄️  Database target: ${dbNameToUse}\n`)

  // 1. Periksa / buat database
  const adminClient = new Client({
    connectionString: adminDbUrl.toString(),
  })

  try {
    await adminClient.connect()
    console.log("✅ Berhasil tersambung ke server PostgreSQL.")

    const checkDb = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbNameToUse],
    )

    if (checkDb.rows.length === 0) {
      console.log(`📦 Database '${dbNameToUse}' belum ada. Membuat database baru...`)
      await adminClient.query(`CREATE DATABASE "${dbNameToUse}"`)
      console.log(`✅ Database '${dbNameToUse}' berhasil dibuat!`)
    } else {
      console.log(`ℹ️  Database '${dbNameToUse}' sudah tersedia.`)
    }
  } catch (err: any) {
    console.warn(`⚠️  Peringatan saat memeriksa database induk: ${err.message}`)
    console.log("Mencoba langsung menyambung ke database target...")
  } finally {
    try {
      await adminClient.end()
    } catch {}
  }

  // 2. Hubungkan langsung ke database target
  const targetClient = new Client({
    connectionString: connectionUrl,
  })

  try {
    await targetClient.connect()
    console.log(`\n🔗 Tersambung ke database '${dbNameToUse}'.`)

    // 3. Jalankan schema.sql
    const schemaPath = path.resolve(__dirname, "schema.sql")
    if (fs.existsSync(schemaPath)) {
      console.log("📜 Menjalankan server/db/schema.sql...")
      const schemaSql = fs.readFileSync(schemaPath, "utf-8")
      await targetClient.query(schemaSql)
      console.log("✅ Skema database, tabel, tipe ENUM, dan indeks berhasil dibuat!")
    } else {
      console.warn("⚠️  File server/db/schema.sql tidak ditemukan.")
    }

    // 4. Verifikasi PostGIS (opsional & anggun)
    try {
      const extCheck = await targetClient.query(
        "SELECT 1 FROM pg_extension WHERE extname = 'postgis'",
      )
      if (extCheck.rows.length > 0) {
        const postgisRes = await targetClient.query(
          "SELECT PostGIS_Version() as version",
        )
        console.log(`\n🌍 PostGIS Terpasang & Aktif! Versi: ${postgisRes.rows[0].version}`)
      } else {
        console.log("\nℹ️  Ekstensi PostGIS belum terpasang di PostgreSQL server ini.")
        console.log("   Sistem beroperasi dalam mode PostgreSQL Standar (kalkulasi jarak via koordinat GPS Lat/Lng).")
      }
    } catch {
      console.log("\nℹ️  Mode: Standar PostgreSQL Aktif.")
    }

    // 5. Jalankan seed.sql
    const seedPath = path.resolve(__dirname, "seed.sql")
    if (fs.existsSync(seedPath)) {
      console.log("\n🌱 Menjalankan server/db/seed.sql (data awal bengkel, ulasan, & akun demo)...")
      const seedSql = fs.readFileSync(seedPath, "utf-8")
      await targetClient.query(seedSql)
      console.log("✅ Seeding data berhasil dijalankan!")
    }

    // 6. Ringkasan Data
    console.log("\n📊 Ringkasan Data di Database:")
    const usersCount = await targetClient.query("SELECT COUNT(*) FROM users")
    const techCount = await targetClient.query("SELECT COUNT(*) FROM technicians")
    const ordersCount = await targetClient.query("SELECT COUNT(*) FROM orders")
    const reviewsCount = await targetClient.query("SELECT COUNT(*) FROM reviews")

    console.log(`  - Akun Users       : ${usersCount.rows[0].count}`)
    console.log(`  - Bengkel Teknisi  : ${techCount.rows[0].count}`)
    console.log(`  - Pesanan (Orders) : ${ordersCount.rows[0].count}`)
    console.log(`  - Ulasan (Reviews) : ${reviewsCount.rows[0].count}`)

    console.log("\n✨ DATABASE SIAP DIGUNAKAN DENGAN SEMPURNA! ✨")
    console.log("Akun Demo:")
    console.log("  - Pelanggan : rina@email.com / password123")
    console.log("  - Teknisi   : dedi@barangku.id / password123\n")
  } catch (err: any) {
    console.error("\n❌ Gagal menyiapkan database:", err.message)
    console.log("\n💡 Solusi:")
    console.log("1. Periksa password PostgreSQL Anda di berkas .env")
    console.log("2. Pastikan service PostgreSQL (postgresql-x64-18) sedang aktif di Windows")
    process.exit(1)
  } finally {
    try {
      await targetClient.end()
    } catch {}
  }
}

runSetup()
