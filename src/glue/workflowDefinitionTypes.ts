/**
 * workflowDefinitionTypes.ts
 *
 * Canonical type system for Valtaris Glue workflow definitions.
 * This is the foundation for:
 * - workflow authoring
 * - workflow editing
 * - workflow validation
 * - workflow publishing
 * - workflow versioning
 *
 * These types represent the *static definition* of a workflow,
 * not its runtime execution state.
 */

/* -------------------------------------------------------
 * Step Input / Output Types
 * ----------------------------------------------------- */

export interface WorkflowIOType {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array" | "any";
  required?: boolean;
}

/* -------------------------------------------------------
 * Workflow Step Definition
 * ----------------------------------------------------- */

export interface WorkflowStepDefinition {
  id: string;
  name: string;
  description?: string;

  /** The function name in the Glue runtime registry */
  action: string;

  /** Input schema for this step */
  inputs?: WorkflowIOType[];

  /** Output schema for this step */
  outputs?: WorkflowIOType[];

  /** Optional conditional execution */
  condition?: {
    expression: string; // e.g. "inputs.amount > 100"
  };

  /** Optional branching */
  next?: string | string[]; // single next step or multiple branches
}

/* -------------------------------------------------------
 * Workflow Metadata
 * ----------------------------------------------------- */

export interface WorkflowMetadata {
  id: string;
  name: string;
  version: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------------------------------
 * Workflow Definition
 * ----------------------------------------------------- */

export interface WorkflowDefinition {
  metadata: WorkflowMetadata;
  steps: WorkflowStepDefinition[];
}

/* -------------------------------------------------------
 * Validation Result
 * ----------------------------------------------------- */

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
