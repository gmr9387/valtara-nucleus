/**
 * HTTP server for the Valtaris control plane.
 * Provides deterministic request handling, typed context
 * construction, and router dispatch integration.
 */

import { router } from "./router";
import { PlatformError, wrapError } from "../runtime/errors";

export interface ServerConfig {
  port: number;
  metadata: Record<string, unknown>;
}

export class Server {
  private port: number;
  private metadata: Record<string, unknown>;

  constructor(config: ServerConfig) {
    this.port = config.port;
    this.metadata = config.metadata;
  }

  private buildContext(req: Request) {
    const url = new URL(req.url);

    return {
      organizationId: url.searchParams.get("organizationId") ?? undefined,
      projectId: url.searchParams.get("projectId") ?? undefined,
      environmentId: url.searchParams.get("environmentId") ?? undefined,
      metadata: this.metadata
    };
  }

  async start(): Promise<void> {
    const server = Bun.serve({
      port: this.port,
      fetch: async (req: Request) => {
        try {
          const ctx = this.buildContext(req);
          return await router.dispatch(ctx, req);
        } catch (error) {
          const wrapped = wrapError(error as unknown);
          return new Response(
            JSON.stringify({
              code: wrapped.code,
              message: wrapped.message,
              metadata: wrapped.metadata,
              timestamp: wrapped.timestamp
            }),
            { status: 500 }
          );
        }
      }
    });

    console.log(`Valtaris server running on port ${server.port}`);
  }
}
