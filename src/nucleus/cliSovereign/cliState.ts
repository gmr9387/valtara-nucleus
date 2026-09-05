// Phase 46 — CLI State

export interface CLIState {
  lastCommand?: string;
  lastExecutedAt?: string;
}

export const cliState: CLIState = {};
