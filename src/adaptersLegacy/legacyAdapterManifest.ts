// Phase 45 — Legacy Adapter Manifest

export interface LegacyAdapterManifest {
  enabled: boolean;
  adapters: string[];
}

export const legacyAdapterManifest: LegacyAdapterManifest = {
  enabled: true,
  adapters: [
    "legacy.externalContractAdapter",
    "legacy.externalEventAdapter",
    "legacy.externalIdentityAdapter",
    "legacy.subsystemContractAdapter",
    "legacy.subsystemEventAdapter",
    "legacy.subsystemIdentityAdapter",
  ],
};
