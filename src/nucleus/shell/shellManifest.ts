// Phase 47 — Shell Manifest

export interface ShellManifest {
  enabled: boolean;
  prompt: string;
}

export const shellManifest: ShellManifest = {
  enabled: true,
  prompt: "nucleus> ",
};
