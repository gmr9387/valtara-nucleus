// Phase 41 — Single Startup Entrypoint

import { nucleusServer } from "./NucleusServer";

export async function startNucleus() {
  return nucleusServer.start();
}
