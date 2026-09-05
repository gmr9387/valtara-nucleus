// Phase 43 — Adapter Manifest

export interface AdapterManifest {
  enabled: boolean;
  adapters: string[];
}

export const adapterManifest: AdapterManifest = {
  enabled: true,
  adapters: [
    "weaver.adapter",
    "guardian.adapter",
    "glue.adapter",
    "dualpay.adapter",
    "resources.adapter",
    "lineage.adapter",
    "telemetry.adapter",
    "environment.adapter",
    "federation.adapter",
    "autonomy.adapter",
    "sovereignty.adapter",
  ],
};
