/**
 * workflowDefinitionRouterIntegration.ts
 *
 * Integrates workflow definition routes (Swap 88)
 * into the main Valtaris router.
 *
 * Responsibilities:
 * - import workflowDefinitionRoutes
 * - merge them with existing Glue routes
 * - export unified route tree for router.tsx
 */

import { workflowDefinitionRoutes } from "./workflowDefinitionRoutes";
import { workflowRoutes } from "./workflowRoutes";
import { workflowRuntimeRoutes } from "./workflowRuntimeRoutes";
import { workflowInstanceRoutes } from "./workflowInstanceRoutes";

import { RouteObject } from "react-router-dom";

/**
 * Unified Glue route tree.
 * This is imported by router.tsx to build the full application router.
 */
export const glueRoutes: RouteObject[] = [
  ...workflowRoutes,
  ...workflowRuntimeRoutes,
  ...workflowInstanceRoutes,
  ...workflowDefinitionRoutes
];
