// src/nucleus/state/nucleusState.ts
// Full file — Unified Constitutional Nucleus State Engine

import { NucleusEvent } from "../contracts/NucleusEvent";

/**
 * Nucleus State Engine
 *
 * Constitutional responsibility:
 * Nucleus = KNOW
 *
 * Tracks:
 *   - last event
 *   - event history
 *   - subsystem health
 *   - contract lineage snapshots
 *   - replay safety
 */

export interface ContractSnapshot {
  name: string;
  version: string;
  payload: any;
  at: number;
}

export interface EcosystemState {
  lastEvent?: NucleusEvent;
  eventHistory: NucleusEvent[];
  subsystemHealth: Record<string, "healthy" | "degraded" | "offline">;
  contractHistory: ContractSnapshot[];
}

const state: EcosystemState = {
  lastEvent: undefined,
  eventHistory: [],
  subsystemHealth: {},
  contractHistory: []
};

/**
 * recordEvent(event)
 *
 * Constitutional KNOW behavior.
 */
export function recordEvent(event: NucleusEvent) {
  state.lastEvent = event;
  state.eventHistory.push(event);
}

/**
 * setSubsystemHealth(subsystem, status)
 */
export function setSubsystemHealth(
  subsystem: string,
  status: "healthy" | "degraded" | "offline"
) {
  state.subsystemHealth[subsystem] = status;
}

/**
 * recordContract(name, version, payload)
 *
 * Runtime lineage + replay safety.
 */
export function recordContract(
  name: string,
  version: string,
  payload: any
) {
  state.contractHistory.push({
    name,
    version,
    payload,
    at: Date.now()
  });
}

/**
 * lastContract(name)
 */
export function lastContract(name: string) {
  for (let i = state.contractHistory.length - 1; i >= 0; i--) {
    if (state.contractHistory[i].name === name) {
      return state.contractHistory[i];
    }
  }
  return undefined;
}

/**
 * getEcosystemState()
 */
export function getEcosystemState(): EcosystemState {
  return state;
}
