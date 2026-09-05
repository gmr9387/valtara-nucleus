// Phase 23 — State Store

import { ResourceState } from "../resources/resourceState";
import { LineageEntry } from "../lineage/lineageEntry";
import { TelemetryEntry } from "../telemetry/telemetryEntry";

export class StateStore {
  private resources: ResourceState[] = [];
  private lineage: LineageEntry[] = [];
  private telemetry: TelemetryEntry[] = [];

  addResource(resource: ResourceState) {
    this.resources.push(resource);
  }

  addLineage(entry: LineageEntry) {
    this.lineage.push(entry);
  }

  addTelemetry(entry: TelemetryEntry) {
    this.telemetry.push(entry);
  }

  getResources() {
    return [...this.resources];
  }

  getLineage() {
    return [...this.lineage];
  }

  getTelemetry() {
    return [...this.telemetry];
  }
}

export const stateStore = new StateStore();
