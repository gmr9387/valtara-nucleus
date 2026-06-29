export type CoreCommandStatus = "pending" | "completed" | "failed";

export type CoreContractCompatibility = "compatible" | "breaking" | "deprecated" | "experimental";

export interface CoreCommandRow {
  command_id: string;
  org_id: string;
  actor_id: string;
  command_type: string;
  idempotency_key: string;
  payload: Record<string, unknown>;
  status: CoreCommandStatus;
  result: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

export interface CoreEventContractRow {
  event_kind: string;
  version: number;
  schema_json: EventPayloadContractSchema;
  compatibility_status: CoreContractCompatibility;
  registered_by: string;
  created_at: string;
}

export interface CoreAuditEventRow {
  id: string;
  org_id: string;
  actor_id: string;
  event_kind: string;
  event_version: number;
  subject_type: string;
  subject_id: string | null;
  payload: Record<string, unknown>;
  correlation_id: string | null;
  created_at: string;
}

export type ContractFieldType =
  "string" | "number" | "boolean" | "object" | "array" | "null" | "unknown";

export interface EventPayloadContractField {
  type: ContractFieldType;
  required?: boolean;
  properties?: Record<string, EventPayloadContractField>;
  items?: EventPayloadContractField;
}

export interface EventPayloadContractSchema {
  type: "object";
  properties: Record<string, EventPayloadContractField>;
  allowAdditionalProperties?: boolean;
}

export interface CoreReadinessIssue {
  code:
    | "missing_org_settings"
    | "missing_roles"
    | "missing_event_contracts"
    | "missing_secrets"
    | "unsafe_environment_config"
    | "failed_telemetry_checks";
  severity: "blocking" | "warning";
  message: string;
}

export interface CoreReadinessResult {
  orgId: string;
  readinessScore: number;
  issues: CoreReadinessIssue[];
  blockers: CoreReadinessIssue[];
  signals: {
    hasOrgSettings: boolean;
    hasRequiredRoles: boolean;
    hasEventContracts: boolean;
    hasSecrets: boolean;
    environmentConfigSafe: boolean;
    telemetryHealthy: boolean;
  };
}
