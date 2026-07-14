# ValtariOS Core

> The shared platform operating system for ValtariOS products: Claim Clarity, Glue, Weaver, Guardian, Cloud, and what comes next.

ValtariOS Core is the central command layer that every ValtariOS product integrates with. It owns identity, tenancy, audit, telemetry, secrets, connectors, workflows, evidence, decisions, and governance as a single modular monolith. The goal is not to be a holding company of unrelated SaaS tools, but one coherent operating system that every product module plugs into.

---

## Current state

Core is in active construction. Foundation substrate modules are live. The decision engine has stable contracts and is awaiting safe extraction from product-specific inference logic.

| Phase | Theme | Status |
|-------|-------|--------|
| Phase 1 | Core extraction preparation — module boundaries, contracts, registry | Complete |
| Phase 2 | Safe extraction of reusable inference logic into Core | Complete |
| Phase 3 | Operations readiness dashboard and substrate maturity | Complete |
| Phase 4 | Product integration spine — products registry, service accounts, API keys, event ingest | Planned |
| Phase 5+ | Identity depth, commercial layer, enterprise gates, runtime hardening | Future |

---

## What is already live

### Platform substrate (Active)

These modules are already wired into the running platform and enforced by RLS:

- **Tenancy** — organizations, memberships, roles, project scoping
- **Projects** — projects and environments per organization
- **Secrets** — credential providers, credentials, versions, rotation events
- **Connectors** — connector registry, versions, capabilities, bindings, health checks
- **Workflows** — workflow definitions, versions, runs, steps, audit events
- **Telemetry** — append-only events, metrics, and traces
- **Audit** — append-only audit log with correlation ids
- **Permissions** — role-to-permission mapping mirrored by RLS

### Decision engine (Architecture Ready)

These modules have stable TypeScript contracts and are the permanent home for the ValtariOS decision engine. No live inference logic has been moved yet, so behavior remains unchanged while the architecture boundary is established:

- **types** — foundational vocabulary: `Decision`, `ConfidenceBand`, `Severity`, `EvaluationMode`, `TraceRecord`
- **contracts** — strict request/response interfaces for cross-product integration
- **evaluator** — rule execution, condition evaluation, candidate generation
- **confidence** — data quality, corroboration, contradictions, missing facts
- **decisions** — vote aggregation, priority weighting, tie breaking
- **trace** — rule trace, evaluation trace, audit trace, replay trace
- **governance** — rule health, explainability, audit readiness, scoring
- **replay** — historical replay, diff generation, drift detection

### Core Operations Readiness

The `/core` page shows live substrate readiness for the selected organization:

- Projects & environments
- Secrets health (active / rotating / total)
- Connector health (active / error / total)
- Workflow readiness
- Workflow runs in the last 24h
- Telemetry volume in the last 24h
- Audit volume in the last 24h

Each area reports `READY`, `PARTIAL`, `ABSENT`, or `UNKNOWN` so operators can see substrate gaps at a glance.

---

## Tech stack

- **Framework:** TanStack Start v1 (React 19, SSR/SSG, file-based routing)
- **Build tool:** Vite 7
- **Styling:** Tailwind CSS v4 with semantic design tokens
- **Backend / Auth / Database:** Lovable Cloud
- **State:** TanStack Query + Zustand
- **Forms / schemas:** React Hook Form + Zod
- **Icons:** Lucide React
- **Target runtime:** Edge / Cloudflare Workers

---

## Getting started

```bash
# Install dependencies
bun install

# Start the dev server
bun dev

# Build for production
bun run build

# Lint and format
bun run lint
bun run format
```

The dev server runs at `http://localhost:8080`.

---

## Project structure

```text
src/
  components/          # Shared UI components and platform primitives
  hooks/               # Reusable React hooks
  integrations/        # Backend client and auth middleware (auto-generated)
  lib/
    core/              # ValtariOS Core modules
      types.ts
      contracts.ts
      evaluator.ts
      confidence.ts
      decisions.ts
      trace.ts
      governance.ts
      replay.ts
      readiness.ts
      index.ts
    schemas/           # Zod schemas per domain
    workflows/         # Workflow runtime engine
    auth-context.tsx   # Authentication provider
    queries.ts         # TanStack Query hooks
    audit.ts           # Audit logging helpers
    telemetry.ts       # Telemetry helpers
  routes/              # TanStack Start file-based routes
    __root.tsx         # Root layout
    index.tsx          # Landing page
    login.tsx          # Auth page
    _app.tsx           # Authenticated layout
    _app.core.tsx      # Core operations readiness
    _app.dashboard.tsx # Overview dashboard
    _app.workflows.*   # Workflow pages
    ...
```

---

## Architecture notes

- **No behavior changes during extraction.** Phases 1–3 only create boundaries and dashboards. Existing inference outcomes are untouched.
- **RLS is the isolation model.** Every public table has Row Level Security enabled and explicit GRANTs. Tenant isolation is enforced at the database layer.
- **Audit is append-only.** Privileged actions are logged with correlation ids for traceability.
- **Server functions live in client-safe paths.** `createServerFn` modules are placed under `src/lib/` or next to their route, never under `src/server/`.
- **Public APIs go under `/api/public/`.** External webhooks, cron jobs, and product event ingest endpoints belong there and must verify callers before acting.

---

## Roadmap

1. **Phase 4 — Product Integration Spine**
   - Global `products` registry with manifests
   - Per-organization product installations
   - Service accounts and scoped API keys
   - Event ingest gateway for product telemetry and health
   - Glue reference integration

2. **Phase 5 — Onboarding & Identity Depth**
   - Invitation flow
   - MFA / TOTP / WebAuthn
   - Session and org settings

3. **Phase 6 — Commercial Layer**
   - Entitlements engine
   - Plans, limits, and enforcement
   - Billing and metering

4. **Phase 7 — Enterprise Gate**
   - SSO (SAML / OIDC)
   - SCIM provisioning
   - Tamper-evident audit
   - Real KMS integration for secrets

5. **Phase 8 — Runtime Hardening**
   - Worker pool, retries, timeouts, idempotency, DLQ
   - Telemetry queue and SLO dashboards

6. **Phase 9 — Decision Engine Extraction**
   - Move live rule execution into Core
   - Ship as a reusable package
   - First real implementation in Claim Clarity

---

## Brand note

All references to the platform use **ValtariOS**. Legacy names such as Valtaris, Valtaris Core, and Valtaris Platform have been replaced across page titles, navigation, architecture diagrams, documentation panels, event contracts, TypeScript interfaces, and integration placeholders.

---

## License

Private. All rights reserved.
