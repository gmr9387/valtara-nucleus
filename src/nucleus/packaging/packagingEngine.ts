// Phase 36 — Packaging Engine

import { createRuntimeBundle } from "./runtimeBundle";
import { createSubsystemBundle } from "./subsystemBundle";
import { createEnvironmentBundle } from "./environmentBundle";
import { createFederationBundle } from "./federationBundle";

export class PackagingEngine {
  runtime() {
    return createRuntimeBundle();
  }

  subsystem(subsystem: string) {
    return createSubsystemBundle(subsystem);
  }

  environment(environment: string) {
    return createEnvironmentBundle(environment);
  }

  federation() {
    return createFederationBundle();
  }
}

export const packagingEngine = new PackagingEngine();
