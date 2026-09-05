// Phase 27 — Nucleus Bootstrap

import { nucleus } from "./nucleusRuntime";
import "../contracts/contractBindings"; // ensure contracts are registered

export function bootstrapNucleus() {
  return nucleus;
}
