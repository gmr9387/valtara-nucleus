// Phase 42 — Pipeline Engines (Subsystem Delegates)

import { sovereigntyRuntime } from "../sovereignty/sovereigntyRuntime";
import { environmentActivationEngine } from "../activationEnv/environmentActivationEngine";
import { federationEngine } from "../federation/federationEngine";
import { autonomyEngine } from "../autonomy/autonomyEngine";
import { resourceGraph } from "../resources/resourceGraph";
import { lineageEngine } from "../lineage/lineageEngine";
import { telemetryEngine } from "../telemetry/telemetryEngine";
import { glueEngine } from "../workflows/glueEngine"; // your workflow engine

export const pipelineEngines = {
  constitution: {
    enforce: () => sovereigntyRuntime.enforce.enforce(),
  },

  sovereignty: {
    boot: () => sovereigntyRuntime.lifecycle.activate(),
  },

  environment: {
    activate: () => environmentActivationEngine.activateAll(),
  },

  federation: {
    initialize: () => ({
      tenants: federationEngine.identity.validateTenant,
      environments: federationEngine.identity.validateEnvironment,
    }),
  },

  autonomy: {
    initialize: () => ({
      health: autonomyEngine.health.checkAll(autonomyEngine.manifest.subsystems),
      routing: autonomyEngine.routing.route,
      correction: autonomyEngine.correction.correctResource,
    }),
  },

  resources: {
    initialize: () => resourceGraph.listResources(),
  },

  lineage: {
    initialize: () => lineageEngine.list(),
  },

  telemetry: {
    initialize: () => telemetryEngine.list(),
  },

  workflows: {
    initialize: () => glueEngine.initialize?.() ?? { initialized: true },
  },
};
