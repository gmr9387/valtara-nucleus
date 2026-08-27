// src/nucleus/integrations/cli/nucleusCli.ts

/**
 * Nucleus CLI Tool
 *
 * Constitutional role:
 * Nucleus = KNOW
 *
 * Provides terminal-level introspection commands:
 *   nucleus status
 *   nucleus metrics
 *   nucleus last-event
 *   nucleus health
 *
 * Purely read-only.
 * No execution.
 * No authorization.
 * No domain logic.
 */

import { getEcosystemState } from "../../state/nucleusState";
import { getMetricsSnapshot } from "../nucleusMetrics";

export async function runNucleusCli(args: string[]) {
  const command = args[0];

  switch (command) {
    case "status":
      printStatus();
      break;

    case "metrics":
      printMetrics();
      break;

    case "last-event":
      printLastEvent();
      break;

    case "health":
      printHealth();
      break;

    default:
      printHelp();
      break;
  }
}

function printStatus() {
  const state = getEcosystemState();
  console.log("=== Nucleus Status ===");
  console.log("Last Event:", state.lastEvent);
  console.log("Subsystem Health:", state.subsystemHealth);
}

function printMetrics() {
  const metrics = getMetricsSnapshot();
  console.log("=== Nucleus Metrics ===");
  console.log(JSON.stringify(metrics, null, 2));
}

function printLastEvent() {
  const state = getEcosystemState();
  console.log("=== Nucleus Last Event ===");
  console.log(JSON.stringify(state.lastEvent, null, 2));
}

function printHealth() {
  const state = getEcosystemState();
  console.log("=== Nucleus Subsystem Health ===");
  console.log(JSON.stringify(state.subsystemHealth, null, 2));
}

function printHelp() {
  console.log("Nucleus CLI Commands:");
  console.log("  nucleus status");
  console.log("  nucleus metrics");
  console.log("  nucleus last-event");
  console.log("  nucleus health");
}
