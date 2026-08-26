/**
 * guardianDefinitionIntegration.ts
 *
 * Nucleus → Guardian Rule Definition Integration Module
 *
 * This module wires Guardian's rule definition layer into the Nucleus control plane:
 * - identity binding
 * - definition validation
 * - contract enforcement
 * - telemetry
 * - error propagation
 * - event propagation
 */

import { NucleusIdentity } from "./identityBinding";
import { eventBus, NucleusEvent } from "./eventBus";
import { telemetryReporter, createLog } from "./telemetry";
import { errorReporter, createNucleusError } from "./errorModel";
import { contractEngine, NucleusContract } from "./contracts";

/**
 * Placeholder Guardian definition client.
 *
 * Later swaps will:
 * - bind to real Guardian rule definition engine
 * - bind to Supabase rule definition tables
 * - bind to rule validator
 */

const guardianDefinitionClient = {
  async validateRuleDefinition(definition: any, identity: NucleusIdentity) {
    return {
      definition,
      valid: true,
      identity
    };
  },

  async publishRuleDefinition(definition: any, identity: NucleusIdentity) {
    return {
      definition,
      status: "published",
      identity
    };
  }
};

/**
 * Integration Interface
 */

export interface GuardianDefinitionIntegration {
  validateRuleDefinition(definition: any, identity: NucleusIdentity): Promise<any>;
  publishRuleDefinition(definition: any, identity: NucleusIdentity): Promise<any>;
}

/**
 * Implementation
 */

export const guardianDefinitionIntegration: GuardianDefinitionIntegration = {
  async validateRuleDefinition(definition, identity) {
    try {
      telemetryReporter.log(
        createLog("guardian", "info", "Rule definition validation requested", {
          ruleId: definition?.id
        })
      );

      const contract: NucleusContract = {
        id: `guardian-rule-contract-${definition?.id}`,
        type: "governance",
        version: 1,
        spec: { definition },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      contractEngine.validateContract(contract);

      const result = await guardianDefinitionClient.validateRuleDefinition(
        definition,
        identity
      );

      const event: NucleusEvent = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        source: "guardian",
        type: "governance.rule.validated",
        context: identity,
        payload: result
      };

      await eventBus.publishEvent(event);

      return result;
    } catch (err: any) {
      const error = createNucleusError(
        "guardian",
        "error",
        "RULE_DEFINITION_VALIDATION_FAILED",
        err.message ?? "Rule definition validation failed",
        identity
      );

      await errorReporter.reportError(error);
      throw err;
    }
  },

  async publishRuleDefinition(definition, identity) {
    try {
      telemetryReporter.log(
        createLog("guardian", "info", "Rule definition publish requested", {
          ruleId: definition?.id
        })
      );

      const result = await guardianDefinitionClient.publishRuleDefinition(
        definition,
        identity
      );

      await eventBus.publishEvent({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        source: "guardian",
        type: "governance.rule.published",
        context: identity,
        payload: result
      });

      return result;
    } catch (err: any) {
      const error = createNucleusError(
        "guardian",
        "error",
        "RULE_DEFINITION_PUBLISH_FAILED",
        err.message ?? "Rule definition publish failed",
        identity
      );

      await errorReporter.reportError(error);
      throw err;
    }
  }
};
