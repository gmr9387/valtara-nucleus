/**
 * workflowDefinitionLoader.ts
 *
 * Deterministic loader for workflow definitions stored in Supabase.
 * Responsibilities:
 * - fetch workflow definitions
 * - parse into WorkflowDefinition
 * - validate (Swap 75)
 * - return typed + validated definition
 */

import { createClient } from "@supabase/supabase-js";
import {
  WorkflowDefinition,
  WorkflowValidationResult
} from "./workflowDefinitionTypes";
import { validateWorkflowDefinition } from "./workflowDefinitionValidator";

/* -------------------------------------------------------
 * Supabase Client
 * ----------------------------------------------------- */

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

/* -------------------------------------------------------
 * Loader Result
 * ----------------------------------------------------- */

export interface WorkflowDefinitionLoadResult {
  definition: WorkflowDefinition | null;
  validation: WorkflowValidationResult | null;
  error: string | null;
}

/* -------------------------------------------------------
 * Loader
 * ----------------------------------------------------- */

export async function loadWorkflowDefinition(
  workflowId: string
): Promise<WorkflowDefinitionLoadResult> {
  try {
    /* -------------------------------------------------------
     * Fetch from Supabase
     * ----------------------------------------------------- */
    const { data, error } = await supabase
      .from("workflow_definitions")
      .select("*")
      .eq("id", workflowId)
      .single();

    if (error) {
      return {
        definition: null,
        validation: null,
        error: `Supabase error: ${error.message}`
      };
    }

    if (!data) {
      return {
        definition: null,
        validation: null,
        error: `Workflow definition '${workflowId}' not found.`
      };
    }

    /* -------------------------------------------------------
     * Parse into WorkflowDefinition
     * ----------------------------------------------------- */
    const definition: WorkflowDefinition = {
      metadata: {
        id: data.id,
        name: data.name,
        version: data.version,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      steps: data.steps
    };

    /* -------------------------------------------------------
     * Validate
     * ----------------------------------------------------- */
    const validation = validateWorkflowDefinition(definition);

    return {
      definition,
      validation,
      error: null
    };
  } catch (err: any) {
    return {
      definition: null,
      validation: null,
      error: `Unexpected loader error: ${err.message}`
    };
  }
}
