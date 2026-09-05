// Phase 41 — NucleusServer (Unified Startup Surface)

import { sovereigntyRuntime } from "../sovereignty/sovereigntyRuntime";
import { generateActivationProof } from "./runtimeActivationProof";
import { startupState } from "./startupState";
import { startupManifest } from "./startupManifest";

export class NucleusServer {
  async start() {
    if (startupManifest.verifyConstitution) {
      // Sovereignty boot enforces constitution
      const sovereign = sovereigntyRuntime.boot();
    }

    if (startupManifest.activateEnvironments) {
      generateActivationProof();
    }

    startupState.started = true;
    startupState.lastStartedAt = new Date().toISOString();

    return {
      entrypoint: startupState.entrypoint,
      started: startupState.started,
      lastStartedAt: startupState.lastStartedAt,
      sovereign: true,
    };
  }
}

export const nucleusServer = new NucleusServer();
