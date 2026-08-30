// src/nucleus/ops/nucleusServer.ts

/**
 * NucleusServer (Phase 10.1)
 *
 * Purpose:
 *   Provide a lightweight HTTP server surface for:
 *     - emitting contracts
 *     - retrieving lineage
 *     - finalizing runs
 *
 *   This is NOT a full web server.
 *   It is an operational wrapper around NucleusApi.
 */

import http from "node:http";
import { NucleusApi } from "../api/nucleusApi";

export class NucleusServer {
  private server: http.Server;

  constructor(private port: number) {
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  start() {
    this.server.listen(this.port);
    console.log(`NucleusServer running on port ${this.port}`);
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    if (!req.url || req.method !== "POST") {
      res.writeHead(404);
      return res.end();
    }

    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const body = JSON.parse(Buffer.concat(chunks).toString());
      const { subsystem, organizationId, name, version, payload } = body;

      const api = new NucleusApi(subsystem, organizationId);
      api.emit(name, version, payload);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
  }
}
