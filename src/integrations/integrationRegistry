/**
 * integrationRegistry.ts
 *
 * Unified Subsystem Registry Expansion
 *
 * This registry tracks all subsystem integrations:
 * - runtime bindings
 * - definition bindings
 * - health bindings
 * - telemetry bindings
 * - event bindings
 * - contract bindings
 */

import { glueRuntimeIntegration } from "./glueRuntimeIntegration";
import { glueDefinitionIntegration } from "./glueDefinitionIntegration";

import { decisionWeaverIntegration } from "./decisionWeaverIntegration";
import { decisionWeaverDefinitionIntegration } from "./decisionWeaverDefinitionIntegration";

import { guardianIntegration } from "./guardianIntegration";
import { guardianDefinitionIntegration } from "./guardianDefinitionIntegration";

import { dualPayIntegration } from "./dualPayIntegration";
import { dualPayLedgerDefinitionIntegration } from "./dualPayDefinitionIntegration";

import { subsystemHealth } from "./subsystemHealth";

export interface SubsystemRegistration {
  id: string;
  runtime?: any;
  definition?: any;
  health?: any;
  telemetry?: any;
  events?: any;
  contracts?: any;
}

const registry = new Map<string, SubsystemRegistration>();

/**
 * Register a subsystem
 */
export function registerSubsystem(subsystem: SubsystemRegistration) {
  registry.set(subsystem.id, subsystem);
}

/**
 * Retrieve a subsystem
 */
export function getSubsystem(id: string): SubsystemRegistration | null {
  return registry.get(id) ?? null;
}

/**
 * Retrieve all subsystems
 */
export function getAllSubsystems(): SubsystemRegistration[] {
  return Array.from(registry.values());
}

/**
 * Populate registry with all subsystems
 */
registerSubsystem({
  id: "glue",
  runtime: glueRuntimeIntegration,
  definition: glueDefinitionIntegration,
  health: subsystemHealth,
  telemetry: "nucleus-telemetry",
  events: "nucleus-event-bus",
  contracts: "nucleus-contract-engine"
});

registerSubsystem({
  id: "decision-weaver",
  runtime: decisionWeaverIntegration,
  definition: decisionWeaverDefinitionIntegration,
  health: subsystemHealth,
  telemetry: "nucleus-telemetry",
  events: "nucleus-event-bus",
  contracts: "nucleus-contract-engine"
});

registerSubsystem({
  id: "guardian",
  runtime: guardianIntegration,
  definition: guardianDefinitionIntegration,
  health: subsystemHealth,
  telemetry: "nucleus-telemetry",
  events: "nucleus-event-bus",
  contracts: "nucleus-contract-engine"
});

registerSubsystem({
  id: "dualpay",
  runtime: dualPayIntegration,
  definition: dualPayLedgerDefinitionIntegration,
  health: subsystemHealth,
  telemetry: "nucleus-telemetry",
  events: "nucleus-event-bus",
  contracts: "nucleus-contract-engine"
});
