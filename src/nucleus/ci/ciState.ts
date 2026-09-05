// Phase 44 — CI State

export interface CIState {
  executedSuites: string[];
  completed: boolean;
  lastExecutedAt?: string;
}

export const ciState: CIState = {
  executedSuites: [],
  completed: false,
};
