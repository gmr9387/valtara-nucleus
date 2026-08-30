/**
 * contracts.ts
 *
 * Nucleus Contract Layer Specification
 *
 * This defines the unified contract model for the entire Valtaris ecosystem.
 * All arms (Glue, Decision Weaver, Guardian, DualPay) must obey these contracts.
 *
 * Nucleus enforces:
 * - identity contracts
 * - workflow contracts
 * - decision contracts
 * - governance contracts
 * - payment contracts
 */

export type NucleusContractType =
  | "identity"
  | "workflow"
  | "decision"
  | "governance"
  | "payment";

export interface NucleusContractContext {
  tenantId: string;
  projectId: string;
  environmentId: string;
  actorId?: string;
}

export interface NucleusContract<TSpec = any> {
  id: string;
  type: NucleusContractType;
  version: number;
  spec: TSpec;
  createdAt: string;
  updatedAt: string;
}

/**
 * Contract Specifications
 * These define the shape of each subsystem's contract.
 */

export interface WorkflowContractSpec {
  workflowId: string;
  steps: string[];
  allowedActions: string[];
}

export interface DecisionContractSpec {
  modelId: string;
  allowedRules: string[];
  allowedInputs: string[];
}

export interface GovernanceContractSpec {
  ruleSetId: string;
  allowedTriggers: string[];
  allowedEnforcements: string[];
}

export interface PaymentContractSpec {
  rails: string[];
  currencies: string[];
  limits: {
    maxAmount: number;
    dailyLimit: number;
  };
}

/**
 * Contract Enforcement Interface
 */

export interface NucleusContractEngine {
  validateContract(contract: NucleusContract): boolean;
  enforceContract(
    contract: NucleusContract,
    context: NucleusContractContext,
    payload: any
  ): Promise<void>;
}

/**
 * Default stub implementation.
 *
 * Later swaps will:
 * - enforce workflow step validity
 * - enforce decision rule validity
 * - enforce governance rule validity
 * - enforce payment limits
 */

export const contractEngine: NucleusContractEngine = {
  validateContract(contract) {
    console.log("[NUCLEUS CONTRACT] Validating", contract);
    return true; // placeholder
  },

  async enforceContract(contract, context, payload) {
    console.log("[NUCLEUS CONTRACT] Enforcing", {
      contract,
      context,
      payload
    });
    // Future swaps:
    // - workflow contract enforcement
    // - decision contract enforcement
    // - governance contract enforcement
    // - payment contract enforcement
  }
};
