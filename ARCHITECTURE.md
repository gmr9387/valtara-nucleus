# Architecture Boundary Checkpoint

## Ownership
- **Core** owns substrate concerns (types, contracts, services, readiness composition).
- **Glue** owns runtime orchestration and product-level runtime integration.
- **Weaver** owns decision, governance, and replay APIs.

## Import rules
- Consumers must import Core services from `@/lib/core/services` and must not deep-import `@/lib/core/services/*.service`.
- Consumers must not re-export deep Core service files; re-export only via `@/lib/core/services`.
- Decision/governance/replay imports should come from `@/lib/weaver`.

## Public entrypoint rules
- `src/lib/core/index.ts` is the Core public boundary and must not export product examples.
- `src/lib/core/index.ts` must not import or export Glue/runtime/workflow execution modules.
- Weaver decision/governance/replay surfaces are published from `src/lib/weaver/index.ts`, not Core.

## Boundary regression checklist
- [ ] `npm run lint` is clean (no boundary rail warnings).
- [ ] `npm run build` passes.
- [ ] Core public entrypoint exports only approved Core surfaces.
- [ ] Product examples remain outside Core (`src/lib/demo/examples`).
