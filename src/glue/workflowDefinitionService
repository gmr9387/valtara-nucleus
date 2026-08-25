/**
 * workflowDefinitionService.ts
 *
 * High-level service layer for the Workflow Definition subsystem.
 *
 * Responsibilities:
 * - wrap loader (Swap 76)
 * - wrap publisher (Swap 77)
 * - wrap registry (Swap 78)
 * - expose deterministic API for controllers + editor UI
 */

import {
  WorkflowDefinition,
  WorkflowValidationResult
} from "./workflowDefinitionTypes";

import {
  registryLoad,
  registryGet,
  registryPublish,
  registryList,
  registryClear
} from "./workflowDefinitionRegistry";

import { validateWorkflowDefinition } from "./workflowDefinitionValidator";

/* -------------------------------------------------------
 * Load a workflow definition
 * ----------------------------------------------------- */

export async function loadDefinition(
  workflowId: string
): Promise<{
  success: boolean;
  definition: WorkflowDefinition | null;
  validation: WorkflowValidationResult | null;
  error: string | null;
}> {
  const result = await registryLoad(workflowId);

  if (!result.success || !result.definition || !result.validation) {
    return {
      success: false,
      definition: null,
      validation: null,
      error: result.error ?? "Failed to load workflow definition."
    };
  }

  return {
    success: true,
    definition: result.definition,
    validation: result.validation,
    error: null
  };
}

/* -------------------------------------------------------
 * Get definition from registry (no Supabase call)
 * ----------------------------------------------------- */

export function getDefinition(workflowId: string) {
  return registryGet(workflowId);
}

/* -------------------------------------------------------
 * Publish a workflow definition
 * ----------------------------------------------------- */

export async function publishDefinition(
  def: WorkflowDefinition
): Promise<{
  success: boolean;
  newVersion: number | null;
  validation: WorkflowValidationResult;
  error: string | null;
}> {
  const result = await registryPublish(def);

  return {
    success: result.success,
    newVersion: result.newVersion,
    validation: result.validation,
    error: result.error
  };
}

/* -------------------------------------------------------
 * Validate a workflow definition (no persistence)
 * ----------------------------------------------------- */

export function validateDefinition(def: WorkflowDefinition) {
  return validateWorkflowDefinition(def);
}

/* -------------------------------------------------------
 * List all loaded definitions
 * ----------------------------------------------------- */

export function listDefinitions() {
  return registryList();
}

/* -------------------------------------------------------
 * Clear registry (editor reset)
 * ----------------------------------------------------- */

export function clearDefinitionRegistry() {
  registryClear();
}
