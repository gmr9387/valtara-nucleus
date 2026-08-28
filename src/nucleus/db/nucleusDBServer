// src/nucleus/db/nucleusDBServer.ts

/**
 * NucleusDBServer (Phase 13.5)
 *
 * Purpose:
 *   Provide an HTTP surface for OS apps to persist data
 *   through Nucleus → Supabase.
 */

import http from "node:http";
import { NucleusDBBridge } from "./nucleusDBBridge";

export class NucleusDBServer {
  private server: http.Server;

  constructor(
    private port: number,
    private subsystem: "weaver" | "guardian" | "glue" | "dualpay",
    private organizationId: string,
    private supabaseUrl: string,
    private supabaseKey: string
  ) {
    const bridge = new NucleusDBBridge(
      subsystem,
      organizationId,
      supabaseUrl,
      supabaseKey
    );

    this.server = http.createServer(async (req, res) => {
      if (!req.url || req.method !== "POST") {
        res.writeHead(404);
        return res.end();
      }

      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", async () => {
        const body = JSON.parse(Buffer.concat(chunks).toString());
        const { name, version, payload } = body;

        const result = await bridge.emit(name, version, payload);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      });
    });
  }

  start() {
    this.server.listen(this.port);
    console.log(`NucleusDBServer running on port ${this.port}`);
  }
}
