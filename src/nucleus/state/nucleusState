// src/nucleus/state/nucleusState.ts

import { NucleusEvent } from "../contracts/NucleusEvent";

/**
 * Nucleus State Engine
 *
 * Constitutional responsibility:
 * Nucleus = KNOW
 *
 * This module tracks lightweight in-memory ecosystem state.
 * It does NOT replace Supabase or workflow persistence.
 * It simply gives Nucleus a constitutional "map" of recent activity.
 */

export interface EcosystemState {
  lastEvent?: NucleusEvent;
  eventHistory: NucleusEvent[];
  subsystemHealth: Record<string, "healthy" | "degraded" | "offline">;
}

const state: EcosystemState = {
  lastEvent: undefined,
  eventHistory: [],
  subsystemHealth: {},
};

/**
 * recordEvent(event)
 *
 * Nucleus observes events and records them.
 * This is constitutional "KNOW" behavior.
 */
export function recordEvent(event: NucleusEvent) {
  state.lastEvent = event;
  state.eventHistory.push(event);
}

/**
 * setSubsystemHealth(subsystem, status)
 *
 * Allows Nucleus to track subsystem health.
 */
export function setSubsystemHealth(
  subsystem: string,
  status: "healthy" | "degraded" | "offline"
) {
  state.subsystemHealth[subsystem] = status;
}

/**
 * getEcosystemState()
 *
 * Returns the current in-memory state snapshot.
 */
export function getEcosystemState(): EcosystemState {
  return state;
}
