// Phase 41 — Startup State

export interface StartupState {
  started: boolean;
  lastStartedAt?: string;
  entrypoint: string;
}

export const startupState: StartupState = {
  started: false,
  entrypoint: "NucleusServer",
};
