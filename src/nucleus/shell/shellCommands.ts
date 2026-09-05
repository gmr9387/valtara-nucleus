// Phase 47 — Shell Commands

import { nucleus } from "../cliSovereign/nucleus";

export const shellCommands = {
  help: () => ({
    commands: [
      "start",
      "pipeline",
      "adapters",
      "ci",
      "sovereignty",
      "activation",
      "federation",
      "autonomy",
      "resources",
      "lineage",
      "telemetry",
      "exit",
    ],
  }),

  exit: () => ({ exit: true }),

  // Everything else routes to the CLI
  "*": async (cmd: string) => nucleus(cmd),
};
