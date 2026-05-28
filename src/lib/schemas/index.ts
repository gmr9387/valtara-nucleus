/**
 * Centralized schema barrel.
 * Phase 2.5: domain modules live in ./schemas/*.schemas.ts
 *
 * The legacy `src/lib/schemas.ts` file remains the canonical home for
 * secret and connector primitives that server functions already import.
 * Re-exporting here lets consumers do `import { ... } from "@/lib/schemas/index"`.
 */
export * from "./auth.schemas";
export * from "./organization.schemas";
export * from "./project.schemas";
export * from "./environment.schemas";
export * from "./secrets.schemas";
export * from "./connectors.schemas";
export * from "./audit.schemas";
