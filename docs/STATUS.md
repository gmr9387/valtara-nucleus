# ValtariOS Core — Status

## Core v0 Motion Sprint

**Sprint goal:** First live DualPay to Core proof loop.

**Completed:** 2026-07-06

---

## What was built

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

---

## Files changed

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

## What is not built yet (Core to Glue)

The Core to Glue integration requires Glue to expose a stable API surface. Until Glue
has a callable endpoint, Core cannot dispatch workflow execution commands to it. This
remains the next sprint blocker once Glue is available.

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
DualPay to Core — Active (M2M server function, X-Core-Api-Key auth)
Core to Glue — Not started (Glue API surface required first)
