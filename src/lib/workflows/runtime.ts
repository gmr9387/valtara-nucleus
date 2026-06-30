/**
 * Workflow Runtime Engine
 * -----------------------
 * Shared platform substrate consumed by ValtariOS products
 * (Claim Clarity, Glue, DualPay, Guardian, future apps).
 *
 * Responsibilities:
 *  - Deterministic state transitions for runs and steps
 *  - Audit trail (workflow_audit_events)
 *  - Telemetry (telemetry_events)
 *
 * Browser-callable: RLS enforces who can write.
 * Server-side guards (triggers) enforce:
 *  - published versions are immutable
 *  - archived workflows cannot start runs
 *  - terminal runs cannot be modified
 */
import { supabase } from "@/integrations/supabase/client";
import { logTelemetryEvent } from "@/lib/telemetry";
import type { WorkflowRunStatus, WorkflowStepStatus } from "@/lib/schemas/workflows.schemas";

const MODULE = "workflows";

interface AuditArgs {
  organization_id: string;
  workflow_id?: string | null;
  run_id?: string | null;
  event_type: string;
  payload?: Record<string, unknown> | null;
}

async function emitAudit(args: AuditArgs): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    const actor_id = data.user?.id ?? null;
    const { error } = await supabase.from("workflow_audit_events").insert({
      organization_id: args.organization_id,
      workflow_id: args.workflow_id ?? null,
      run_id: args.run_id ?? null,
      event_type: args.event_type,
      actor_id,
      payload: (args.payload ?? null) as never,
    });
    if (error && import.meta.env.DEV) {
      console.warn("[workflows] audit insert failed", error.message);
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn("[workflows] audit failure", error);
  }
}

async function emitTelemetry(
  organization_id: string,
  event_type: string,
  severity: "info" | "warn" | "error",
  message: string,
  attributes?: Record<string, unknown>,
): Promise<void> {
  await logTelemetryEvent({
    organization_id,
    module: MODULE,
    event_type,
    severity,
    message,
    attributes,
  });
}

// ============================================================
// Run lifecycle
// ============================================================

export interface StartWorkflowArgs {
  organization_id: string;
  workflow_id: string;
  version_id: string;
  input?: unknown;
}

export interface RunRecord {
  id: string;
  workflow_id: string;
  version_id: string;
  organization_id: string;
  status: WorkflowRunStatus;
}

export async function startWorkflow(args: StartWorkflowArgs): Promise<RunRecord> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("workflow_runs")
    .insert({
      organization_id: args.organization_id,
      workflow_id: args.workflow_id,
      version_id: args.version_id,
      status: "running",
      started_at: new Date().toISOString(),
      input_json: (args.input ?? null) as never,
      created_by: userData.user.id,
    })
    .select("id, workflow_id, version_id, organization_id, status")
    .single();

  if (error || !data) throw error ?? new Error("Failed to start run");

  await emitAudit({
    organization_id: args.organization_id,
    workflow_id: args.workflow_id,
    run_id: data.id,
    event_type: "workflow_started",
    payload: { version_id: args.version_id },
  });
  await emitTelemetry(args.organization_id, "workflow_started", "info", `Run ${data.id} started`, {
    workflow_id: args.workflow_id,
    version_id: args.version_id,
    run_id: data.id,
  });

  return data as RunRecord;
}

export async function completeWorkflow(
  organization_id: string,
  run_id: string,
  output?: unknown,
): Promise<void> {
  const { data, error } = await supabase
    .from("workflow_runs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      output_json: (output ?? null) as never,
    })
    .eq("id", run_id)
    .select("id, workflow_id, organization_id")
    .single();

  if (error || !data) throw error ?? new Error("Failed to complete run");

  await emitAudit({
    organization_id,
    workflow_id: data.workflow_id,
    run_id,
    event_type: "workflow_completed",
  });
  await emitTelemetry(organization_id, "workflow_completed", "info", `Run ${run_id} completed`, {
    run_id,
  });
}

export async function failWorkflow(
  organization_id: string,
  run_id: string,
  error_payload: { message: string; details?: unknown },
): Promise<void> {
  const { data, error } = await supabase
    .from("workflow_runs")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_json: error_payload as never,
    })
    .eq("id", run_id)
    .select("id, workflow_id")
    .single();

  if (error || !data) throw error ?? new Error("Failed to mark run failed");

  await emitAudit({
    organization_id,
    workflow_id: data.workflow_id,
    run_id,
    event_type: "workflow_failed",
    payload: { message: error_payload.message },
  });
  await emitTelemetry(organization_id, "workflow_failed", "error", error_payload.message, {
    run_id,
  });
}

export async function cancelWorkflow(
  organization_id: string,
  run_id: string,
  reason?: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("workflow_runs")
    .update({
      status: "cancelled",
      completed_at: new Date().toISOString(),
      error_json: reason ? ({ message: reason, cancelled: true } as never) : null,
    })
    .eq("id", run_id)
    .select("id, workflow_id")
    .single();

  if (error || !data) throw error ?? new Error("Failed to cancel run");

  await emitAudit({
    organization_id,
    workflow_id: data.workflow_id,
    run_id,
    event_type: "workflow_cancelled",
    payload: reason ? { reason } : null,
  });
  await emitTelemetry(organization_id, "workflow_cancelled", "warn", reason ?? "Cancelled", {
    run_id,
  });
}

// ============================================================
// Step lifecycle
// ============================================================

export interface StepRecord {
  id: string;
  run_id: string;
  step_key: string;
  status: WorkflowStepStatus;
}

async function loadRunContext(run_id: string): Promise<{
  organization_id: string;
  workflow_id: string;
  status: WorkflowRunStatus;
}> {
  const { data, error } = await supabase
    .from("workflow_runs")
    .select("organization_id, workflow_id, status")
    .eq("id", run_id)
    .single();
  if (error || !data) throw error ?? new Error("Run not found");
  return data as {
    organization_id: string;
    workflow_id: string;
    status: WorkflowRunStatus;
  };
}

export async function startStep(args: {
  run_id: string;
  step_key: string;
  input?: unknown;
}): Promise<StepRecord> {
  const ctx = await loadRunContext(args.run_id);
  const { data, error } = await supabase
    .from("workflow_steps")
    .upsert(
      {
        run_id: args.run_id,
        step_key: args.step_key,
        status: "running",
        started_at: new Date().toISOString(),
        input_json: (args.input ?? null) as never,
      },
      { onConflict: "run_id,step_key" },
    )
    .select("id, run_id, step_key, status")
    .single();

  if (error || !data) throw error ?? new Error("Failed to start step");

  await emitAudit({
    organization_id: ctx.organization_id,
    workflow_id: ctx.workflow_id,
    run_id: args.run_id,
    event_type: "step_started",
    payload: { step_key: args.step_key },
  });
  await emitTelemetry(ctx.organization_id, "step_started", "info", args.step_key, {
    run_id: args.run_id,
    step_key: args.step_key,
  });
  return data as StepRecord;
}

export async function completeStep(args: {
  run_id: string;
  step_key: string;
  output?: unknown;
}): Promise<void> {
  const ctx = await loadRunContext(args.run_id);
  const { error } = await supabase
    .from("workflow_steps")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      output_json: (args.output ?? null) as never,
    })
    .eq("run_id", args.run_id)
    .eq("step_key", args.step_key);

  if (error) throw error;

  await emitAudit({
    organization_id: ctx.organization_id,
    workflow_id: ctx.workflow_id,
    run_id: args.run_id,
    event_type: "step_completed",
    payload: { step_key: args.step_key },
  });
  await emitTelemetry(ctx.organization_id, "step_completed", "info", args.step_key, {
    run_id: args.run_id,
    step_key: args.step_key,
  });
}

export async function failStep(args: {
  run_id: string;
  step_key: string;
  error: { message: string; details?: unknown };
}): Promise<void> {
  const ctx = await loadRunContext(args.run_id);
  const { error } = await supabase
    .from("workflow_steps")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_json: args.error as never,
    })
    .eq("run_id", args.run_id)
    .eq("step_key", args.step_key);

  if (error) throw error;

  await emitAudit({
    organization_id: ctx.organization_id,
    workflow_id: ctx.workflow_id,
    run_id: args.run_id,
    event_type: "step_failed",
    payload: { step_key: args.step_key, message: args.error.message },
  });
  await emitTelemetry(ctx.organization_id, "step_failed", "error", args.error.message, {
    run_id: args.run_id,
    step_key: args.step_key,
  });
}

// ============================================================
// Definition / version helpers
// ============================================================

export async function createWorkflow(args: {
  organization_id: string;
  name: string;
  description?: string | null;
}): Promise<{ id: string }> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("workflows")
    .insert({
      organization_id: args.organization_id,
      name: args.name,
      description: args.description ?? null,
      status: "draft",
      created_by: userData.user.id,
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create workflow");

  await emitAudit({
    organization_id: args.organization_id,
    workflow_id: data.id,
    event_type: "workflow_created",
    payload: { name: args.name },
  });
  return data;
}

export async function createDraftVersion(args: {
  workflow_id: string;
  organization_id: string;
  definition: unknown;
}): Promise<{ id: string; version_number: number }> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Not authenticated");

  const { data: versions, error: vErr } = await supabase
    .from("workflow_versions")
    .select("version_number")
    .eq("workflow_id", args.workflow_id)
    .order("version_number", { ascending: false })
    .limit(1);
  if (vErr) throw vErr;
  const next = (versions?.[0]?.version_number ?? 0) + 1;

  const { data, error } = await supabase
    .from("workflow_versions")
    .insert({
      workflow_id: args.workflow_id,
      version_number: next,
      status: "draft",
      definition_json: args.definition as never,
      created_by: userData.user.id,
    })
    .select("id, version_number")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create version");

  await emitAudit({
    organization_id: args.organization_id,
    workflow_id: args.workflow_id,
    event_type: "version_drafted",
    payload: { version_id: data.id, version_number: next },
  });
  return data;
}

export async function publishVersion(args: {
  version_id: string;
  workflow_id: string;
  organization_id: string;
}): Promise<void> {
  const { error } = await supabase
    .from("workflow_versions")
    .update({ status: "published" })
    .eq("id", args.version_id);
  if (error) throw error;

  // Set parent workflow active if still draft.
  const { error: wErr } = await supabase
    .from("workflows")
    .update({ status: "active" })
    .eq("id", args.workflow_id)
    .eq("status", "draft");
  if (wErr && import.meta.env.DEV) console.warn("[workflows] activate failed", wErr.message);

  await emitAudit({
    organization_id: args.organization_id,
    workflow_id: args.workflow_id,
    event_type: "version_published",
    payload: { version_id: args.version_id },
  });
}

export async function archiveWorkflow(args: {
  workflow_id: string;
  organization_id: string;
}): Promise<void> {
  const { error } = await supabase
    .from("workflows")
    .update({ status: "archived" })
    .eq("id", args.workflow_id);
  if (error) throw error;
  await emitAudit({
    organization_id: args.organization_id,
    workflow_id: args.workflow_id,
    event_type: "workflow_archived",
  });
}
