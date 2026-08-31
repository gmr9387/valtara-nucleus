// src/nucleus/api/openai/index.ts
// Full file — OpenAPI Index Aggregator

import { ContractSubsystemOpenApi } from "./contractSubsystemOpenApi";

export const NucleusOpenApi = {
  openapi: "3.0.0",
  info: {
    title: "Nucleus API",
    version: "1.0.0",
    description: "OpenAPI specification for the Valtaris Nucleus system.",
  },
  paths: {
    ...ContractSubsystemOpenApi.paths,
  },
};
