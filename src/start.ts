/**
 * Startup entrypoint for the Valtaris control plane.
 * Provides deterministic server initialization, environment
 * loading, and startup sequencing.
 */

import { Server } from "./server";

export interface StartupConfig {
  port: number;
  metadata: Record<string, unknown>;
}

export async function start(config: StartupConfig): Promise<void> {
  const server = new Server({
    port: config.port,
    metadata: config.metadata
  });

  await server.start();
}

const defaultConfig: StartupConfig = {
  port: Number(process.env.PORT ?? 3000),
  metadata: {
    environment: process.env.NODE_ENV ?? "development"
  }
};

start(defaultConfig).catch(err => {
  console.error("Fatal startup error:", err);
});
