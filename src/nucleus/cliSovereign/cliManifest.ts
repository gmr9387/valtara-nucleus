// Phase 46 — CLI Manifest

export interface CLIManifest {
  enabled: boolean;
  commands: string[];
}

export const cliManifest: CLIManifest = {
  enabled: true,
  commands: [
    "start",
    "pipeline",
    "adapters",
    "ci",
    "sovereignty",
    "activation",
    "federation",
    "autonomy",
    "resources",
    "lineage",
    "telemetry",
  ],
};
