import type { Plugin } from "vite"
import { app } from "./app"
import { testPostgresConnection } from "./db/pool"

/**
 * Vite plugin that mounts the Barangku backend API middleware into the Vite development server.
 * Allows frontend to make direct /api calls during development on the same port (e.g., 8443).
 */
export function barangkuBackendPlugin(): Plugin {
  return {
    name: "barangku-backend-api",
    apply: "serve",
    async configureServer(server) {
      console.log("⚡ Initializing Barangku Backend API middleware in Vite...")
      await testPostgresConnection()

      // Mount Express app onto Vite middlewares
      server.middlewares.use(app)
    },
  }
}
