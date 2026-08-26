/**
 * errorModel.ts
 *
 * Nucleus Error Model Specification
 *
 * Defines the unified error model for the entire Valtaris ecosystem.
 * All arms (Glue, Decision Weaver, Guardian, DualPay) must use this model
 * when reporting errors, failures, violations, or unexpected conditions.
 */

export type NucleusErrorSource =
  | "nucleus"
  | "glue"
  | "decision-weaver"
  | "guardian"
  | "dualpay";

export type NucleusErrorSeverity =
  | "info"
  | "warning"
  | "error"
  | "critical";

export interface NucleusErrorContext {
  tenantId: string;
  projectId: string;
  environmentId: string;
  actorId?: string;
}

export interface NucleusError {
  id: string;
  timestamp: string;
  source: NucleusErrorSource;
  severity: NucleusErrorSeverity;
  code: string; // e.g., WORKFLOW_STEP_FAILED, PAYMENT_LIMIT_EXCEEDED
  message: string;
  context: NucleusErrorContext;
  metadata?: Record<string, any>;
}

/**
 * Error Reporter Interface
 *
 * Arms call into this to report errors into Nucleus.
 */

export interface NucleusErrorReporter {
  reportError(error: NucleusError): Promise<void>;
}

/**
 * Default stub implementation.
 *
 * Later swaps will:
 * - write errors to Supabase
 * - route errors to telemetry
 * - route errors to governance
 * - trigger workflows based on errors
 */

export const errorReporter: NucleusErrorReporter = {
  async reportError(error) {
    console.error("[NUCLEUS ERROR]", error);
    // Future swaps:
    // - persist to Supabase
    // - route to event bus
    // - trigger governance rules
    // - trigger workflow compensations
  }
};

/**
 * Helper to create a standardized error.
 */

export function createNucleusError(
  source: NucleusErrorSource,
  severity: NucleusErrorSeverity,
  code: string,
  message: string,
  context: NucleusErrorContext,
  metadata?: Record<string, any>
): NucleusError {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source,
    severity,
    code,
    message,
    context,
    metadata
  };
}
