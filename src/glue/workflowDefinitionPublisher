/**
 * workflowDefinitionPublisher.ts
 *
 * Deterministic publisher for Valtaris Glue workflow definitions.
 * Responsibilities:
 * - validate definition (Swap 75)
 * - increment version number
 * - write to Supabase
 * - return structured publishing result
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
 * Publisher Result
 * ----------------------------------------------------- */

export interface WorkflowDefinitionPublishResult {
  success: boolean;
  validation: WorkflowValidationResult;
  newVersion: number | null;
  error: string | null;
}

/* -------------------------------------------------------
 * Publisher
 * ----------------------------------------------------- */

export async function publishWorkflowDefinition(
  def: WorkflowDefinition
): Promise<WorkflowDefinitionPublishResult> {
  /* -------------------------------------------------------
   * Validate first
   * ----------------------------------------------------- */
  const validation = validateWorkflowDefinition(def);

  if (!validation.valid) {
    return {
      success: false,
      validation,
      newVersion: null,
      error: "Workflow definition is invalid."
    };
  }

  try {
    /* -------------------------------------------------------
     * Increment version
     * ----------------------------------------------------- */
    const newVersion = def.metadata.version + 1;

    /* -------------------------------------------------------
     * Write to Supabase
     * ----------------------------------------------------- */
    const { error } = await supabase
      .from("workflow_definitions")
      .update({
        name: def.metadata.name,
        description: def.metadata.description,
        version: newVersion,
        steps: def.steps,
        updated_at: new Date().toISOString()
      })
      .eq("id", def.metadata.id);

    if (error) {
      return {
        success: false,
        validation,
        newVersion: null,
        error: `Supabase error: ${error.message}`
      };
    }

    return {
      success: true,
      validation,
      newVersion,
      error: null
    };
  } catch (err: any) {
    return {
      success: false,
      validation,
      newVersion: null,
      error: `Unexpected publishing error: ${err.message}`
    };
  }
}
