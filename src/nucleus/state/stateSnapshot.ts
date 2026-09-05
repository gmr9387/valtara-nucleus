// Phase 23 — State Snapshot

import { ResourceState } from "../resources/resourceState";
import { LineageEntry } from "../lineage/lineageEntry";
import { TelemetryEntry } from "../telemetry/telemetryEntry";

export interface StateSnapshot {
  resources: ResourceState[];
  lineage: LineageEntry[];
  telemetry: TelemetryEntry[];
}
