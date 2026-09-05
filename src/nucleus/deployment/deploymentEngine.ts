// Phase 35 — Deployment Engine

import { deploymentManifest } from "./deploymentManifest";
import { subsystemDeploymentMap } from "./subsystemDeploymentMap";
import { environmentDeploymentMap } from "./environmentDeploymentMap";
import { resourcePartitionMap } from "./resourcePartitionMap";

export class DeploymentEngine {
  getManifest() {
    return deploymentManifest;
  }

  getSubsystemDeployment(subsystem: string) {
    return subsystemDeploymentMap.find((s) => s.subsystem === subsystem);
  }

  getEnvironmentDeployment(environment: string) {
    return environmentDeploymentMap.find((e) => e.environment === environment);
  }

  getResourcePartition(resourceType: string) {
    return resourcePartitionMap.find((r) => r.resourceType === resourceType);
  }
}

export const deploymentEngine = new DeploymentEngine();
