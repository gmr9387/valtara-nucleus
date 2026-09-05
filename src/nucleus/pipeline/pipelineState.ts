// Phase 42 — Pipeline State

export interface PipelineState {
  executedSteps: string[];
  completed: boolean;
  lastExecutedAt?: string;
}

export const pipelineState: PipelineState = {
  executedSteps: [],
  completed: false,
};
