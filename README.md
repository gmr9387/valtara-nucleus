Valtaris Nucleus
A Constitutional Runtime for Workflow‑Driven Systems
Valtaris Nucleus is a constitutional execution engine designed to unify workflow orchestration, subsystem coordination, identity governance, decision evaluation, telemetry, lineage, and background runtime processing into a single coherent platform.

Nucleus provides a deterministic, auditable, and governable foundation for multi‑service systems. It is built for environments where workflows must be:

traceable

replayable

governed

identity‑aware

subsystem‑coordinated

contract‑driven

persisted

observable

constitutional

Nucleus is the core of the Valtaris ecosystem — powering Glue, DualPay, Guardian, Weaver, and future subsystems.

Why Nucleus Exists
Modern systems are fragmented:

Workflows live in one service

Identity lives in another

Telemetry is bolted on

Decision logic is scattered

Subsystems operate independently

Background workers run separately

API layers are inconsistent

Lineage is rarely captured

Governance is an afterthought

Nucleus solves this by providing a single constitutional runtime that governs:

1. Workflow Execution
Every workflow step becomes a constitutional contract.

2. Subsystem Dispatch
Weaver, Guardian, Glue, DualPay — unified under one router.

3. Identity Binding
API keys, service accounts, SCIM, SSO — all integrated.

4. Decision Engine
Governance rules + confidence scoring + replay.

5. Telemetry & Tracing
Every event is persisted and observable.

6. Lineage
Every workflow run produces a complete lineage tree.

7. Background Runtime
Durable queue + worker pool + subsystem‑level execution.

8. HTTP API Layer
REST endpoints for workflows, subsystems, lineage, telemetry, decisions.

9. CLI
nucleus dev, nucleus run, nucleus inspect, nucleus lineage, nucleus telemetry, nucleus decision.

10. Constitution
A single object that unifies the entire runtime.

Architecture Overview
Nucleus is built around a constitutional spine:

Code
Workflow Engine
   ↓
NucleusApi
   ↓
Subsystem Router
   ↓
Subsystem Runtime (Weaver / Guardian / Glue / DualPay)
   ↓
Nucleus Runtime (Workers + Durable Queue)
   ↓
Supabase (Lineage + Telemetry + Events)
Parallel to this spine:

Code
Identity Layer
Decision Engine
HTTP API Layer
CLI
Constitution
Everything is unified under:

Code
src/nucleus/constitution.ts
This file is the “brain” of Nucleus.

Core Concepts
Constitutional Contracts
Every workflow step is treated as a constitutional event:

opportunity

recommendation

authorization

execution

payment

Each event is:

emitted

traced

persisted

governed

identity‑bound

lineage‑tracked

This creates a deterministic audit trail.

Subsystems
Nucleus ships with four constitutional subsystems:

Weaver — opportunity + recommendation

Guardian — authorization

Glue — execution

DualPay — payment

Each subsystem has:

a runtime

a constitutional contract handler

lineage generation

telemetry emission

Identity Layer
Nucleus integrates:

API keys

service accounts

SCIM skeleton

SSO skeleton

identity context

identity service

Identity is bound at the HTTP layer and propagated through:

workflow execution

subsystem dispatch

decision evaluation

runtime execution

Decision Engine
The decision engine provides:

governance rules

confidence scoring

replay

unified evaluation

This allows Nucleus to enforce:

policy

compliance

authorization

risk scoring

Telemetry & Lineage
Every event is persisted into Supabase:

nucleus_lineage

nucleus_telemetry

nucleus_events

This provides:

full replay

full auditability

full observability

Runtime
Nucleus includes:

durable queue

worker pool

background execution

subsystem‑level runtime

This allows workflows to run:

synchronously

asynchronously

concurrently

HTTP API
Nucleus exposes:

Code
POST /nucleus/workflow/run
POST /nucleus/subsystem/dispatch
GET  /nucleus/lineage/:org
GET  /nucleus/telemetry/:org
POST /nucleus/decision/evaluate
Identity is bound via:

Code
x-api-key
x-service-account
x-org
x-subsystem
CLI
Nucleus ships with a full CLI:

Code
nucleus dev
nucleus run workflow.json
nucleus inspect org
nucleus lineage org
nucleus telemetry org
nucleus decision context.json
This allows developers to:

run workflows

inspect lineage

inspect telemetry

evaluate decisions

run the server

Constitution
The Constitution is the unified interface:

ts
const nucleus = new Nucleus("org-1", "weaver");

await nucleus.runWorkflow(definition);
await nucleus.dispatch("authorization", "v1", payload);
await nucleus.emit("execution", "v1", payload);
nucleus.evaluate(context);
nucleus.startRuntime();
nucleus.enqueue("payment", "v1", payload);
This is the single source of truth for the entire runtime.

Design Principles
Nucleus is built on five constitutional principles:

1. Determinism
Every workflow run produces the same lineage.

2. Governance
Every decision is governed by explicit rules.

3. Identity
Every action is identity‑bound.

4. Observability
Every event is traced, persisted, and replayable.

5. Constitution
Every subsystem operates under a unified constitutional runtime.

Use Cases
Enterprise Workflow Engines
Replace brittle workflow systems with a constitutional runtime.

Financial Systems
DualPay + Guardian provide payment + authorization governance.

Healthcare Systems
Lineage + decision engine provide auditability and compliance.

AI Orchestration
Weaver + Glue provide opportunity + execution coordination.

Multi‑Service Platforms
Nucleus unifies subsystem execution under one constitutional spine.

Why Nucleus Is Different
Most workflow engines are:

stateless

ungoverned

identity‑agnostic

subsystem‑blind

telemetry‑optional

lineage‑missing

runtime‑fragmented

Nucleus is:

stateful

governed

identity‑aware

subsystem‑coordinated

telemetry‑first

lineage‑complete

runtime‑unified

constitutionally structured

This is not a workflow engine.
This is a constitutional runtime.

Project Structure
Code
src/
  nucleus/
    api/
    cli/
    decision/
    http/
    identity/
    ops/
    subsystems/
    constitution.ts
    index.ts
  lib/
    workflows/
server.ts
nucleus (executable)
package.json
.env
Getting Started
Run the server
Code
nucleus dev
Run a workflow
Code
nucleus run workflow.json
Inspect lineage
Code
nucleus lineage org-1
Inspect telemetry
Code
nucleus telemetry org-1
Evaluate a decision
Code
nucleus decision context.json
Status
Nucleus is currently in active development as part of the Valtaris ecosystem.

License
MIT (or your preferred license — add later)

Author
George (Valtaris Systems)
