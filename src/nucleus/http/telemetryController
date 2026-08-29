// src/nucleus/http/telemetryController.ts
// Full file — Telemetry retrieval controller

import { NucleusDBBridge } from "../db/nucleusDbBridge";

export class TelemetryController {
  static async get(req: any, res: any) {
    try {
      const org = req.params.organizationId;
      const db = new NucleusDBBridge();

      const { data, error } = await db.getClient()
        .from("nucleus_telemetry")
        .select("*")
        .eq("organization_id", org);

      if (error) throw error;

      res.json({ telemetry: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
