/**
 * Workflow instance hooks for the Valtaris Glue runtime.
 * Provides deterministic React hooks for:
 * - loading workflow instance metadata
 * - loading workflow step states
 */

import { useEffect, useState, useCallback } from "react";
import { WorkflowInstance, WorkflowStepState } from "./workflowInstance";
import { WorkflowInstanceClient } from "./workflowInstanceClient";

const client = new WorkflowInstanceClient();

export function useWorkflowInstance(instanceId: string) {
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const inst = await client.getInstance(instanceId);
      setInstance(inst);
    } catch (err: any) {
      setError(err.message ?? "Failed to load workflow instance");
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    load();
  }, [load]);

  return { instance, loading, error, reload: load };
}

export function useWorkflowStepStates(instanceId: string) {
  const [steps, setSteps] = useState<WorkflowStepState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const states = await client.getStepStates(instanceId);
      setSteps(states);
    } catch (err: any) {
      setError(err.message ?? "Failed to load workflow step states");
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    load();
  }, [load]);

  return { steps, loading, error, reload: load };
}
