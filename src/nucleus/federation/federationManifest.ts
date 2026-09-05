// Phase 38 — Federation Manifest

export interface FederationManifest {
  tenants: string[];
  environments: string[];
  defaultTenant: string;
  defaultEnvironment: string;
}

export const federationManifest: FederationManifest = {
  tenants: ["tenant-a", "tenant-b", "tenant-c"],
  environments: ["dev", "staging", "prod"],
  defaultTenant: "tenant-a",
  defaultEnvironment: "dev",
};
