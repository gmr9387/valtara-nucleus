# ValtariOS Core — Status

## Core v0 Motion Sprint

**Sprint goal:** First live DualPay to Core proof loop.

**Completed:** 2026-07-06

---

## Core Stable API Route Sprint

**Sprint goal:** Make Core's first evaluation endpoint stable and callable by DualPay
without relying on TanStack Start content-addressed /_server URLs.

**Completed:** 2026-07-06

---

## Stable DualPay → Core Call Contract

DualPay sends a POST request to the following stable endpoint:

```
POST /api/v0/evaluate
Content-Type: application/json
X-Core-Api-Key: <CORE_API_KEY>
```

Request body (CoreEvaluationRequest):
```json
{
  "organizationId": "org-dualpay-001",
  "subjectId": "claim-abc-9999",
  "mode": "instant",
  "facts": {
    "domain": "claims",
    "event": "appeal.submit",
    "amount": 30000
  },
  "correlationId": "corr-001"
}
```

Response (CoreEvaluationResponse):
```json
{
  "decision": {
    "decision": {
      "outcome": "requires_approval",
      "confidence": 0.9,
      "confidenceBand": "very_high",
      "severity": "high"
    },
    "candidates": [...]
  },
  "confidence": {
    "score": 0.9,
    "band": "very_high",
    "missingFacts": []
  },
  "trace": {
    "traceId": "<uuid>",
    "evaluations": [...],
    "records": [...]
  },
  "governance": {
    "score": 1,
    "explainable": true,
    "auditReady": true,
    "findings": []
  }
}
```

Error responses:
- 401 Unauthorized — missing or invalid X-Core-Api-Key
- 400 Bad Request — missing required fields or invalid mode
- 400 Bad Request — body is not valid JSON

---

## What was built (Stable API Route Sprint)

One stable HTTP endpoint at /api/v0/evaluate implemented as a TanStack Start
server route with a fixed, content-addressed-free URL. The endpoint:

- Accepts CoreEvaluationRequest validated with Zod
- Requires X-Core-Api-Key header matched against CORE_API_KEY env var
- Calls the existing runEvaluation() pipeline without changes
- Returns CoreEvaluationResponse as JSON
- Writes audit row to audit_events via Supabase service-role client
- Writes telemetry row to telemetry_events via Supabase service-role client
- Returns clear 4xx errors for bad auth and bad payload
- Is fully testable via the pure handleEvaluateRequest() function

---

## What was built (Core v0 Motion Sprint)

One real policy decision rule, a full evaluation pipeline, and an authenticated server
function that DualPay (or any service caller) can invoke to receive a traceable, auditable
decision response.

---

## Motion path: DualPay to Core

A DualPay service sends a POST request to the Core server function endpoint with a
CoreEvaluationRequest payload. Core authenticates the request using an X-Core-Api-Key
header matched against the CORE_API_KEY environment variable. Core runs the evaluation
pipeline and returns a CoreEvaluationResponse with a decision, confidence score, full
trace, and governance result. Core simultaneously writes an audit row to audit_events
and a telemetry row to telemetry_events using the Supabase service-role client.

---

## Rule implemented

Rule ID: claims.appeal.high-value-approval

Fires when all three conditions are true:

- facts.domain equals "claims"
- facts.event or facts.command contains "appeal" (case-insensitive)
- facts.amount is a number greater than or equal to 25000

When the rule fires, the decision outcome is "requires_approval" with severity "high"
and confidence band "very_high".

---

## Auth model

Two auth paths are accepted by the server functions:

M2M path for DualPay and other services: Caller sends the X-Core-Api-Key header.
The value is compared against the CORE_API_KEY environment variable. If the variable
is not set or the key does not match, the request is rejected with an Unauthorized error.

User path for authenticated UI callers: Caller sends an Authorization: ******
with a valid Supabase JWT. The requireSupabaseAuth middleware validates the token and
injects userId into the request context.

---

## Server function endpoints

evaluateCoreM2M: POST endpoint for service-to-service calls. Accepts X-Core-Api-Key.
evaluateCoreAuthed: POST endpoint for JWT-authenticated callers.

Both endpoints are compiled by TanStack Start and registered under the /_server/ path
with content-addressable URLs. The caller uses the @tanstack/react-start client to call
them, or constructs the raw HTTP request with the correct path.

See also: POST /api/v0/evaluate — the stable, content-address-free endpoint added in
the Stable API Route Sprint (above). This route is the preferred DualPay integration
target going forward.

---

## Files changed (Stable API Route Sprint)

src/lib/core/api/evaluate-handler.ts — New file. Pure handleEvaluateRequest() handler
function. Accepts a Request, validates auth and payload, calls runEvaluation(), and returns
a Response. Injectable IO for tests bypasses Supabase.

src/routes/api/v0/evaluate.ts — New file. TanStack Start server route that registers the
stable /api/v0/evaluate path and delegates to handleEvaluateRequest.

src/routeTree.gen.ts — Updated to register the new /api/v0/evaluate route.

src/lib/core/__tests__/api-route.test.ts — New file. 20 test cases covering: valid API key
returns 200, invalid/missing key returns 401, DualPay payload returns requires_approval,
response shape (traceId, decision, confidence, governance), IO invocation, and 400 for
bad payloads.

docs/STATUS.md — This file.

---

## Files changed (Core v0 Motion Sprint)

src/lib/core/types.ts — Added "requires_approval" to DecisionOutcome union type.

src/lib/core/evaluator.ts — Implemented evaluateRules() with the claims appeal rule.
The function evaluates three conditions against request.facts and returns a
RuleEvaluation and a DecisionCandidate.

src/lib/core/confidence.ts — Implemented calculateConfidence() with a base score of 0.9
and a penalty of 0.25 per required fact that is missing from request.facts.
Required facts: domain, amount.

src/lib/core/decisions.ts — Implemented resolveDecision() which sorts candidates by
weight descending and selects the winner. Sets severity based on outcome.

src/lib/core/trace.ts — Implemented generateTrace() which generates a crypto.randomUUID()
traceId and one TraceRecord per evaluated rule.

src/lib/core/governance.ts — Implemented evaluateGovernance() which sets auditReady=true
when a traceId is present, evaluations are non-empty, and all rules have a reason string.

src/lib/core/engine.ts — New file. Pure orchestration function runEvaluation() that calls
the above modules in sequence and accepts injectable IO for audit and telemetry writes.

src/lib/core/m2m-auth.ts — New file. Pure validateCoreApiKey() function and header
constant for M2M authentication.

src/lib/core/evaluate.functions.ts — New file. Two TanStack Start server functions:
evaluateCoreM2M (X-Core-Api-Key) and evaluateCoreAuthed (Supabase JWT).

src/lib/audit.ts — Added "evaluate" to AuditAction union type. Added logCoreDecision()
function for structured core decision audit logging.

src/lib/core/**tests**/engine.test.ts — New file. 15 test cases covering all five
required scenarios: requires_approval outcome, confidence degradation, auth rejection,
IO invocation, and trace/traceId structure.

vitest.config.ts — New file. Vitest configuration using node environment and
vite-tsconfig-paths for path alias resolution.

package.json — Added vitest@4.1.9 to devDependencies. Added "test": "vitest run" script.

docs/STATUS.md — This file.

---

## Glue Inbound API Surface Sprint

**Sprint goal:** Expose a stable callable Glue workflow execution endpoint that Core can call after a `requires_approval` decision.

**Completed:** 2026-07-06

---

## Core → Glue Call Contract

Core sends a POST request to the following stable endpoint after a `requires_approval` decision:

```
POST /api/v0/workflows/execute
Content-Type: application/json
X-Glue-Api-Key: <GLUE_API_KEY>
```

Request body (GlueExecuteRequest):
```json
{
  "organizationId": "org-nucleus-001",
  "workflowKey": "approval-workflow",
  "workflowVersionId": "<uuid>",
  "subjectId": "claim-xyz-100",
  "correlationId": "corr-core-001",
  "payload": {
    "claimId": "xyz-100",
    "amount": 30000
  }
}
```

Either `workflowVersionId` (UUID) or `workflowVersion` (integer) must be provided to pin the exact version.

Response (GlueExecuteResponse — 201 Created):
```json
{
  "runId": "<uuid>",
  "workflowVersionId": "<uuid>",
  "status": "pending",
  "correlationId": "corr-core-001"
}
```

Idempotency: sending the same `correlationId` for the same `organizationId` returns the existing run with HTTP 200 instead of creating a duplicate.

Error responses:
- 401 Unauthorized — missing or invalid X-Glue-Api-Key
- 400 Bad Request — missing required fields, no version selector, or invalid JSON
- 404 Not Found — workflow not found/archived for the given org, or version not published

---

## What was built (Glue Inbound API Surface Sprint)

One stable HTTP endpoint at /api/v0/workflows/execute implemented as a TanStack Start
server route with a fixed, content-addressed-free URL. The endpoint:

- Accepts GlueExecuteRequest validated with Zod
- Requires X-Glue-Api-Key header validated against GLUE_API_KEY env var before any IO
- Resolves the pinned workflow version (by UUID or version number) scoped to the organization
- Enforces tenant/organization isolation (workflow lookup is scoped to organizationId)
- Creates a workflow run in "pending" state
- Creates the first pending step when the workflow definition declares steps
- Returns runId, workflowVersionId, status, correlationId as a JSON envelope
- Supports idempotency: duplicate correlationId returns the existing run (200) without creating a new one
- Is fully testable via the pure handleExecuteRequest() function with injectable IO

---

## Files changed (Glue Inbound API Surface Sprint)

src/lib/glue/m2m-auth.ts — New file. Pure validateGlueApiKey() function and
X-Glue-Api-Key / GLUE_API_KEY constants for M2M authentication.

src/lib/glue/api/execute-handler.ts — New file. Pure handleExecuteRequest() handler.
Accepts a Request, validates auth before IO, validates payload with Zod, resolves the
pinned workflow version, creates a run and optional first step, and returns a Response.
Injectable GlueExecutionIO for tests bypasses Supabase.

src/routes/api/v0/workflows/execute.ts — New file. TanStack Start server route that
registers the stable /api/v0/workflows/execute path and delegates to handleExecuteRequest.

src/routeTree.gen.ts — Updated to register the new /api/v0/workflows/execute route.

src/lib/glue/__tests__/execute-handler.test.ts — New file. 20+ test cases covering:
valid request creates run (201), missing/wrong key returns 401, invalid payload returns 400,
pinned version by ID, pinned version by number, tenant isolation (404 for wrong org),
correlationId persistence, duplicate correlationId idempotency (200), archived workflow
returns 404, unpublished version returns 404, first step creation, no step when no steps
defined, and response shape validation.

docs/STATUS.md — Updated with Core → Glue call contract.

---



The Core to Glue integration is now complete. See the Glue Inbound API Surface Sprint section above for the Core → Glue call contract.

---

## Glue Production Migration Sprint

**Sprint goal:** Make POST /api/v0/workflows/execute work against the real Supabase production schema.

**Completed:** 2026-07-06

---

## Database migration (workflow_runs)

Migration file: `supabase/migrations/20260706000000_glue_production_migration.sql`

### New columns added to `workflow_runs`

| Column         | Type                    | Notes                                              |
| -------------- | ----------------------- | -------------------------------------------------- |
| subject_id     | TEXT NULL               | Subject entity this run is about (e.g. claim id)   |
| correlation_id | TEXT NULL               | Caller-supplied idempotency key, unique per org    |
| payload        | JSONB NOT NULL DEFAULT '{}' | Inbound execution payload                     |

`created_by` changed from NOT NULL → NULL to allow M2M service-role inserts where no auth.uid() is available.

### New indexes on `workflow_runs`

| Index name                        | Columns                          | Notes               |
| --------------------------------- | -------------------------------- | ------------------- |
| idx_workflow_runs_org_correlation | (organization_id, correlation_id) WHERE correlation_id IS NOT NULL | Unique; enforces idempotency per org |
| idx_workflow_runs_org_version     | (organization_id, version_id)    | Version lookups     |
| idx_workflow_runs_org_status      | (organization_id, status)        | Status-filter queries |

---

## What was built (Glue Production Migration Sprint)

`supabase/migrations/20260706000000_glue_production_migration.sql` — New migration.
Adds subject_id, correlation_id, and payload columns to workflow_runs. Makes created_by
nullable. Adds three composite indexes: unique (org + correlation_id) for idempotency,
(org + version_id), and (org + status).

`src/integrations/supabase/types.ts` — Updated workflow_runs Row/Insert/Update types
to include subject_id (string | null), correlation_id (string | null), payload (Json),
and created_by made nullable.

`src/lib/glue/api/execute-handler.ts` — Updated createRun IO implementation to insert
into the new payload column instead of input_json.

`src/lib/glue/__tests__/execute-handler.test.ts` — Added 10 new tests across four suites:
- Cross-org correlationId isolation (same correlationId in different org creates a new run)
- subjectId persistence (subjectId is forwarded to createRun)
- payload persistence (payload is forwarded to createRun)
- workflowVersionId persistence (resolved version id is used and echoed in the response)

docs/STATUS.md — This file.

---

## Module status after this sprint

Platform substrate: Active (unchanged)
tenancy, projects, secrets, connectors, workflows, telemetry, audit, permissions

Decision engine: Partially active (was Architecture Ready, now partially implemented)
evaluator — Active (one real rule)
confidence — Active (missing-facts scoring)
decisions — Active (candidate resolution)
trace — Active (traceId + TraceRecords)
governance — Active (auditReady flag)
replay — Architecture Ready (not yet implemented)

Integration surface:
DualPay to Core — Active (stable POST /api/v0/evaluate, X-Core-Api-Key auth)
DualPay to Core (legacy) — Active (M2M server function at /_server/<hash>)
Core to Glue — Active (stable POST /api/v0/workflows/execute, X-Glue-Api-Key auth)
