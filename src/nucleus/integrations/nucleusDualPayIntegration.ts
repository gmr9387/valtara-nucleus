// src/nucleus/integrations/nucleusDualPayIntegration.ts

/**
 * Nucleus ↔ DualPay Integration
 *
 * Constitutional roles:
 * Nucleus = KNOW
 * DualPay = SPECIALIZE
 *
 * This integration ensures:
 *   - Nucleus can route healthcare-specific events to DualPay
 *   - DualPay's domain-specific results are observed by Nucleus
 *
 * No authorization.
 * No execution.
 * No cross-system discovery.
 */

import { subscribe, publishEvent } from "../events/eventBus";
import { NucleusEvent } from "../contracts/NucleusEvent";
import { routeEvent } from "../events/orchestrationRouter";

export function startNucleusDualPayIntegration() {
  // Nucleus → DualPay (healthcare-specific routed events)
  subscribe("claim.received.healthcare", async (event: NucleusEvent) => {
    await routeEvent(event);
  });

  // DualPay → Nucleus (reimbursement analysis)
  subscribe("dualpay.reimbursement.analyzed", async (event: NucleusEvent) => {
    await publishEvent({
      ...event,
      type: "nucleus.observed.reimbursement",
      source: "nucleus",
      payload: event.payload,
    });
  });

  // DualPay → Nucleus (remittance reconciliation)
  subscribe("dualpay.remittance.reconciled", async (event: NucleusEvent) => {
    await publishEvent({
      ...event,
      type: "nucleus.observed.remittance",
      source: "nucleus",
      payload: event.payload,
    });
  });

  // DualPay → Nucleus (claim recovery)
  subscribe("dualpay.claim.recovery", async (event: NucleusEvent) => {
    await publishEvent({
      ...event,
      type: "nucleus.observed.claim_recovery",
      source: "nucleus",
      payload: event.payload,
    });
  });

  console.log("[Integration] Nucleus ↔ DualPay connected.");
}
