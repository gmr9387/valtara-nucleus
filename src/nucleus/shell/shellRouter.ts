// Phase 47 — Shell Router

import { shellCommands } from "./shellCommands";
import { shellState } from "./shellState";

export class ShellRouter {
  async execute(input: string) {
    const cmd = input.trim();

    shellState.history.push(cmd);
    shellState.lastExecutedAt = new Date().toISOString();

    if (cmd === "help") return shellCommands.help();
    if (cmd === "exit") return shellCommands.exit();

    return shellCommands["*"](cmd);
  }
}

export const shellRouter = new ShellRouter();
