/**
 * Router for the Valtaris control plane.
 * Provides deterministic route registration, typed handlers,
 * and platform-wide routing primitives used across the server.
 */

export interface RouteContext {
  organizationId?: string;
  projectId?: string;
  environmentId?: string;
  metadata: Record<string, unknown>;
}

export interface RouteDefinition {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  handler: (ctx: RouteContext, req: Request) => Promise<Response>;
}

export class Router {
  private routes: RouteDefinition[] = [];

  register(route: RouteDefinition): void {
    this.routes.push(route);
  }

  getRoutes(): RouteDefinition[] {
    return this.routes;
  }

  async dispatch(ctx: RouteContext, req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method as RouteDefinition["method"];

    const match = this.routes.find(r => r.path === path && r.method === method);

    if (!match) {
      return new Response("Not Found", { status: 404 });
    }

    return match.handler(ctx, req);
  }
}

export const router = new Router();
