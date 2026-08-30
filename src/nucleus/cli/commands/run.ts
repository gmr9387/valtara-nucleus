// src/nucleus/cli/commands/run.ts
// Full file — nucleus run <workflow.json>

import fs from "node:fs";
import { startWorkflow } from "../../../lib/workflows/runtime";

export class RunCommand {
  static async run(args: string[]) {
    const file = args[0];
    if (!file) {
      console.error("Usage: nucleus run <workflow.json>");
      return;
    }

    const raw = fs.readFileSync(file, "utf-8");
    const workflow = JSON.parse(raw);

    const result = await startWorkflow(workflow, workflow.organizationId);
    console.log(JSON.stringify(result, null, 2));
  }
}
