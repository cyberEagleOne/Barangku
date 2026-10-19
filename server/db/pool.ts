import pg from "pg"
import { config } from "../config"

const { Pool } = pg

let pool: pg.Pool | null = null
let postgresConnected = false
let postgisAvailable = false

export function isPostgisAvailable(): boolean {
  return postgisAvailable
}

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
    postgisAvailable = false
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

      try {
        const pgis = await client.query(
          "SELECT 1 FROM pg_extension WHERE extname = 'postgis'",
        )
        postgisAvailable = pgis.rows.length > 0
        if (postgisAvailable) {
          console.log("[PostgreSQL] PostGIS spatial extension is active.")
        } else {
          console.log(
            "[PostgreSQL] PostGIS not enabled. Operating in standard PostgreSQL mode.",
          )
        }
      } catch {
        postgisAvailable = false
      }

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
    postgisAvailable = false
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

/**
 * Executes a callback within a managed database transaction.
 * Automatically issues BEGIN, COMMIT on success, and ROLLBACK on error.
 */
export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const currentPool = getPool()
  if (!currentPool || !postgresConnected) {
    throw new Error("PostgreSQL is not connected.")
  }
  const client = await currentPool.connect()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}
