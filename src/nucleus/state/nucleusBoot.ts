// src/nucleus/state/nucleusBoot.ts

/**
 * Nucleus Boot Sequence
 *
 * Constitutional responsibility:
 * Nucleus = KNOW
 *
 * This module initializes the constitutional components:
 *  - capability registry
 *  - orchestration rules
 *  - subsystem health defaults
 *  - event subscriptions
 *
 * It does NOT start workflows.
 * It does NOT connect to Supabase.
 * It does NOT execute or authorize anything.
 *
 * It simply prepares Nucleus to observe and route events.
 */

import { registerCapability } from "../capabilityRegistry";
import { registerOrchestrationRule } from "../events/orchestrationRouter";
import { subscribe } from "../events/eventBus";
import { recordEvent, setSubsystemHealth } from "./nucleusState";
import { NucleusEvent } from "../contracts/NucleusEvent";

export function nucleusBoot() {
  // -----------------------------
  // 1. Register subsystem health
  // -----------------------------
  setSubsystemHealth("nucleus", "healthy");
  setSubsystemHealth("weaver", "healthy");
  setSubsystemHealth("guardian", "healthy");
  setSubsystemHealth("glue", "healthy");
  setSubsystemHealth("dualpay", "healthy");

  // -----------------------------
  // 2. Register capabilities
  // -----------------------------
  registerCapability("weaver", "discover_financial_opportunity");
  registerCapability("weaver", "detect_cross_system_anomaly");
  registerCapability("weaver", "identify_recovery_candidate");

  registerCapability("dualpay", "analyze_healthcare_reimbursement");
  registerCapability("dualpay", "reconcile_remittance");
  registerCapability("dualpay", "identify_claim_recovery");

  registerCapability("guardian", "authorize_financial_action");
  registerCapability("guardian", "evaluate_policy");
  registerCapability("guardian", "enforce_approval_threshold");

  registerCapability("glue", "execute_workflow");
  registerCapability("glue", "schedule_action");
  registerCapability("glue", "retry_operation");
  registerCapability("glue", "reconcile_execution");

  // -----------------------------
  // 3. Register orchestration rules
  // -----------------------------
  registerOrchestrationRule({
    eventType: "claim.received",
    capability: "discover_financial_opportunity",
  });

  registerOrchestrationRule({
    eventType: "opportunity.detected",
    capability: "authorize_financial_action",
  });

  registerOrchestrationRule({
    eventType: "action.authorized",
    capability: "execute_workflow",
  });

  // -----------------------------
  // 4. Subscribe Nucleus to all events
  // -----------------------------
  subscribe("*", (event: NucleusEvent) => {
    recordEvent(event);
  });

  console.log("[Nucleus] Boot sequence complete.");
}
