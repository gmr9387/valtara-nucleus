// src/nucleus/api/openai/openApiRouter.ts
// Full file — OpenAPI Router

import { NucleusOpenApi } from "./index";

export function bindOpenApiRoutes(app: any) {
  // -----------------------------
  // Serve OpenAPI JSON
  // -----------------------------
  app.get("/openapi.json", (_req: any, res: any) => {
    res.status(200).json(NucleusOpenApi);
  });

  // -----------------------------
  // Optional: Serve raw OpenAPI object for internal tools
  // -----------------------------
  app.get("/openapi", (_req: any, res: any) => {
    res.status(200).json(NucleusOpenApi);
  });
}
