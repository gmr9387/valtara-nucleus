/**
 * Decision engine contracts for the Valtaris ecosystem.
 * These contracts define the structure of decision definitions,
 * evaluations, confidence scoring, and traceability used across
 * Guardian and other runtimes that rely on deterministic decisions.
 */

export interface DecisionInput {
  id: string;
  payload: Record<string, unknown>;
  receivedAt: string;
}

export interface DecisionDefinition {
  id: string;
  name: string;
  description: string;
  version: number;
  metadata: Record<string, unknown>;
}

export interface DecisionConfidence {
  score: number; // 0 to 1
  rationale: string;
}

export interface DecisionTrace {
  id: string;
  decisionId: string;
  step: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface DecisionEvaluation {
  id: string;
  definitionId: string;
  version: number;
  input: DecisionInput;
  output: Record<string, unknown>;
  confidence: DecisionConfidence;
  createdAt: string;
}

export interface DecisionEvent {
  id: string;
  evaluationId: string;
  type: "start" | "step" | "complete" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
