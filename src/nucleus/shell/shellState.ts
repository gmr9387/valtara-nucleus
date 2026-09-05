// Phase 47 — Shell State

export interface ShellState {
  history: string[];
  lastExecutedAt?: string;
}

export const shellState: ShellState = {
  history: [],
};
