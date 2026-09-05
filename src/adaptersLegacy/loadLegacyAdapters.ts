// Phase 45 — Unified Legacy Adapter Loader

import { legacyAdapterAutoWireEngine } from "./legacyAdapterAutoWireEngine";

export async function loadLegacyAdapters() {
  return legacyAdapterAutoWireEngine.autoWire();
}
