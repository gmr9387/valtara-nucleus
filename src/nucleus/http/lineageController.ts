// src/nucleus/http/lineageController.ts
// Full file — Lineage retrieval controller

import { NucleusDBBridge } from "../db/nucleusDbBridge";

export class LineageController {
  static async get(req: any, res: any) {
    try {
      const org = req.params.organizationId;
      const db = new NucleusDBBridge();

      const { data, error } = await db.getClient()
        .from("nucleus_lineage")
        .select("*")
        .eq("organization_id", org);

      if (error) throw error;

      res.json({ lineage: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
