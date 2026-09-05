// Phase 40 — Sovereignty State

export interface SovereigntyState {
  active: boolean;
  lastActivatedAt?: string;
  constitutionVersion: string;
}

export const sovereigntyState: SovereigntyState = {
  active: false,
  constitutionVersion: "1.0.0",
};
