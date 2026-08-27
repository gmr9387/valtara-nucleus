// src/nucleus/resources/resourceService.ts

/**
 * Resource Service (Phase 2.9)
 *
 * Purpose:
 *   Public API for:
 *     - creating resources
 *     - updating resources
 *     - validating resources
 *     - enforcing tenant isolation
 *     - enforcing credential isolation
 *     - building resource graphs
 *     - safe lookup
 *
 * This is the runtime enforcement layer for Phase 2.
 */

import { ResourceNode, ResourceGuards } from "./resourceGuards";
import { buildResourceGraph, buildGraphFor } from "./resourceGraphBuilder";
import { validateResource } from "./resourceRegistry";

export class ResourceService {
  private store: Map<string, ResourceNode> = new Map();

  /**
   * Create a new resource.
   * Performs:
   *   - invariant validation
   *   - semantic validation
   *   - dependency validation
   *   - tenant isolation enforcement
   */
  create(node: ResourceNode) {
    // Validate resource invariants + semantics
    const validation = validateResource(node.type, node.version, node.payload);
    if (!validation.ok) {
      throw new Error(
        `Resource validation failed: ${validation.errors?.join(", ")}`
      );
    }

    // Build graph for dependency validation
    const graph = buildGraphFor(node.type, this.collectLineage(node));

    const depValidation = ResourceGuards.validateGraph(node, graph);
    if (!depValidation.ok) {
      throw new Error(
        `Dependency validation failed: ${depValidation.errors?.join(", ")}`
      );
    }

    // Tenant isolation
    const tenantCheck = ResourceGuards.enforceTenantIsolation(node, graph);
    if (!tenantCheck.ok) {
      throw new Error(
        `Tenant isolation violation: ${tenantCheck.errors?.join(", ")}`
      );
    }

    // Credential isolation (if applicable)
    const credCheck = ResourceGuards.enforceCredentialIsolation(node, graph);
    if (!credCheck.ok) {
      throw new Error(
        `Credential isolation violation: ${credCheck.errors?.join(", ")}`
      );
    }

    // Store resource
    this.store.set(node.id, node);
    return node;
  }

  /**
   * Update an existing resource.
   * Re-validates invariants + semantics + isolation.
   */
  update(id: string, updates: Partial<ResourceNode>) {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Resource ${id} not found.`);
    }

    const updated = { ...existing, ...updates };

    // Re-run full validation pipeline
    return this.create(updated);
  }

  /**
   * Safe lookup:
   *   Prevents cross-tenant access.
   */
  lookup(type: string, id: string, organizationId: string) {
    const graph = buildGraphFor(type, this.collectLineageById(id));
    return ResourceGuards.safeLookup(graph, type as any, id, organizationId);
  }

  /**
   * Collect lineage nodes for a resource.
   * Used for graph building.
   */
  private collectLineage(node: ResourceNode): ResourceNode[] {
    const lineage: ResourceNode[] = [node];

    // Add ancestors if they exist
    if (node.organizationId) {
      const org = this.store.get(node.organizationId);
      if (org) lineage.push(org);
    }

    if (node.projectId) {
      const proj = this.store.get(node.projectId);
      if (proj) lineage.push(proj);
    }

    if (node.environmentId) {
      const env = this.store.get(node.environmentId);
      if (env) lineage.push(env);
    }

    if (node.connectorId) {
      const conn = this.store.get(node.connectorId);
      if (conn) lineage.push(conn);
    }

    return lineage;
  }

  /**
   * Collect lineage by resource ID.
   */
  private collectLineageById(id: string): ResourceNode[] {
    const node = this.store.get(id);
    if (!node) return [];
    return this.collectLineage(node);
  }

  /**
   * Debug: return full resource graph.
   */
  debugGraph() {
    return buildResourceGraph(Array.from(this.store.values()));
  }
}
