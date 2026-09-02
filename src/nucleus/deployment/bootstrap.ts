// src/nucleus/deployment/bootstrap.ts

import { APIServer } from "../api/apiServer";
import { Constitution } from "../constitution/constitution";

/**
 * Deployment Bootstrap (Phase 25)
 *
 * Starts the API server and prints the OS Constitution.
 */

export class DeploymentBootstrap {
  static start() {
    console.log("=== Valtaris OS Deployment Bootstrap ===");
    console.log("Constitution:", Constitution.describe());

    // Start API server
    APIServer.start(3000);

    console.log("Valtaris OS is now running.");
  }
}
