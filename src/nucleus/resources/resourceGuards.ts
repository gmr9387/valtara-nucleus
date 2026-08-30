// src/nucleus/resources/resourceGuards.ts

/**
 * Resource Guards (Phase 2.7)
 *
 * Purpose:
 *   Runtime enforcement of:
 *     - tenant isolation
 *     - resource graph integrity
 *     - dependency validation
 *     - credential isolation
 *     - safe resource lookup
 *
 * SQL is optional — these guards enforce safety inside Nucleus itself.
 */

import {
  validateResource,
  validateDependencies,
  ResourceType,
  ResourceVersion,
} from "./resourceRegistry";

export interface ResourceNode {
  id: string;
  type: ResourceType;
  version: ResourceVersion;
  parentId?: string;
  organizationId?: string;
  projectId?: string;
  environmentId?: string;
  connectorId?: string;
  payload: any;
}

export class ResourceGuards {
  /**
   * Validate a resource using its registered invariants + validators.
   */
  static validate(node: ResourceNode) {
    return validateResource(node.type, node.version, node.payload);
  }

  /**
   * Enforce dependency rules using the resource graph.
   */
  static validateGraph(node: ResourceNode, graph: Record<string, ResourceNode>) {
    return validateDependencies(node.type, node.version, graph);
  }

  /**
   * Tenant isolation:
   *   - Every resource must belong to exactly one organization.
   *   - No cross-organization access allowed.
   */
  static enforceTenantIsolation(node: ResourceNode, graph: Record<string, ResourceNode>) {
    const org = graph["organization"];
    if (!org) {
      return {
        ok: false,
        errors: ["Missing root organization in resource graph."],
      };
    }

    if (node.organizationId !== org.id) {
      return {
        ok: false,
        errors: [
          `Tenant isolation violation: resource ${node.id} belongs to ${node.organizationId}, expected ${org.id}`,
        ],
      };
    }

    return { ok: true };
  }

  /**
   * Credential isolation:
   *   - Credentials must belong to a connector in the same organization.
   *   - No cross-connector or cross-environment leakage.
   */
  static enforceCredentialIsolation(node: ResourceNode, graph: Record<string, ResourceNode>) {
    if (node.type !== "credential") return { ok: true };

    const connector = graph["connector"];
    if (!connector) {
      return {
        ok: false,
        errors: ["Credential has no connector parent in graph."],
      };
    }

    if (node.connectorId !== connector.id) {
      return {
        ok: false,
        errors: [
          `Credential isolation violation: credential ${node.id} does not belong to connector ${connector.id}`,
        ],
      };
    }

    if (node.organizationId !== connector.organizationId) {
      return {
        ok: false,
        errors: [
          `Credential isolation violation: credential ${node.id} belongs to org ${node.organizationId}, connector belongs to ${connector.organizationId}`,
        ],
      };
    }

    return { ok: true };
  }

  /**
   * Safe lookup:
   *   Prevents subsystems from accessing resources outside their tenant.
   */
  static safeLookup(
    graph: Record<string, ResourceNode>,
    type: ResourceType,
    id: string,
    organizationId: string
  ) {
    const node = graph[type];
    if (!node || node.id !== id) {
      return {
        ok: false,
        errors: [`Resource ${type}:${id} not found.`],
      };
    }

    if (node.organizationId !== organizationId) {
      return {
        ok: false,
        errors: [
          `Tenant isolation violation: attempted to access ${type}:${id} from org ${organizationId}`,
        ],
      };
    }

    return { ok: true, node };
  }
}
