// src/nucleus/os/osServer.ts

/**
 * OSServer (Phase 12.3)
 *
 * Purpose:
 *   Provide a unified HTTP surface for OS apps to call Nucleus.
 *
 *   This is the endpoint your Lovable apps will hit.
 */

import http from "node:http";
import { OSBridge } from "./osBridge";
import { OSRouter } from "./osRouter";

export class OSServer {
  private server: http.Server;

  constructor(private port: number, private organizationId: string) {
    const bridge = new OSBridge(organizationId);
    const router = new OSRouter(bridge);

    this.server = http.createServer(async (req, res) => {
      if (!req.url || req.method !== "POST") {
        res.writeHead(404);
        return res.end();
      }

      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        const body = JSON.parse(Buffer.concat(chunks).toString());
        const result = router.route(body);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      });
    });
  }

  start() {
    this.server.listen(this.port);
    console.log(`OSServer running on port ${this.port}`);
  }
}
