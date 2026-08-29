// src/nucleus/server.ts
// Full file — Nucleus server bootstrap

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { HttpRouter } from "./http/httpRouter";
import { NucleusRuntime } from "./ops/nucleusRuntime";

export class NucleusServer {
  private app = express();
  private port = Number(process.env.NUCLEUS_PORT || 5151);

  constructor() {
    this.configure();
    this.registerRoutes();
    this.startRuntime();
  }

  private configure() {
    this.app.use(cors());
    this.app.use(bodyParser.json({ limit: "2mb" }));
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  private registerRoutes() {
    const router = new HttpRouter(this.app);
    router.register();
  }

  private startRuntime() {
    const subsystem = process.env.NUCLEUS_RUNTIME_SUBSYSTEM || "weaver";
    const organizationId = process.env.NUCLEUS_ORGANIZATION_ID || "org-1";

    const runtime = new NucleusRuntime(subsystem, organizationId);
    runtime.start();

    console.log(`[Nucleus] Runtime started for subsystem: ${subsystem}`);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`[Nucleus] HTTP server running on port ${this.port}`);
    });
  }
}

// Auto-start if executed directly
if (require.main === module) {
  const server = new NucleusServer();
  server.start();
}
