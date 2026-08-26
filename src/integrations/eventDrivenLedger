/**
 * eventDrivenLedger.ts
 *
 * Swap 33: Event‑Driven Ledger Trigger Layer
 *
 * This module listens to Nucleus events and triggers DualPay ledger operations.
 */

import { eventBus } from "./eventBus";
import { dualPayIntegration } from "./dualPayIntegration";
import { NucleusIdentity } from "./identityBinding";

interface LedgerTriggerConfig {
  eventType: string;
  ledgerAction: string;
  inputMapper?: (event: any) => any;
}

const ledgerTriggers = new Map<string, LedgerTriggerConfig>();

/**
 * Register a ledger trigger
 */
export function registerLedgerTrigger(config: LedgerTriggerConfig) {
  ledgerTriggers.set(config.eventType, config);
}

/**
 * Bind event bus listener for explicit ledger triggers
 */
eventBus.subscribe("ledger.trigger", async (event) => {
  const config = ledgerTriggers.get(event.type);
  if (!config) return;

  const identity: NucleusIdentity = event.context;

  const input = config.inputMapper
    ? config.inputMapper(event)
    : event.payload;

  await dualPayIntegration.executeLedgerAction(
    config.ledgerAction,
    input,
    identity
  );
});

/**
 * Generic listener for any event → ledger trigger
 */
eventBus.subscribe("*", async (event) => {
  const config = ledgerTriggers.get(event.type);
  if (!config) return;

  const identity: NucleusIdentity = event.context;

  const input = config.inputMapper
    ? config.inputMapper(event)
    : event.payload;

  await dualPayIntegration.executeLedgerAction(
    config.ledgerAction,
    input,
    identity
  );
});
