/**
 * actionRegistry.ts
 *
 * Glue Action Registry
 *
 * This registry allows Glue workflows to execute actions from:
 * - Glue (native)
 * - Decision Weaver
 * - Guardian
 * - DualPay
 *
 * Each action is a deterministic function that receives:
 * - context (identity, resource hierarchy)
 * - input payload
 * - returns output payload
 */

import { NucleusIdentity } from "../../integrations/identityBinding";
import { NucleusEventBus, eventBus } from "../../integrations/eventBus";
import { NucleusErrorReporter, errorReporter } from "../../integrations/errorModel";
import { NucleusTelemetryReporter, telemetryReporter } from "../../integrations/telemetry";

export interface GlueActionContext {
  identity: NucleusIdentity;
  eventBus: NucleusEventBus;
  errors: NucleusErrorReporter;
  telemetry: NucleusTelemetryReporter;
}

export interface GlueAction<Input = any, Output = any> {
  id: string;
  description: string;
  execute(input: Input, context: GlueActionContext): Promise<Output>;
}

const registry = new Map<string, GlueAction>();

/**
 * Register an action
 */
export function registerAction(action: GlueAction) {
  registry.set(action.id, action);
}

/**
 * Retrieve an action
 */
export function getAction(id: string): GlueAction | null {
  return registry.get(id) ?? null;
}

/**
 * Execute an action
 */
export async function executeAction<Input, Output>(
  id: string,
  input: Input,
  context: GlueActionContext
): Promise<Output> {
  const action = registry.get(id);
  if (!action) {
    throw new Error(`Glue action not found: ${id}`);
  }

  return await action.execute(input, context);
}

/**
 * Default context builder
 */
export function createDefaultActionContext(identity: NucleusIdentity): GlueActionContext {
  return {
    identity,
    eventBus,
    errors: errorReporter,
    telemetry: telemetryReporter
  };
}
