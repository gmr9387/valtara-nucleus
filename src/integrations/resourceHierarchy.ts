/**
 * resourceHierarchy.ts
 *
 * Nucleus Resource Hierarchy Specification
 *
 * Defines the unified resource hierarchy for the entire Valtaris ecosystem.
 * All arms (Glue, Decision Weaver, Guardian, DualPay) must obey this hierarchy.
 *
 * Hierarchy:
 * - Tenant
 * - Project
 * - Environment
 * - Resource
 */

export interface NucleusTenant {
  id: string;
  name: string;
  createdAt: string;
}

export interface NucleusProject {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
}

export interface NucleusEnvironment {
  id: string;
  projectId: string;
  name: "dev" | "stage" | "prod";
  createdAt: string;
}

export interface NucleusResource {
  id: string;
  type: string; // workflow, decision-model, rule-set, payment-rail, etc.
  environmentId: string;
  ownerId: string; // actor or system
  createdAt: string;
}

/**
 * Resource Hierarchy Provider Interface
 *
 * Arms call into this to resolve resource ownership and scoping.
 */

export interface NucleusResourceHierarchyProvider {
  getTenant(tenantId: string): Promise<NucleusTenant | null>;
  getProject(projectId: string): Promise<NucleusProject | null>;
  getEnvironment(environmentId: string): Promise<NucleusEnvironment | null>;
  getResource(resourceId: string): Promise<NucleusResource | null>;
}

/**
 * Default stub implementation.
 *
 * Later swaps will:
 * - bind to Supabase tables
 * - enforce RLS
 * - validate resource ownership
 * - validate environment scoping
 */

export const resourceHierarchyProvider: NucleusResourceHierarchyProvider = {
  async getTenant(tenantId) {
    console.log("[NUCLEUS RESOURCE] getTenant:", tenantId);
    return {
      id: tenantId,
      name: "Default Tenant",
      createdAt: new Date().toISOString()
    };
  },

  async getProject(projectId) {
    console.log("[NUCLEUS RESOURCE] getProject:", projectId);
    return {
      id: projectId,
      tenantId: "default-tenant",
      name: "Default Project",
      createdAt: new Date().toISOString()
    };
  },

  async getEnvironment(environmentId) {
    console.log("[NUCLEUS RESOURCE] getEnvironment:", environmentId);
    return {
      id: environmentId,
      projectId: "default-project",
      name: "dev",
      createdAt: new Date().toISOString()
    };
  },

  async getResource(resourceId) {
    console.log("[NUCLEUS RESOURCE] getResource:", resourceId);
    return {
      id: resourceId,
      type: "generic",
      environmentId: "dev",
      ownerId: "system",
      createdAt: new Date().toISOString()
    };
  }
};
