import type { CoreReadinessResult } from "@/lib/core/services/contracts";
import { getCoreDbClient } from "@/lib/core/services/db";
import { evaluateCoreReadinessSignals } from "@/lib/core/services/readiness-evaluator";

async function hasOrgSettings(orgId: string): Promise<boolean> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("organizations")
    .select("id, name, slug, status")
    .eq("id", orgId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return false;
  return Boolean(data.name?.trim() && data.slug?.trim() && data.status !== "archived");
}

async function hasRequiredRoles(orgId: string): Promise<boolean> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .in("role", ["owner", "admin"]);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

async function hasEventContracts(): Promise<boolean> {
  const db = getCoreDbClient();

  const { data, error } = await db
    .from("core_event_contracts")
    .select("event_kind, version")
    .eq("compatibility_status", "compatible")
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

async function hasSecrets(orgId: string): Promise<boolean> {
  const db = getCoreDbClient();

  const { count, error } = await db
    .from("credentials")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

async function environmentConfigSafe(orgId: string): Promise<boolean> {
  const db = getCoreDbClient();

  const { data: projects, error: projectsError } = await db
    .from("projects")
    .select("id")
    .eq("organization_id", orgId);

  if (projectsError) throw projectsError;

  const projectIds = (projects ?? []).map((project) => project.id);
  if (projectIds.length === 0) return true;

  const { data: environments, error: environmentsError } = await db
    .from("environments")
    .select("id, project_id, env_type")
    .in("project_id", projectIds)
    .eq("env_type", "production");

  if (environmentsError) throw environmentsError;

  if ((environments?.length ?? 0) === 0) return true;

  const { data: credentials, error: credentialsError } = await db
    .from("credentials")
    .select("environment_id, project_id")
    .eq("organization_id", orgId)
    .eq("status", "active");

  if (credentialsError) throw credentialsError;

  const coverage = new Set(
    (credentials ?? []).map(
      (credential) => `${credential.project_id ?? ""}:${credential.environment_id ?? ""}`,
    ),
  );

  for (const env of environments ?? []) {
    const exactMatch = `${env.project_id}:${env.id}`;
    const projectFallback = `${env.project_id}:`;
    if (!coverage.has(exactMatch) && !coverage.has(projectFallback)) {
      return false;
    }
  }

  return true;
}

async function telemetryHealthy(orgId: string): Promise<boolean> {
  const db = getCoreDbClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count: failures, error: failureError } = await db
    .from("telemetry_events")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .in("severity", ["error", "critical"])
    .gte("created_at", since);

  if (failureError) throw failureError;
  if ((failures ?? 0) > 0) return false;

  const { count: successSignals, error: successError } = await db
    .from("telemetry_events")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .gte("created_at", since);

  if (successError) throw successError;
  return (successSignals ?? 0) > 0;
}

export async function evaluatePlatformReadiness(orgId: string): Promise<CoreReadinessResult> {
  const [settings, roles, contracts, secrets, environmentSafety, telemetry] = await Promise.all([
    hasOrgSettings(orgId),
    hasRequiredRoles(orgId),
    hasEventContracts(),
    hasSecrets(orgId),
    environmentConfigSafe(orgId),
    telemetryHealthy(orgId),
  ]);

  return evaluateCoreReadinessSignals({
    orgId,
    signals: {
      hasOrgSettings: settings,
      hasRequiredRoles: roles,
      hasEventContracts: contracts,
      hasSecrets: secrets,
      environmentConfigSafe: environmentSafety,
      telemetryHealthy: telemetry,
    },
  });
}
