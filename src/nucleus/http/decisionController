// src/nucleus/http/decisionController.ts
// Full file — Decision engine controller

import { DecisionEngine } from "../decision/engine";

export class DecisionController {
  static async evaluate(req: any, res: any) {
    try {
      const { context } = req.body;
      const org = req.identity.getOrganizationId();
      const subsystem = req.identity.getSubsystem();

      const engine = new DecisionEngine(org, subsystem);
      const result = engine.evaluate(context);

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
