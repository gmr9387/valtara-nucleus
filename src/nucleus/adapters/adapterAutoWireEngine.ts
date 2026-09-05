// Phase 43 — Adapter Auto-Wire Engine

import { adapterManifest } from "./adapterManifest";
import { adapterRegistry } from "./adapterRegistry";
import { adapterDependencyGraph } from "./adapterDependencyGraph";
import { adapterState } from "./adapterState";

export class AdapterAutoWireEngine {
  resolveDependencies(adapter: string) {
    const entry = adapterDependencyGraph.find((d) => d.adapter === adapter);
    return entry?.dependsOn ?? [];
  }

  async loadAdapter(adapter: string) {
    const instance = adapterRegistry[adapter];
    if (!instance) throw new Error(`Unknown adapter: ${adapter}`);

    adapterState.loaded.push(adapter);
    adapterState.lastLoadedAt = new Date().toISOString();

    return instance;
  }

  async autoWire() {
    if (!adapterManifest.enabled) {
      throw new Error("Adapter wiring disabled by manifest");
    }

    for (const adapter of adapterManifest.adapters) {
      const deps = this.resolveDependencies(adapter);

      for (const dep of deps) {
        if (!adapterState.loaded.includes(dep)) {
          await this.loadAdapter(dep);
        }
      }

      await this.loadAdapter(adapter);
    }

    return {
      loaded: adapterState.loaded,
      lastLoadedAt: adapterState.lastLoadedAt,
    };
  }
}

export const adapterAutoWireEngine = new AdapterAutoWireEngine();
