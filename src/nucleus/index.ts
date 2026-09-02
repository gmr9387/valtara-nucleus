// valtaris-nucleus/src/nucleus/index.ts

import { DeploymentBootstrap } from "./deployment/bootstrap";

/**
 * Canonical Nucleus startup entrypoint.
 * Used by server.ts and CLI/dev commands.
 */
export function startNucleus() {
  DeploymentBootstrap.start();
}
