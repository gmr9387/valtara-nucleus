/**
 * workflowDefinitionValidator.ts
 *
 * Deterministic validator for Valtaris Glue workflow definitions.
 * Validates:
 * - metadata
 * - step structure
 * - step references
 * - branching
 * - IO schemas
 * - action registry references (placeholder)
 *
 * Produces WorkflowValidationResult.
 */

import {
  WorkflowDefinition,
  WorkflowValidationResult,
  WorkflowStepDefinition,
  WorkflowIOType
} from "./workflowDefinitionTypes";

/* -------------------------------------------------------
 * Utility: Validate IO Schema
 * ----------------------------------------------------- */
function validateIO(io: WorkflowIOType[], errors: string[], stepId: string) {
  for (const field of io) {
    if (!field.name) {
      errors.push(`Step '${stepId}' has IO field with missing name.`);
    }
    if (!field.type) {
      errors.push(`Step '${stepId}' has IO field '${field.name}' with missing type.`);
    }
  }
}

/* -------------------------------------------------------
 * Utility: Validate Step References
 * ----------------------------------------------------- */
function validateStepReferences(
  steps: WorkflowStepDefinition[],
  errors: string[]
) {
  const ids = new Set(steps.map(s => s.id));

  for (const step of steps) {
    if (!step.next) continue;

    if (Array.isArray(step.next)) {
      for (const nextId of step.next) {
        if (!ids.has(nextId)) {
          errors.push(`Step '${step.id}' references missing next step '${nextId}'.`);
        }
      }
    } else {
      if (!ids.has(step.next)) {
        errors.push(`Step '${step.id}' references missing next step '${step.next}'.`);
      }
    }
  }
}

/* -------------------------------------------------------
 * Utility: Validate Action Registry Reference
 * ----------------------------------------------------- */
function validateActionRegistry(step: WorkflowStepDefinition, errors: string[]) {
  // Placeholder: Glue runtime registry integration
  if (!step.action) {
    errors.push(`Step '${step.id}' is missing action reference.`);
  }
}

/* -------------------------------------------------------
 * Main Validator
 * ----------------------------------------------------- */
export function validateWorkflowDefinition(
  def: WorkflowDefinition
): WorkflowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  /* -------------------------------------------------------
   * Metadata
   * ----------------------------------------------------- */
  if (!def.metadata.id) errors.push("Workflow metadata missing id.");
  if (!def.metadata.name) errors.push("Workflow metadata missing name.");
  if (typeof def.metadata.version !== "number") {
    errors.push("Workflow metadata version must be a number.");
  }

  /* -------------------------------------------------------
   * Steps
   * ----------------------------------------------------- */
  if (!def.steps || def.steps.length === 0) {
    errors.push("Workflow has no steps.");
    return { valid: false, errors, warnings };
  }

  const stepIds = new Set<string>();

  for (const step of def.steps) {
    if (!step.id) errors.push("Workflow step missing id.");
    if (!step.name) errors.push(`Step '${step.id}' missing name.`);
    if (stepIds.has(step.id)) {
      errors.push(`Duplicate step id '${step.id}'.`);
    }
    stepIds.add(step.id);

    /* IO validation */
    if (step.inputs) validateIO(step.inputs, errors, step.id);
    if (step.outputs) validateIO(step.outputs, errors, step.id);

    /* Action registry validation */
    validateActionRegistry(step, errors);
  }

  /* -------------------------------------------------------
   * Step Reference Validation
   * ----------------------------------------------------- */
  validateStepReferences(def.steps, errors);

  /* -------------------------------------------------------
   * Optional: Branching Warnings
   * ----------------------------------------------------- */
  for (const step of def.steps) {
    if (Array.isArray(step.next) && step.next.length > 1) {
      warnings.push(`Step '${step.id}' has multiple branches.`);
    }
  }

  /* -------------------------------------------------------
   * Final Result
   * ----------------------------------------------------- */
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
