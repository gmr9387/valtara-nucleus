import type { CoreReadinessIssue, CoreReadinessResult } from "@/lib/core/services/contracts";

export interface CoreReadinessSignals {
  hasOrgSettings: boolean;
  hasRequiredRoles: boolean;
  hasEventContracts: boolean;
  hasSecrets: boolean;
  environmentConfigSafe: boolean;
  telemetryHealthy: boolean;
}

function issue(
  code: CoreReadinessIssue["code"],
  severity: CoreReadinessIssue["severity"],
  message: string,
): CoreReadinessIssue {
  return { code, severity, message };
}

export function evaluateCoreReadinessSignals(args: {
  orgId: string;
  signals: CoreReadinessSignals;
}): CoreReadinessResult {
  const issues: CoreReadinessIssue[] = [];

  if (!args.signals.hasOrgSettings) {
    issues.push(
      issue("missing_org_settings", "blocking", "Organization settings are incomplete or missing."),
    );
  }

  if (!args.signals.hasRequiredRoles) {
    issues.push(issue("missing_roles", "blocking", "Required owner/admin membership is missing."));
  }

  if (!args.signals.hasEventContracts) {
    issues.push(
      issue(
        "missing_event_contracts",
        "blocking",
        "No compatible event contracts are registered for Core audit events.",
      ),
    );
  }

  if (!args.signals.hasSecrets) {
    issues.push(
      issue("missing_secrets", "warning", "No secrets metadata exists for this organization."),
    );
  }

  if (!args.signals.environmentConfigSafe) {
    issues.push(
      issue(
        "unsafe_environment_config",
        "blocking",
        "Unsafe production environment configuration detected.",
      ),
    );
  }

  if (!args.signals.telemetryHealthy) {
    issues.push(
      issue(
        "failed_telemetry_checks",
        "warning",
        "Telemetry health checks failed or no healthy signal was observed.",
      ),
    );
  }

  const blockers = issues.filter((current) => current.severity === "blocking");
  const warnings = issues.filter((current) => current.severity === "warning");

  const readinessScore = Math.max(0, 100 - blockers.length * 25 - warnings.length * 10);

  return {
    orgId: args.orgId,
    readinessScore,
    issues,
    blockers,
    signals: args.signals,
  };
}
