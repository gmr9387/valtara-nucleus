/**
 * workflowDefinitionRegistry.ts
 *
 * In-memory registry for Valtaris Glue workflow definitions.
 *
 * Responsibilities:
 * - store workflow definitions in memory
 * - provide lookup by ID
 * - provide version history
 * - integrate loader (Swap 76)
 * - integrate publisher (Swap 77)
 * - act as authoritative definition source for editors
 */

import {
  WorkflowDefinition,
  WorkflowValidationResult
} from "./workflowDefinitionTypes";

import { loadWorkflowDefinition } from "./workflowDefinitionLoader";
import { publishWorkflowDefinition } from "./workflowDefinitionPublisher";

/* -------------------------------------------------------
 * Registry Types
 * ----------------------------------------------------- */

interface WorkflowDefinitionRecord {
  definition: WorkflowDefinition;
  validation: WorkflowValidationResult;
  loadedAt: string;
}

/* -------------------------------------------------------
 * In-Memory Registry
 * ----------------------------------------------------- */

const registry = new Map<string, WorkflowDefinitionRecord>();

/* -------------------------------------------------------
 * Load + Cache Definition
 * ----------------------------------------------------- */

export async function registryLoad(workflowId: string) {
  const result = await loadWorkflowDefinition(workflowId);

  if (result.error || !result.definition || !result.validation) {
    return {
      success: false,
      error: result.error ?? "Unknown loader error",
      definition: null,
      validation: null
    };
  }

  registry.set(workflowId, {
    definition: result.definition,
    validation: result.validation,
    loadedAt: new Date().toISOString()
  });

  return {
    success: true,
    error: null,
    definition: result.definition,
    validation: result.validation
  };
}

/* -------------------------------------------------------
 * Lookup Definition
 * ----------------------------------------------------- */

export function registryGet(workflowId: string) {
  return registry.get(workflowId) ?? null;
}

/* -------------------------------------------------------
 * Publish + Update Registry
 * ----------------------------------------------------- */

export async function registryPublish(def: WorkflowDefinition) {
  const result = await publishWorkflowDefinition(def);

  if (!result.success || !result.newVersion) {
    return {
      success: false,
      error: result.error ?? "Unknown publishing error",
      validation: result.validation,
      newVersion: null
    };
  }

  // Update local definition version
  const updated: WorkflowDefinition = {
    ...def,
    metadata: {
      ...def.metadata,
      version: result.newVersion,
      updatedAt: new Date().toISOString()
    }
  };

  registry.set(def.metadata.id, {
    definition: updated,
    validation: result.validation,
    loadedAt: new Date().toISOString()
  });

  return {
    success: true,
    error: null,
    validation: result.validation,
    newVersion: result.newVersion
  };
}

/* -------------------------------------------------------
 * List All Definitions
 * ----------------------------------------------------- */

export function registryList() {
  return Array.from(registry.values()).map(r => r.definition);
}

/* -------------------------------------------------------
 * Clear Registry (Editor Reset)
 * ----------------------------------------------------- */

export function registryClear() {
  registry.clear();
}
