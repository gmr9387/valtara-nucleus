// src/nucleus/index.ts

import { aggregateSubsystemOpenApi } from "./registerSubsystems";

export const NucleusOpenApi = {
  openapi: "3.0.0",
  info: {
    title: "Nucleus Orchestration API",
    version: "1.0.0",
  },
  paths: {
    // core Nucleus paths...

    // subsystem paths
    ...aggregateSubsystemOpenApi().paths,
  },
};
