// Phase 43 — Unified Adapter Loader

import { adapterAutoWireEngine } from "./adapterAutoWireEngine";

export async function loadAdapters() {
  return adapterAutoWireEngine.autoWire();
}
