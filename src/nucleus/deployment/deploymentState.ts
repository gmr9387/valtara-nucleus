// Phase 49 — Deployment State

export interface DeploymentState {
  deployed: boolean;
  lastDeployedAt?: string;
  services: string[];
}

export const deploymentState: DeploymentState = {
  deployed: false,
  services: [],
};
