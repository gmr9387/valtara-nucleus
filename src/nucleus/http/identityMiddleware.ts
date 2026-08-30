// src/nucleus/http/identityMiddleware.ts
// Full file — Identity binding middleware

import { IdentityService } from "../identity/identityService";
import { ApiKey } from "../identity/apiKeys";
import { ServiceAccount } from "../identity/serviceAccounts";

export class IdentityMiddleware {
  static bindIdentity(req: any, res: any, next: any) {
    const apiKey = req.headers["x-api-key"];
    const serviceAccountId = req.headers["x-service-account"];

    let identity;

    if (apiKey) {
      identity = new ApiKey({
        key: apiKey,
        organizationId: req.headers["x-org"] || "org-1",
        subsystem: req.headers["x-subsystem"] || "weaver",
        scopes: ["workflow:run", "subsystem:dispatch"],
      });
    }

    if (serviceAccountId) {
      identity = new ServiceAccount({
        id: serviceAccountId,
        name: "service-account",
        subsystem: req.headers["x-subsystem"] || "weaver",
        organizationId: req.headers["x-org"] || "org-1",
        permissions: ["workflow:run", "subsystem:dispatch"],
      });
    }

    req.identity = new IdentityService({
      organizationId: req.headers["x-org"] || "org-1",
      subsystem: req.headers["x-subsystem"] || "weaver",
      actor: identity?.getName?.() || identity?.getKey?.() || "system",
      roles: identity?.getPermissions?.() || identity?.getScopes?.() || [],
    });

    next();
  }
}
