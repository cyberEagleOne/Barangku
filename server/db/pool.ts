import pg from "pg"
import { config } from "../config"

const { Pool } = pg

let pool: pg.Pool | null = null
let postgresConnected = false

export function getPool(): pg.Pool | null {
  if (pool) return pool

  const connectionString = config.databaseUrl

  try {
    if (connectionString) {
      pool = new Pool({
        connectionString,
        ssl: connectionString.includes("sslmode=require")
          ? { rejectUnauthorized: false }
          : undefined,
      })
    } else if (process.env.PGHOST || process.env.PGDATABASE) {
      pool = new Pool(config.pg)
    }
  } catch (err) {
    console.warn("[PostgreSQL] Failed to initialize connection pool:", err)
    pool = null
  }

  return pool
}

/**
 * Checks PostgreSQL connectivity.
 */
export async function testPostgresConnection(): Promise<boolean> {
  const currentPool = getPool()
  if (!currentPool) {
    postgresConnected = false
    return false
  }

  try {
    const client = await currentPool.connect()
    try {
      const res = await client.query("SELECT NOW() as now")
      console.log(
        `[PostgreSQL] Connected successfully to database at ${res.rows[0].now}`,
      )
      postgresConnected = true
      return true
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.warn(
      `[PostgreSQL] Connection check failed: ${error?.message || error}`,
    )
    console.warn(
      "[PostgreSQL] Falling back to in-memory persistence until database is available.",
    )
    postgresConnected = false
    return false
  }
}

export function isPostgresAvailable(): boolean {
  return postgresConnected
}

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[],
): Promise<pg.QueryResult<T>> {
  const currentPool = getPool()
  if (!currentPool || !postgresConnected) {
    throw new Error("PostgreSQL is not connected.")
  }
  return currentPool.query<T>(text, params)
}
