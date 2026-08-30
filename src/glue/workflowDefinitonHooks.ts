/**
 * Workflow definition hooks for the Valtaris Glue workflow builder.
 * Provides deterministic React hooks for loading and saving workflow
 * definitions using the WorkflowDefinitionClient.
 */

import { useEffect, useState, useCallback } from "react";
import { WorkflowDefinition } from "./workflow";
import { WorkflowDefinitionClient } from "./workflowDefinitionClient";

const client = new WorkflowDefinitionClient();

export function useWorkflowDefinition(
  workflowId: string,
  version: number
) {
  const [definition, setDefinition] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const def = await client.load(workflowId, version);
        if (mounted) {
          setDefinition(def);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message ?? "Failed to load workflow definition");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [workflowId, version]);

  return { definition, loading, error, setDefinition };
}

export function useSaveWorkflowDefinition(
  workflowId: string,
  userId: string
) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ version: number } | null>(null);

  const save = useCallback(
    async (definition: WorkflowDefinition) => {
      setSaving(true);
      setError(null);
      setResult(null);

      try {
        const res = await client.save(workflowId, definition, userId);
        setResult(res);
      } catch (err: any) {
        setError(err.message ?? "Failed to save workflow definition");
      } finally {
        setSaving(false);
      }
    },
    [workflowId, userId]
  );

  return { save, saving, error, result };
}
