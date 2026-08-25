/**
 * Reimbursement engine contracts for the Valtaris ecosystem.
 * These contracts define adjudication primitives, COB logic,
 * denial structures, recovery metadata, evidence handling,
 * and appeal workflows used across DualPay.
 */

export interface ClaimInput {
  id: string;
  memberId: string;
  providerId: string;
  serviceDate: string;
  payload: Record<string, unknown>;
  receivedAt: string;
}

export interface AdjudicationPrimitive {
  id: string;
  name: string;
  description: string;
  version: number;
  metadata: Record<string, unknown>;
}

export interface COBPrimitive {
  id: string;
  primaryPaid: number;
  secondaryAllowed: number;
  rationale: string;
  metadata: Record<string, unknown>;
}

export interface DenialPrimitive {
  id: string;
  code: string;
  reason: string;
  metadata: Record<string, unknown>;
}

export interface RecoveryPrimitive {
  id: string;
  amount: number;
  reason: string;
  metadata: Record<string, unknown>;
}

export interface EvidenceItem {
  id: string;
  claimId: string;
  type: string;
  content: Record<string, unknown>;
  submittedAt: string;
}

export interface AppealPrimitive {
  id: string;
  claimId: string;
  level: number;
  rationale: string;
  submittedAt: string;
  metadata: Record<string, unknown>;
}

export interface ReimbursementEvaluation {
  id: string;
  claimId: string;
  adjudication: AdjudicationPrimitive;
  cob: COBPrimitive | null;
  denial: DenialPrimitive | null;
  recovery: RecoveryPrimitive | null;
  evidence: EvidenceItem[];
  appeal: AppealPrimitive | null;
  output: Record<string, unknown>;
  createdAt: string;
}

export interface ReimbursementEvent {
  id: string;
  evaluationId: string;
  type: "start" | "step" | "complete" | "error";
  timestamp: string;
  metadata: Record<string, unknown>;
}
