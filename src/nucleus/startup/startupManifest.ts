// Phase 41 — Startup Manifest

export interface StartupManifest {
  entrypoint: string;
  autoStart: boolean;
  activateEnvironments: boolean;
  verifyConstitution: boolean;
}

export const startupManifest: StartupManifest = {
  entrypoint: "NucleusServer",
  autoStart: true,
  activateEnvironments: true,
  verifyConstitution: true,
};
