// Phase 45 — Legacy Adapter Dependency Graph

export interface LegacyAdapterDependency {
  adapter: string;
  dependsOn: string[];
}

export const legacyAdapterDependencyGraph: LegacyAdapterDependency[] = [
  { adapter: "legacy.externalContractAdapter", dependsOn: [] },
  { adapter: "legacy.externalEventAdapter", dependsOn: [] },
  { adapter: "legacy.externalIdentityAdapter", dependsOn: [] },

  { adapter: "legacy.subsystemContractAdapter", dependsOn: ["legacy.externalContractAdapter"] },
  { adapter: "legacy.subsystemEventAdapter", dependsOn: ["legacy.externalEventAdapter"] },
  { adapter: "legacy.subsystemIdentityAdapter", dependsOn: ["legacy.externalIdentityAdapter"] },
];
