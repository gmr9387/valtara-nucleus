// src/nucleus/http/subsystemController.ts
// Full file — Subsystem dispatch controller

import { NucleusSubsystemRouter } from "../subsystems/nucleusSubsystemRouter";

export class SubsystemController {
  static async dispatch(req: any, res: any) {
    try {
      const { type, version, payload } = req.body;
      const org = req.identity.getOrganizationId();

      const router = new NucleusSubsystemRouter(org);
      const result = await router.dispatch(type, version, payload);

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
