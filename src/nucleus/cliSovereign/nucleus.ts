// Phase 46 — CLI Entrypoint

import { cliRouter } from "./cliRouter";

export async function nucleus(command: string) {
  return cliRouter.execute(command);
}
