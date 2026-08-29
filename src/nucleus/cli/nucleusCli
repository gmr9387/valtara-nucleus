// src/nucleus/cli/nucleusCli.ts
// Full file — Nucleus CLI dispatcher

import { DevCommand } from "./commands/dev";
import { RunCommand } from "./commands/run";
import { InspectCommand } from "./commands/inspect";
import { LineageCommand } from "./commands/lineage";
import { TelemetryCommand } from "./commands/telemetry";
import { DecisionCommand } from "./commands/decision";

export class NucleusCli {
  static async execute(argv: string[]) {
    const cmd = argv[2];

    switch (cmd) {
      case "dev":
        return DevCommand.run();
      case "run":
        return RunCommand.run(argv.slice(3));
      case "inspect":
        return InspectCommand.run(argv.slice(3));
      case "lineage":
        return LineageCommand.run(argv.slice(3));
      case "telemetry":
        return TelemetryCommand.run(argv.slice(3));
      case "decision":
        return DecisionCommand.run(argv.slice(3));
      default:
        console.log("Nucleus CLI");
        console.log("Commands:");
        console.log("  nucleus dev");
        console.log("  nucleus run <workflow.json>");
        console.log("  nucleus inspect <org>");
        console.log("  nucleus lineage <org>");
        console.log("  nucleus telemetry <org>");
        console.log("  nucleus decision <context.json>");
    }
  }
}
