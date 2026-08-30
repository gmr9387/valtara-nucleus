// src/nucleus/integrations/nucleusDashboardRouter.ts

/**
 * Nucleus Dashboard Router
 *
 * Exposes:
 *   GET /nucleus/dashboard
 *
 * Returns:
 *   - subsystem health
 *   - metrics
 *   - last event
 *
 * This is a read-only introspection route.
 */

import { dashboardHandler } from "./nucleusDashboardApi";

export function registerNucleusDashboardRoute(app: any) {
  app.get("/nucleus/dashboard", async (_req: any, res: any) => {
    const snapshot = await dashboardHandler();
    res.json(snapshot);
  });

  console.log("[Nucleus] Dashboard route registered at /nucleus/dashboard");
}
