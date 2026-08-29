// src/nucleus/identity/identityService.ts
// Full file — Identity service using your repo's naming

import { IdentityContext } from "./identityContext";

export class IdentityService {
  constructor(private ctx: IdentityContext) {}

  getOrganizationId() {
    return this.ctx.organizationId;
  }

  getSubsystem() {
    return this.ctx.subsystem;
  }

  getActor() {
    return this.ctx.actor || "system";
  }

  getRoles() {
    return this.ctx.roles || [];
  }

  hasRole(role: string) {
    return this.getRoles().includes(role);
  }
}
