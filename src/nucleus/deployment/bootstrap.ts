// valtaris-nucleus/src/nucleus/deployment/bootstrap.ts

import { Constitution } from "../constitution";
import { APIServer } from "../api/apiServer";

/**
 * DeploymentBootstrap
 * --------------------
 * This file should NOT auto-start Nucleus.
 * It provides the internal boot sequence used by startNucleus().
 */
export class DeploymentBootstrap {
  static start() {
    console.log("=== Valtaris Nucleus Boot Sequence ===");

    // Load Constitution
    console.log("Constitution:", Constitution.describe());

    // Start API server
    APIServer.start(3000);

    console.log("Nucleus runtime initialized.");
  }
}
