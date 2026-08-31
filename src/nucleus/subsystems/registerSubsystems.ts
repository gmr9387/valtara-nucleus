// src/nucleus/registerSubsystems.ts

import { Application } from "express";
import { subsystemRegistry } from "./subsystemRegistry";

import { bindDualpayRoutes } from "./subsystems/dualpay/dualpayRouterBinding";
import { DualpayOpenApi } from "./subsystems/dualpay/dualpayOpenApi";

export function registerSubsystemRoutes(app: Application) {
  for (const subsystem of subsystemRegistry) {
    if (!subsystem.enabled) continue;

    switch (subsystem.id) {
      case "dualpay":
        bindDualpayRoutes(app);
        break;

      // existing cases for guardian, glue, weaver, contracts...
    }
  }
}

export function aggregateSubsystemOpenApi() {
  const paths: Record<string, any> = {};

  for (const subsystem of subsystemRegistry) {
    if (!subsystem.enabled) continue;

    switch (subsystem.id) {
      case "dualpay":
        Object.assign(paths, DualpayOpenApi.paths);
        break;

      // existing subsystem OpenAPI merges...
    }
  }

  return { paths };
}
