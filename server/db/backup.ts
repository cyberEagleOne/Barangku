/**
 * ==============================================================================
 * Barangku Database Backup & Retention Sanitization Script
 * ==============================================================================
 * Digunakan untuk:
 * 1. Membuat file backup SQL / snapshot data dari PostgreSQL ke folder backups/
 * 2. Membersihkan log audit status pesanan usang sesuai kebijakan retensi (default 90 hari)
 *
 * Jalankan dengan:
 *   npm run db:backup
 *   npm run db:backup -- --retention=30 (untuk membersihkan log > 30 hari)
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"
import pg from "pg"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "../..")
const backupDir = path.join(rootDir, "backups")

const { Client } = pg

async function runBackup() {
  console.log("\n==================================================")
  console.log("💾  Barangku Database Backup & Sanitation Runner")
  console.log("==================================================\n")

  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:060605@localhost:5432/barangku"

  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log("✅ Berhasil tersambung ke database PostgreSQL.\n")

    // 1. Buat direktori backups jika belum ada
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
      console.log(`📁 Membuat direktori backup: ${backupDir}`)
    }

    const now = new Date()
    const timestamp = now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\..+/, "")
      .replace("T", "_")

    const backupFilePath = path.join(backupDir, `backup_barangku_${timestamp}.sql`)

    console.log(`⏳ Sedang mengekspor data ke ${path.basename(backupFilePath)}...`)

    // 2. Ekspor data tabel utama ke format SQL
    const tables = ["users", "technicians", "orders", "order_status_logs", "reviews"]
    const sqlChunks: string[] = []

    sqlChunks.push(`-- ==============================================================`)
    sqlChunks.push(`-- BARANGKU DATABASE BACKUP SNAPSHOT`)
    sqlChunks.push(`-- Timestamp: ${now.toISOString()}`)
    sqlChunks.push(`-- ==============================================================\n`)

    for (const table of tables) {
      const res = await client.query(`SELECT * FROM "${table}"`)
      sqlChunks.push(`-- Data Table: ${table} (Total: ${res.rows.length} baris)`)

      if (res.rows.length > 0) {
        for (const row of res.rows) {
          const keys = Object.keys(row)
          const cols = keys.map((k) => `"${k}"`).join(", ")
          const vals = keys
            .map((k) => {
              const v = row[k]
              if (v === null || v === undefined) return "NULL"
              if (typeof v === "boolean" || typeof v === "number") return String(v)
              if (Array.isArray(v)) {
                const escapedArr = v.map((item) => `"${item}"`).join(",")
                return `'${escapedArr}'`
              }
              if (v instanceof Date) return `'${v.toISOString()}'`
              // Escape single quotes for string
              return `'${String(v).replace(/'/g, "''")}'`
            })
            .join(", ")

          sqlChunks.push(`INSERT INTO "${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;`)
        }
      }
      sqlChunks.push("")
    }

    fs.writeFileSync(backupFilePath, sqlChunks.join("\n"), "utf-8")
    const stats = fs.statSync(backupFilePath)
    console.log(`✅ File backup berhasil disimpan! Ukuran: ${(stats.size / 1024).toFixed(2)} KB`)

    // 3. Kebijakan Retensi / Sanitasi Data
    const retentionArg = process.argv.find((a) => a.startsWith("--retention="))
    const retentionDays = retentionArg ? parseInt(retentionArg.split("=")[1], 10) : 90

    console.log(`\n🧹 Menjalankan sanitasi data (Kebijakan retensi: ${retentionDays} hari)...`)

    const pruneLogsRes = await client.query(
      `DELETE FROM order_status_logs 
       WHERE created_at < NOW() - ($1 || ' days')::INTERVAL
       RETURNING id`,
      [retentionDays],
    )

    console.log(`✅ Sanitasi log selesai: ${pruneLogsRes.rowCount ?? 0} log usang dibersihkan.`)

    console.log("\n==================================================")
    console.log("🎉  Proses Backup & Sanitasi Sukses Diselesaikan!")
    console.log("==================================================\n")
  } catch (err: any) {
    console.error("❌ Gagal menjalankan backup:", err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runBackup()
