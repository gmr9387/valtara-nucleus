// Phase 49 — Deployment Manifest

export interface DeploymentManifest {
  enabled: boolean;
  supabase: boolean;
  apiServer: boolean;
  osGuardian: boolean;
  dashboard: boolean;
}

export const deploymentManifest: DeploymentManifest = {
  enabled: true,
  supabase: true,
  apiServer: true,
  osGuardian: true,
  dashboard: true,
};
