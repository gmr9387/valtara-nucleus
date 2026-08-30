// src/nucleus/resources/resourceGraphBuilder.ts

/**
 * Resource Graph Builder (Phase 2.8)
 *
 * Purpose:
 *   Build the hierarchical resource graph:
 *
 *     organization
 *       → project
 *         → environment
 *           → connector
 *             → credential
 *
 *   This graph is used by:
 *     - ResourceGuards (tenant isolation, credential isolation)
 *     - dependency validation
 *     - lineage checks
 *     - safe lookup
 */

import { ResourceNode } from "./resourceGuards";

export interface ResourceGraph {
  organization?: ResourceNode;
  project?: ResourceNode;
  environment?: ResourceNode;
  connector?: ResourceNode;
  credential?: ResourceNode;
}

/**
 * Build a resource graph from a flat list of nodes.
 *
 * Nodes may arrive in any order.
 * We assemble them into the constitutional hierarchy.
 */
export function buildResourceGraph(nodes: ResourceNode[]): ResourceGraph {
  const graph: ResourceGraph = {};

  // Index nodes by type
  for (const node of nodes) {
    graph[node.type] = node;
  }

  // Propagate organizationId downward
  if (graph.organization) {
    const orgId = graph.organization.id;

    if (graph.project) graph.project.organizationId = orgId;
    if (graph.environment) graph.environment.organizationId = orgId;
    if (graph.connector) graph.connector.organizationId = orgId;
    if (graph.credential) graph.credential.organizationId = orgId;
  }

  // Propagate projectId downward
  if (graph.project) {
    const projectId = graph.project.id;

    if (graph.environment) graph.environment.projectId = projectId;
    if (graph.connector) graph.connector.projectId = projectId;
    if (graph.credential) graph.credential.projectId = projectId;
  }

  // Propagate environmentId downward
  if (graph.environment) {
    const envId = graph.environment.id;

    if (graph.connector) graph.connector.environmentId = envId;
    if (graph.credential) graph.credential.environmentId = envId;
  }

  // Propagate connectorId downward
  if (graph.connector) {
    const connectorId = graph.connector.id;

    if (graph.credential) graph.credential.connectorId = connectorId;
  }

  return graph;
}

/**
 * Build a graph for a single resource and its ancestors.
 *
 * Example:
 *   buildGraphFor("credential", nodes)
 *   → returns org + project + env + connector + credential
 */
export function buildGraphFor(
  targetType: string,
  nodes: ResourceNode[]
): ResourceGraph {
  const graph = buildResourceGraph(nodes);

  // Only return the lineage relevant to the target
  const filtered: ResourceGraph = {};

  if (graph.organization) filtered.organization = graph.organization;
  if (graph.project) filtered.project = graph.project;
  if (graph.environment) filtered.environment = graph.environment;
  if (graph.connector) filtered.connector = graph.connector;
  if (graph.credential) filtered.credential = graph.credential;

  return filtered;
}
