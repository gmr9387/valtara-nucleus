// Phase 42 — Pipeline Manifest

export interface PipelineManifest {
  enabled: boolean;
  steps: string[];
}

export const pipelineManifest: PipelineManifest = {
  enabled: true,
  steps: [
    "constitution.enforce",
    "sovereignty.boot",
    "environment.activate",
    "federation.initialize",
    "autonomy.initialize",
    "resources.initialize",
    "lineage.initialize",
    "telemetry.initialize",
    "workflows.initialize",
    "startup.complete",
  ],
};
