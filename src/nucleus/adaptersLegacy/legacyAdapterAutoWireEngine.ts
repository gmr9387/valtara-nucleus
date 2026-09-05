// Phase 45 — Legacy Adapter Auto-Wire Engine

import { legacyAdapterManifest } from "./legacyAdapterManifest";
import { legacyAdapterRegistry } from "./legacyAdapterRegistry";
import { legacyAdapterDependencyGraph } from "./legacyAdapterDependencyGraph";

export interface LegacyAdapterState {
  loaded: string[];
  lastLoadedAt?: string;
}

export const legacyAdapterState: LegacyAdapterState = {
  loaded: [],
};

export class LegacyAdapterAutoWireEngine {
  resolveDependencies(adapter: string) {
    const entry = legacyAdapterDependencyGraph.find((d) => d.adapter === adapter);
    return entry?.dependsOn ?? [];
  }

  async loadAdapter(adapter: string) {
    const instance = legacyAdapterRegistry[adapter];
    if (!instance) throw new Error(`Unknown legacy adapter: ${adapter}`);

    legacyAdapterState.loaded.push(adapter);
    legacyAdapterState.lastLoadedAt = new Date().toISOString();

    return instance;
  }

  async autoWire() {
    if (!legacyAdapterManifest.enabled) {
      throw new Error("Legacy adapter wiring disabled by manifest");
    }

    for (const adapter of legacyAdapterManifest.adapters) {
      const deps = this.resolveDependencies(adapter);

      for (const dep of deps) {
        if (!legacyAdapterState.loaded.includes(dep)) {
          await this.loadAdapter(dep);
        }
      }

      await this.loadAdapter(adapter);
    }

    return {
      loaded: legacyAdapterState.loaded,
      lastLoadedAt: legacyAdapterState.lastLoadedAt,
    };
  }
}

export const legacyAdapterAutoWireEngine = new LegacyAdapterAutoWireEngine();
