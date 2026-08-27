// src/nucleus/integrations/nucleusSnapshotSerializer.ts

/**
 * Nucleus Snapshot Serializer
 *
 * Constitutional role:
 * Nucleus = KNOW
 *
 * Produces stable, portable snapshots of the entire ecosystem state:
 *   - subsystem health
 *   - last event
 *   - metrics
 *   - timestamps
 *
 * Purely read-only.
 * No execution.
 * No authorization.
 * No domain logic.
 */

import { getEcosystemState } from "../state/nucleusState";
import { getMetricsSnapshot } from "./nucleusMetrics";

export function serializeNucleusSnapshot() {
  const ecosystem = getEcosystemState();
  const metrics = getMetricsSnapshot();

  const snapshot = {
    version: 1,
    timestamp: Date.now(),
    ecosystem,
    metrics,
  };

  return JSON.stringify(snapshot, null, 2);
}

/**
 * Optional: write snapshot to disk (Bun/Node)
 *
 * This is optional and not required by the ecosystem.
 */
export async function writeSnapshotToFile(path: string) {
  const json = serializeNucleusSnapshot();

  try {
    await Bun.write(path, json);
    console.log(`[Nucleus] Snapshot written to ${path}`);
  } catch (err) {
    console.error("[Nucleus] Snapshot write failed:", err);
  }
}
