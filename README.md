# ValtariOS Core

> Enterprise control plane for multi-tenant operations, workflow governance, and shared platform capabilities across ValtariOS products.

---

## Table of Contents

* Overview
* Why This Exists
* Enterprise Highlights
* Key Features
* Architecture
* Technology Stack
* Project Structure
* Core Workflows
* Security
* Database Design
* API Overview
* Installation
* Configuration
* Testing
* Deployment
* Performance
* Roadmap
* Documentation
* Screenshots
* Contributing
* License
* Author
* Acknowledgements

---

# Overview

ValtariOS Core is the shared platform layer for the ValtariOS product suite. It provides tenant-aware identity, organization and project management, secrets and connector administration, workflow orchestration, auditability, telemetry, and governance foundations in one modular monolith. It is designed for internal platform teams and future enterprise operators who need a single operational control plane that can serve multiple products without duplicating critical infrastructure concerns.

---

# Why This Exists

## Business Problem

Modern SaaS portfolios often evolve into disconnected products that each reimplement identity, tenancy, audit, workflow execution, and operational controls. That fragmentation increases cost, slows product delivery, and makes enterprise governance difficult.

## Technical Challenge

A shared platform must enforce strict tenant isolation, support role-aware access, centralize operational telemetry, manage integrations and secrets safely, and expose reusable contracts that multiple product modules can adopt without breaking live behavior.

## Solution

ValtariOS Core centralizes these capabilities behind a single React-based control plane and a Supabase-backed data model with Row-Level Security. It combines shared platform modules, workflow runtime primitives, telemetry and audit trails, connector and secret management, and a staged decision-engine architecture so additional ValtariOS products can plug into common infrastructure safely.

---

# Enterprise Highlights

* Enterprise-grade modular monolith architecture
* Multi-tenant organization, project, and environment model
* Secure Supabase authentication
* Role-based access control (RBAC)
* Row-Level Security (RLS) across platform tables
* Append-only audit logging with correlation support
* Durable workflow data model with versioning and run tracking
* Workflow state guards for retry, terminal-state, and publish protections
* Queue- and event-oriented platform foundations for future runtime hardening
* Event-driven telemetry model for events, metrics, and traces
* AI and decision-engine ready contracts for cross-product automation
* REST-oriented public API direction under `/api/public/`
* Real-time operational readiness and dashboard views
* Structured observability through telemetry and audit datasets
* Production-oriented cloud and edge runtime targeting
* Scalable deployment model for shared platform services
* Security-conscious schema design aligned to enterprise controls
* Platform architecture prepared for healthcare and regulated workloads

---

# Key Features

## Core Capabilities

* Multi-organization tenant management
* Project and environment administration
* Core operations readiness dashboard
* Workflow definition, versioning, and run management
* Decision-engine contracts and governance modules

## Administrative Features

* Organization membership and role management
* Secrets and credential lifecycle tracking
* Connector catalog, bindings, and health checks

## Automation

* Workflow execution tracking with step-level state
* Telemetry event, metric, and trace capture
* Decision evaluation, confidence, trace, and replay modules

## Reporting

* Audit event history by organization
* Readiness status across substrate modules
* Dashboard metrics for projects, environments, and platform activity

---

# Architecture

## High-Level Architecture

> Insert architecture diagram.

---

## System Components

### Frontend

TanStack Start with React 19 provides the operator-facing console, including landing, authentication, dashboard, core readiness, workflow, audit, connector, secret, and governance routes.

### Backend

Application logic is organized in shared TypeScript modules under `src/lib`, with server-facing integrations and route logic built around Supabase-backed data access patterns.

### Database

PostgreSQL via Supabase stores tenant, project, environment, workflow, connector, credential, audit, and telemetry data with policy-driven isolation.

### Authentication

Supabase Auth manages sessions and user identity, while UI permission checks mirror server-side role rules enforced through database policies.

### Storage

Credential payloads are referenced through redacted version metadata and storage references, with the schema designed to keep sensitive material out of broadly readable tables.

### AI Services

The decision-engine modules define reusable contracts for evaluation, confidence scoring, governance, replay, and traceability, preparing the platform for AI-assisted and rules-driven automation.

### Background Workers

Workflow runs, steps, telemetry capture, and future worker-pool runtime hardening establish the foundation for asynchronous processing and recovery-oriented execution.

### Integrations

Connector providers, connector versions, capabilities, bindings, and health checks support external system integrations across categories such as AI, messaging, payments, social, database, and other services.

---

## Data Flow

Users authenticate through Supabase and enter the ValtariOS Core console. From the UI, actions such as creating organizations, managing projects, configuring secrets, binding connectors, or operating workflows are routed through shared application modules and persisted to Supabase-managed PostgreSQL tables. Row-Level Security policies constrain each read and write by tenant membership and role. Audit and telemetry records capture operational activity, while workflow and decision-engine modules maintain structured state that future products can consume.

---

# Technology Stack

## Frontend

* React 19
* TypeScript
* TanStack Start
* Tailwind CSS v4

## Backend

* Supabase
* PostgreSQL
* TypeScript shared modules

## Infrastructure

* Cloudflare-compatible edge runtime
* Supabase-managed storage and database services
* Supabase authentication

## AI

* Decision-engine contracts for evaluation and governance
* AI-oriented connector categories and service integration readiness
* Cross-product automation foundations

## DevOps

* GitHub
* ESLint and Prettier
* Vite build pipeline
* Telemetry and audit-based observability

---

# Project Structure

```text
project/
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── integrations/
│   ├── lib/
│   │   ├── core/
│   │   ├── schemas/
│   │   └── workflows/
│   ├── routes/
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
├── supabase/
│   ├── config.toml
│   └── migrations/
├── public/
├── README.md
├── package.json
├── bun.lock
├── components.json
├── eslint.config.js
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc
```

---

# Core Workflows

## Tenant Setup

Purpose

Establish an organization, assign membership, and create the initial project and environment structure.

Process

A user signs in, creates an organization, is seeded as owner, adds members through role-aware controls, and provisions projects and environments within that tenant.

Expected Result

A tenant-scoped workspace is created with secure role and data boundaries in place.

---

## Integration and Secrets Operations

Purpose

Manage credentials and connector bindings required for external platform integrations.

Process

Administrators register credentials, manage versions and rotation events, bind connectors at organization, project, or environment scope, and monitor connector health checks.

Expected Result

External integrations are centrally governed with auditable metadata and controlled tenant access.

---

## Workflow Execution and Monitoring

Purpose

Create, publish, run, and monitor workflows across an organization.

Process

Managers define workflow versions, publish immutable workflow definitions, operators start runs, workflow steps progress through tracked states, and audit and telemetry data capture lifecycle events.

Expected Result

Operational workflows are executed with traceable status, controlled state transitions, and tenant-aware observability.

---

# Security

## Authentication

Supabase Auth handles user identity and session management, and the application redirects authenticated users into the protected console experience.

## Authorization

RBAC is modeled through `app_role` values such as owner, admin, manager, operator, and viewer. Row-Level Security policies enforce authorization at the database layer for tenant resources.

## Data Protection

Sensitive credential values are represented through encrypted payload references and redacted previews rather than open plaintext storage in generally readable tables.

## Audit Logging

Audit events record module, action, entity, before and after state snapshots, correlation identifiers, and actor context for traceability.

## Input Validation

The project uses Zod schemas and structured TypeScript contracts to validate application data and domain inputs.

## Error Handling

The application includes shared error-state components and route-level handling patterns, while database guards prevent invalid workflow and version transitions.

## Compliance

The architecture emphasizes tenant isolation, least-privilege role modeling, append-only operational records, and secrets handling patterns that support enterprise security expectations.

---

# Database Design

## Overview

The database is organized around multi-tenant platform primitives, operational workflow entities, observability datasets, and integration management tables, all protected by Row-Level Security.

## Core Tables

* organizations and organization_members
* projects and environments
* workflows, workflow_versions, workflow_runs, and workflow_steps
* credentials, credential_versions, and credential_rotation_events
* connectors, connector_bindings, and connector_health_checks
* audit_events, telemetry_events, telemetry_metrics, and telemetry_traces

## Relationships

Organizations are the primary tenant boundary. Projects belong to organizations, environments belong to projects, workflows and operational data are organization-scoped, and connector and credential records can attach at organization, project, or environment scope. Workflow runs link back to workflow definitions and versions, while step records and audit events provide execution detail.

## Indexing Strategy

The schema includes indexes on tenant identifiers, workflow status, audit timestamps, telemetry dimensions, connector bindings, and credential relationships to support operational dashboards, policy checks, and recent-activity queries.

---

# API Overview

## Authentication

Authenticated access is required for protected platform operations, and tenant actions are further constrained by organization membership and role.

## Primary Endpoints

| Endpoint | Purpose |
| -------- | ------- |
| `/` | Public landing page for the shared platform layer |
| `/login` | Authentication entry point |
| `/_app/dashboard` | Tenant operations dashboard |
| `/_app/core` | Core readiness and module registry |
| `/_app/workflows` | Workflow management and execution views |
| `/_app/audit` | Audit activity interface |
| `/_app/connectors` | Connector administration |
| `/_app/secrets` | Secret and credential administration |

## Response Format

The application primarily serves route-based UI experiences backed by typed Supabase data access. Domain data is structured through TypeScript interfaces and Zod schemas for predictable request and response handling.

---

# Installation

## Prerequisites

* Bun
* Node.js-compatible local development environment

## Clone Repository

```bash
git clone <repository-url>
```

## Install Dependencies

```bash
bun install
```

## Configure Environment

Create a `.env` file and add the required environment variables for Supabase, local app execution, and any deployment-specific settings.

## Start Development Server

```bash
bun dev
```

---

# Configuration

Configuration is driven by environment variables, Supabase project settings, authentication configuration, and edge/runtime settings defined by files such as `wrangler.jsonc`, `vite.config.ts`, and `supabase/config.toml`. Any deployment must supply the required Supabase connection and authentication values before the application can run correctly.

---

# Testing

## Unit Tests

No dedicated unit test suite is currently defined in `package.json`; shared module behavior should be validated through targeted future tests as the platform matures.

## Integration Tests

Database-backed and route-level integration behavior is currently validated through application flows, schema constraints, and existing development tooling rather than a standalone automated integration suite.

## Manual Testing

Manual verification should cover authentication, organization switching, dashboard visibility, core readiness, workflow lifecycle operations, and connector or secret administration flows.

## Performance Testing

Performance validation currently relies on build validation, telemetry instrumentation, and operational observation, with room for more formal load and runtime testing in later releases.

---

# Deployment

## Development

Run locally with Bun and Vite while connecting to the appropriate Supabase configuration.

## Staging

Deploy to a cloud or edge-hosted environment with isolated Supabase resources and configuration for pre-production validation.

## Production

Deploy as a hardened shared platform service with controlled environment variables, tenant-aware database policies, and monitoring over workflow, audit, and telemetry paths.

---

# Performance

## Optimization

The application uses a modern Vite-based build, route-based code organization, and indexed database access patterns for operational responsiveness.

## Caching

Client-side query management is handled through TanStack Query, which reduces unnecessary refetching and supports responsive operator workflows.

## Background Processing

Workflow run and step modeling, telemetry capture, and roadmap runtime hardening establish the basis for resilient asynchronous processing.

## Scalability

The platform is designed around reusable shared services, tenant partitioning with RLS, and an edge-compatible deployment model to support growth across multiple products.

---

# Roadmap

## Current Release

Foundation substrate modules, workflow primitives, readiness dashboards, and decision-engine contracts are in place.

## Next Release

Planned work includes product integration spine capabilities such as product registry support, service accounts, scoped API keys, and event ingest.

## Future Vision

Longer-term goals include deeper identity controls, enterprise SSO and SCIM, commercial entitlements, worker runtime hardening, and full extraction of live decision-engine execution into the shared core.

---

# Documentation

| Document | Description |
| -------- | ----------- |
| README | Product overview and operational context |
| `src/lib/core/*` | Decision-engine and readiness module definitions |
| `src/lib/schemas/*` | Domain validation schemas |
| `supabase/migrations/*` | Database schema and security model history |
| `src/routes/*` | Route-driven application workflows |

---

# Screenshots

> Add screenshots, diagrams, dashboards, or workflow illustrations.

---

# Contributing

Contributors should keep changes focused, follow the existing TypeScript and React patterns, preserve tenant-aware security controls, and validate changes with the repository's existing lint and build commands. Pull requests should clearly explain behavioral impact, especially for schema, workflow, security, and shared platform changes.

---

# License

Private. All rights reserved.

---

# Author

**George Rios**

Founder & Software Engineer

**Valtaris Technologies**

---

# Acknowledgements

Thanks to the maintainers of React, TanStack Start, Vite, Tailwind CSS, Supabase, Zod, Zustand, Lucide, and the broader open-source ecosystem that underpins the ValtariOS Core platform.
