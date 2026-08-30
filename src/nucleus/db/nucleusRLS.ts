// src/nucleus/db/nucleusRLS.ts
// Constitutional Row-Level Security Enforcement

import { NucleusTelemetryAdapter } from "../telemetry/nucleusTelemetryAdapter";
import { getSubsystem } from "../subsystems/subsystemRegistry";

export class NucleusRLS {
  private telemetry: NucleusTelemetryAdapter;

  constructor(private organizationId: string, private projectId: string, private environmentId: string) {
    this.telemetry = new NucleusTelemetryAdapter(organizationId, "rls");
  }

  enforceOrganization(targetOrgId: string) {
    if (targetOrgId !== this.organizationId) {
      this.telemetry.error("RLS organization violation", {
        expected: this.organizationId,
        received: targetOrgId
      });
      throw new Error("RLS violation: organization mismatch");
    }
  }

  enforceProject(targetProjectId: string) {
    if (targetProjectId !== this.projectId) {
      this.telemetry.error("RLS project violation", {
        expected: this.projectId,
        received: targetProjectId
      });
      throw new Error("RLS violation: project mismatch");
    }
  }

  enforceEnvironment(targetEnvironmentId: string) {
    if (targetEnvironmentId !== this.environmentId) {
      this.telemetry.error("RLS environment violation", {
        expected: this.environmentId,
        received: targetEnvironmentId
      });
      throw new Error("RLS violation: environment mismatch");
    }
  }

  enforceCapability(subsystem: string, capability: string) {
    const def = getSubsystem(subsystem);

    if (!def) {
      this.telemetry.error("RLS subsystem not found", { subsystem });
      throw new Error(`RLS violation: unknown subsystem ${subsystem}`);
    }

    if (!def.capabilities.includes(capability)) {
      this.telemetry.error("RLS capability violation", {
        subsystem,
        capability,
        allowed: def.capabilities
      });
      throw new Error(`RLS violation: ${subsystem} cannot perform capability ${capability}`);
    }
  }

  enforceAll(target: {
    organizationId: string;
    projectId: string;
    environmentId: string;
    subsystem: string;
    capability: string;
  }) {
    this.enforceOrganization(target.organizationId);
    this.enforceProject(target.projectId);
    this.enforceEnvironment(target.environmentId);
    this.enforceCapability(target.subsystem, target.capability);
  }
}
