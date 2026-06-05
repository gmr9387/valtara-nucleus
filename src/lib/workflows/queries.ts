import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  WorkflowRunStatus,
  WorkflowStatus,
  WorkflowStepStatus,
  WorkflowVersionStatus,
} from "@/lib/schemas/workflows.schemas";

export interface WorkflowRow {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowVersionRow {
  id: string;
  workflow_id: string;
  version_number: number;
  status: WorkflowVersionStatus;
  definition_json: unknown;
  created_by: string;
  created_at: string;
  published_at: string | null;
}

export interface WorkflowRunRow {
  id: string;
  workflow_id: string;
  version_id: string;
  organization_id: string;
  status: WorkflowRunStatus;
  started_at: string | null;
  completed_at: string | null;
  input_json: unknown;
  output_json: unknown;
  error_json: unknown;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStepRow {
  id: string;
  run_id: string;
  step_key: string;
  status: WorkflowStepStatus;
  started_at: string | null;
  completed_at: string | null;
  input_json: unknown;
  output_json: unknown;
  error_json: unknown;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAuditEventRow {
  id: string;
  organization_id: string;
  workflow_id: string | null;
  run_id: string | null;
  event_type: string;
  actor_id: string | null;
  payload: unknown;
  occurred_at: string;
}

export function useWorkflows(orgId: string | null) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["workflows", orgId],
    queryFn: async (): Promise<WorkflowRow[]> => {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WorkflowRow[];
    },
    staleTime: 20_000,
  });
}

export function useWorkflow(workflowId: string | null) {
  return useQuery({
    enabled: !!workflowId,
    queryKey: ["workflow", workflowId],
    queryFn: async (): Promise<WorkflowRow | null> => {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", workflowId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as WorkflowRow | null;
    },
    staleTime: 20_000,
  });
}

export function useWorkflowVersions(workflowId: string | null) {
  return useQuery({
    enabled: !!workflowId,
    queryKey: ["workflow-versions", workflowId],
    queryFn: async (): Promise<WorkflowVersionRow[]> => {
      const { data, error } = await supabase
        .from("workflow_versions")
        .select("*")
        .eq("workflow_id", workflowId!)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WorkflowVersionRow[];
    },
    staleTime: 15_000,
  });
}

export function useWorkflowRuns(workflowId: string | null, limit = 100) {
  return useQuery({
    enabled: !!workflowId,
    queryKey: ["workflow-runs", workflowId, limit],
    queryFn: async (): Promise<WorkflowRunRow[]> => {
      const { data, error } = await supabase
        .from("workflow_runs")
        .select("*")
        .eq("workflow_id", workflowId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as WorkflowRunRow[];
    },
    staleTime: 10_000,
  });
}

export function useOrgWorkflowRuns(orgId: string | null, limit = 50) {
  return useQuery({
    enabled: !!orgId,
    queryKey: ["org-workflow-runs", orgId, limit],
    queryFn: async (): Promise<WorkflowRunRow[]> => {
      const { data, error } = await supabase
        .from("workflow_runs")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as WorkflowRunRow[];
    },
    staleTime: 10_000,
  });
}

export function useWorkflowRun(runId: string | null) {
  return useQuery({
    enabled: !!runId,
    queryKey: ["workflow-run", runId],
    queryFn: async (): Promise<WorkflowRunRow | null> => {
      const { data, error } = await supabase
        .from("workflow_runs")
        .select("*")
        .eq("id", runId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as WorkflowRunRow | null;
    },
    staleTime: 5_000,
  });
}

export function useWorkflowSteps(runId: string | null) {
  return useQuery({
    enabled: !!runId,
    queryKey: ["workflow-steps", runId],
    queryFn: async (): Promise<WorkflowStepRow[]> => {
      const { data, error } = await supabase
        .from("workflow_steps")
        .select("*")
        .eq("run_id", runId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as WorkflowStepRow[];
    },
    staleTime: 5_000,
  });
}

export function useWorkflowAuditEvents(args: {
  organization_id?: string | null;
  run_id?: string | null;
  workflow_id?: string | null;
  limit?: number;
}) {
  const { organization_id, run_id, workflow_id, limit = 100 } = args;
  const enabled = !!(organization_id || run_id || workflow_id);
  return useQuery({
    enabled,
    queryKey: ["workflow-audit", organization_id, workflow_id, run_id, limit],
    queryFn: async (): Promise<WorkflowAuditEventRow[]> => {
      let query = supabase
        .from("workflow_audit_events")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(limit);
      if (run_id) query = query.eq("run_id", run_id);
      else if (workflow_id) query = query.eq("workflow_id", workflow_id);
      else if (organization_id) query = query.eq("organization_id", organization_id);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as WorkflowAuditEventRow[];
    },
    staleTime: 5_000,
  });
}
