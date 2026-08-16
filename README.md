# ValtariOS Core

> Shared platform control plane for multi-tenant operations, workflow governance, integrations, telemetry, and common platform capabilities across the ValtariOS product suite.

ValtariOS Core is the shared platform layer for the ValtariOS ecosystem. It brings tenant-aware identity, organization and project management, connector and credential administration, workflow management, auditability, telemetry, and decision-engine foundations into a common control plane.

The project is structured as a modular monolith backed by Supabase and PostgreSQL. It is designed to provide reusable platform capabilities that other ValtariOS products can build upon without independently reimplementing core infrastructure concerns.

This repository represents an active platform implementation. Some runtime, testing, enterprise identity, and deployment capabilities remain under development or roadmap.

---

## Table of Contents

- [Overview](#overview)
- [Why This Exists](#why-this-exists)
- [Core Capabilities](#core-capabilities)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core Workflows](#core-workflows)
- [Security](#security)
- [Database Design](#database-design)
- [API and Application Routes](#api-and-application-routes)
- [Installation](#installation)
- [Configuration](#configuration)
- [Testing and Verification](#testing-and-verification)
- [Deployment](#deployment)
- [Performance and Scalability](#performance-and-scalability)
- [Current Status](#current-status)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Documentation](#documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

# Overview

ValtariOS Core provides shared infrastructure for the ValtariOS product suite.

The platform currently brings together:

- organization and tenant management;
- projects and environments;
- role-based access;
- workflow definitions and versions;
- workflow run tracking;
- connector administration;
- credential and secret metadata;
- audit events;
- telemetry events, metrics, and traces;
- readiness and operational dashboards;
- decision-engine contracts;
- governance and replay-oriented foundations.

The primary goal is to establish a common platform boundary so individual ValtariOS products can consume shared capabilities instead of creating separate implementations for identity, tenancy, workflow state, integrations, and operational visibility.

---

# Why This Exists

## Business Problem

As a software portfolio grows, individual products often begin implementing the same foundational capabilities independently.

Identity, tenant management, authorization, integrations, workflow state, audit logging, and operational monitoring can become fragmented across products.

That creates duplicated infrastructure, inconsistent behavior, and additional maintenance requirements.

ValtariOS Core explores a shared platform approach where those concerns are centralized behind a common control plane.

## Technical Challenge

A shared platform needs to maintain clear boundaries between tenants while supporting:

- role-aware authorization;
- organization, project, and environment hierarchies;
- reusable workflow primitives;
- connector administration;
- credential lifecycle metadata;
- auditability;
- telemetry;
- predictable state transitions;
- reusable contracts for future decision engines.

The platform also needs to evolve without forcing every product built on top of it to independently recreate the same foundation.

## Solution

ValtariOS Core provides a Supabase/PostgreSQL-backed control plane with:

- tenant-scoped data;
- database-enforced RLS;
- role-aware access;
- workflow definitions and versions;
- operational run tracking;
- connector and credential administration;
- audit and telemetry datasets;
- shared TypeScript contracts;
- decision-engine foundations.

The current implementation focuses on establishing the shared substrate. Additional runtime and enterprise capabilities are identified separately as future work.

---

# Core Capabilities

## Tenant and Organization Management

- Organization creation
- Organization membership
- Role assignment
- Project management
- Environment management
- Tenant-scoped operational views

## Workflow Management

- Workflow definitions
- Workflow versioning
- Workflow publishing
- Workflow run tracking
- Step-level state
- Workflow state guards
- Operational workflow monitoring

## Connector Management

- Connector catalog
- Connector versions
- Connector capabilities
- Connector bindings
- Connector health checks
- Organization, project, and environment-level integration scope

## Credential Management

- Credential records
- Credential versions
- Credential rotation events
- Redacted credential metadata
- Controlled credential references

## Audit and Telemetry

- Organization-scoped audit events
- Correlation identifiers
- Actor context
- Before/after state information
- Telemetry events
- Telemetry metrics
- Telemetry traces
- Operational readiness views

## Decision Engine Foundations

The platform includes shared contracts for:

- evaluation;
- confidence;
- governance;
- traceability;
- replay;
- decision-oriented automation.

These modules establish reusable interfaces for future rules-driven and AI-assisted decision workflows. They do not represent a claim that every decision-engine capability is currently operating as a complete production runtime.

---

# Architecture

## High-Level Architecture

The platform consists of four primary layers:

    ┌──────────────────────────────────────────────────────────┐
    │                    ValtariOS Core UI                    │
    │                                                          │
    │  Dashboard · Core · Workflows · Audit · Connectors      │
    │  Secrets · Governance · Operations                       │
    └──────────────────────────┬───────────────────────────────┘
                               │
                               ▼
    ┌──────────────────────────────────────────────────────────┐
    │                 Shared TypeScript Layer                  │
    │                                                          │
    │  Core Modules · Schemas · Workflow Contracts             │
    │  Decision Contracts · Shared Application Logic           │
    └──────────────────────────┬───────────────────────────────┘
                               │
                               ▼
    ┌──────────────────────────────────────────────────────────┐
    │                    Supabase Platform                     │
    │                                                          │
    │  PostgreSQL · Auth · RLS · Storage                       │
    │                                                          │
    │  Organizations · Projects · Workflows · Credentials      │
    │  Connectors · Audit · Telemetry                          │
    └──────────────────────────┬───────────────────────────────┘
                               │
                               ▼
    ┌──────────────────────────────────────────────────────────┐
    │              Future Runtime / Product Layer              │
    │                                                          │
    │  Worker Runtime · Product Integrations · Decision       │
    │  Execution · Additional ValtariOS Services              │
    └──────────────────────────────────────────────────────────┘

---

## System Components

### Frontend

React 19 with TanStack Start provides the operator-facing application.

Current areas include:

- landing;
- authentication;
- dashboard;
- core readiness;
- workflows;
- audit;
- connectors;
- secrets;
- governance.

### Application Layer

Shared TypeScript modules under `src/lib` provide common application logic, schemas, core modules, and workflow-oriented contracts.

### Database

PostgreSQL through Supabase stores:

- organizations;
- organization members;
- projects;
- environments;
- workflows;
- workflow versions;
- workflow runs;
- workflow steps;
- credentials;
- credential versions;
- credential rotation events;
- connectors;
- connector bindings;
- connector health checks;
- audit events;
- telemetry events;
- telemetry metrics;
- telemetry traces.

### Authentication

Supabase Auth manages user identity and sessions.

Application-level permission checks are paired with database authorization through tenant membership and RLS policies.

### Storage and Credential References

Credential information is represented through versioned and redacted metadata with storage references rather than exposing sensitive material through broadly readable application tables.

### Decision Engine

Decision-engine modules define reusable contracts for evaluation, confidence, governance, replay, and traceability.

These contracts provide a foundation for future decision-oriented capabilities across ValtariOS products.

### Runtime Foundations

Workflow runs, workflow steps, telemetry, and state guards establish the data model needed for asynchronous execution and recovery-oriented runtime behavior.

A more complete worker runtime remains future work.

### Integrations

Connector records support external services across categories including:

- AI;
- messaging;
- payments;
- social;
- databases;
- other external services.

The connector model is intended to allow additional ValtariOS products to consume shared integration infrastructure.

---

# Data Flow

A typical platform interaction follows this pattern:

    User
      │
      ▼
    Supabase Auth
      │
      ▼
    ValtariOS Core Console
      │
      ├── Organization / Project / Environment
      │
      ├── Workflow Management
      │
      ├── Connector Administration
      │
      └── Credential Administration
      │
      ▼
    Shared TypeScript Modules
      │
      ▼
    Supabase / PostgreSQL
      │
      ├── RLS authorization
      ├── Audit records
      ├── Telemetry
      ├── Workflow state
      └── Integration metadata
      │
      ▼
    Future Product / Runtime Consumers

The database remains the primary source of persisted platform state.

---

# Technology Stack

## Frontend

- React 19
- TypeScript
- TanStack Start
- Tailwind CSS v4

## Backend and Data

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- TypeScript application modules

## Infrastructure

- Vite
- Cloudflare-compatible runtime configuration
- Supabase-managed database and authentication services
- Supabase migrations

## Validation and Development

- ESLint
- Prettier
- TypeScript
- Vite build tooling

## AI and Decision Systems

The current platform provides decision-engine contracts and AI-oriented connector categories.

The repository does not represent every AI capability as a completed production decision engine.

---

# Project Structure

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
    │
    ├── supabase/
    │   ├── config.toml
    │   └── migrations/
    │
    ├── public/
    ├── README.md
    ├── package.json
    ├── bun.lock
    ├── components.json
    ├── eslint.config.js
    ├── tsconfig.json
    ├── vite.config.ts
    └── wrangler.jsonc

---

# Core Workflows

## 1. Tenant Setup

### Purpose

Establish an organization and its initial project and environment structure.

### Process

A user authenticates, creates an organization, is established as an owner, and provisions projects and environments within that organization.

### Result

A tenant-scoped workspace exists with organization membership and role-aware access controls.

---

## 2. Organization Membership

### Purpose

Manage access to shared platform resources.

### Process

Organization members are associated with roles such as:

- owner;
- admin;
- manager;
- operator;
- viewer.

Database policies use organization membership and role information to constrain access.

### Result

Platform resources remain scoped to the organization and the permissions associated with the authenticated member.

---

## 3. Connector and Credential Administration

### Purpose

Manage external integration metadata and credential lifecycle information.

### Process

Administrators register credentials, maintain credential versions and rotation events, configure connector bindings, and review connector health information.

### Result

External integrations can be managed from a common platform layer rather than independently inside every product.

---

## 4. Workflow Management

### Purpose

Create and manage reusable workflows.

### Process

Managers define workflow structures, create versions, publish workflow definitions, and initiate workflow runs.

Workflow records track lifecycle state and individual steps.

### Result

Products have a shared workflow representation that can be extended as runtime capabilities mature.

---

## 5. Audit and Telemetry

### Purpose

Provide operational visibility into platform activity.

### Process

Platform actions generate audit and telemetry records containing relevant actor, organization, entity, timestamp, and correlation information.

### Result

Operators can inspect platform activity through centralized audit and telemetry views.

---

## 6. Decision-Engine Foundations

### Purpose

Provide shared contracts for future rules-driven and AI-assisted decision workflows.

### Process

Decision modules define evaluation, confidence, governance, trace, and replay-oriented structures.

### Result

Products can build on a common decision model rather than inventing separate interfaces for every product.

---

# Security

## Authentication

Supabase Auth provides user identity and session management.

Protected application routes require authentication before users can access the operational console.

## Authorization

The platform uses role-aware authorization combined with PostgreSQL Row-Level Security.

Current role concepts include:

- owner;
- admin;
- manager;
- operator;
- viewer.

The database remains an important authorization boundary rather than relying exclusively on UI controls.

## Multi-Tenant Isolation

Organizations represent the primary tenant boundary.

Resources such as:

- projects;
- environments;
- workflows;
- credentials;
- connectors;
- audit events;
- telemetry

are associated with organizational scope.

RLS policies are used to constrain access according to authenticated organization membership and role.

## Credential Handling

Credential records are represented through controlled metadata, versioning, rotation information, and references rather than exposing sensitive values through generally readable tables.

The repository does not claim that this architecture alone constitutes a complete secrets-management or compliance certification.

## Audit Logging

Audit events capture operational context including:

- module;
- action;
- entity;
- actor;
- organization;
- correlation identifiers;
- before/after state information.

These records provide an audit-oriented history of platform activity.

## Input Validation

Zod schemas and TypeScript contracts are used to validate application and domain data.

Database constraints and state guards provide additional protection at the persistence layer.

## Workflow State Protection

Workflow and version state transitions include database and application-level guards intended to prevent invalid lifecycle changes.

---

# Database Design

## Overview

The database is organized around shared platform primitives and operational datasets.

Organizations provide the primary tenant boundary.

Projects and environments provide additional structure for product and deployment scope.

Workflows, connectors, credentials, audit records, and telemetry build on those platform relationships.

## Core Tables

- `organizations`
- `organization_members`
- `projects`
- `environments`
- `workflows`
- `workflow_versions`
- `workflow_runs`
- `workflow_steps`
- `credentials`
- `credential_versions`
- `credential_rotation_events`
- `connectors`
- `connector_bindings`
- `connector_health_checks`
- `audit_events`
- `telemetry_events`
- `telemetry_metrics`
- `telemetry_traces`

## Relationships

The primary hierarchy is:

    Organization
        │
        ├── Members
        │
        ├── Projects
        │      │
        │      └── Environments
        │
        ├── Workflows
        │      │
        │      ├── Workflow Versions
        │      └── Workflow Runs
        │             │
        │             └── Workflow Steps
        │
        ├── Connectors
        │      │
        │      └── Connector Bindings
        │
        └── Credentials
               │
               ├── Credential Versions
               └── Rotation Events

Audit and telemetry datasets provide cross-cutting operational visibility.

## Indexing

The schema includes indexes around tenant identifiers, workflow state, audit timestamps, telemetry dimensions, connector bindings, and credential relationships.

These indexes support common operational and tenant-scoped access patterns.

---

# API and Application Routes

## Authentication

Authenticated access is required for protected platform operations.

Tenant actions are further constrained by organization membership and role.

## Current Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/login` | Authentication entry point |
| `/_app/dashboard` | Tenant operations dashboard |
| `/_app/core` | Core readiness and module registry |
| `/_app/workflows` | Workflow management and execution views |
| `/_app/audit` | Audit activity interface |
| `/_app/connectors` | Connector administration |
| `/_app/secrets` | Credential administration |

## API Direction

The current application is primarily route-driven and backed by typed Supabase data access.

A broader public API surface under `/api/public/` is part of the platform's longer-term direction rather than being presented here as a completed public API product.

---

# Installation

## Prerequisites

- Bun
- Node.js-compatible development environment
- Access to a Supabase project

## Clone Repository

    git clone <repository-url>

## Install Dependencies

    bun install

## Configure Environment

Create a `.env` file containing the required Supabase and application configuration.

## Start Development Server

    bun dev

---

# Configuration

Configuration is driven through environment variables and project configuration files including:

- `.env`
- `vite.config.ts`
- `supabase/config.toml`
- `wrangler.jsonc`

The application requires the appropriate Supabase project and authentication configuration before database-backed functionality can operate correctly.

Do not commit private credentials or service-role secrets to the repository.

---

# Testing and Verification

## Current Test Position

The repository does not currently define a dedicated automated unit-test suite in `package.json`.

This is an important current limitation and is intentionally documented rather than presented as broader test coverage than exists.

## Application Validation

Current validation can include:

- TypeScript/build validation;
- linting;
- manual application flows;
- database schema behavior;
- authentication flows;
- RLS behavior;
- workflow state transitions.

## Manual Verification

Representative verification should include:

1. Authenticate a user.
2. Create or access an organization.
3. Confirm organization membership and role behavior.
4. Create a project.
5. Create an environment.
6. Create and manage workflow definitions.
7. Create workflow versions.
8. Verify publishing and state protections.
9. Configure connector metadata.
10. Review credential version and rotation records.
11. Inspect audit activity.
12. Inspect telemetry records.
13. Verify users cannot access resources outside their authorized organization.

## Integration Testing

The repository does not currently claim a comprehensive standalone automated integration-test suite.

Additional automated coverage is appropriate as the shared platform expands.

## Performance Testing

Formal production-scale benchmarks have not been established.

Performance work remains an area for future validation.

---

# Deployment

## Development

Run the application locally using Bun and the configured Supabase environment.

    bun dev

## Build

    bun run build

## Lint

    bun run lint

## Staging

A staging deployment should use isolated Supabase resources and environment-specific configuration before being considered for broader operational use.

## Production

The repository contains configuration and architecture suitable for continued deployment development, but this project does not claim to be a commercially deployed production platform.

Production deployment would require additional validation around:

- database security;
- authentication;
- secrets management;
- monitoring;
- backups;
- runtime execution;
- load;
- incident handling;
- compliance requirements appropriate to the deployment.

---

# Performance and Scalability

## Current Position

The platform uses:

- indexed tenant-scoped database access;
- TanStack Query for client-side query management;
- modular application boundaries;
- Supabase/PostgreSQL persistence;
- reusable shared platform modules.

These characteristics provide a foundation for continued scaling work.

## What Has Not Been Established

The project does not currently claim:

- a specific throughput target;
- a production latency SLA;
- a verified concurrent-user limit;
- formal load-test results;
- multi-region execution;
- production-scale worker capacity.

Those claims should be established through measurement rather than architecture assumptions.

## Future Runtime Scaling

Future work can introduce:

- dedicated workers;
- queue processing;
- background execution;
- stronger telemetry;
- distributed tracing;
- scaling controls;
- additional runtime isolation.

---

# Current Status

ValtariOS Core currently provides the shared platform foundation for the ValtariOS ecosystem.

### Implemented Foundations

- Multi-tenant organization model
- Organization membership
- Role model
- Project management
- Environment management
- Workflow definitions
- Workflow versioning
- Workflow run and step models
- Connector catalog
- Connector bindings
- Credential versioning
- Credential rotation records
- Audit datasets
- Telemetry datasets
- Core readiness views
- Decision-engine contracts
- Supabase/PostgreSQL integration
- RLS-based tenant authorization

### Developing / Expanding

- Broader automated test coverage
- Runtime worker execution
- Product integration spine
- Public API surface
- Advanced identity controls
- Enterprise identity integrations
- Deeper decision-engine execution

---

# Known Limitations

The following limitations are intentionally documented.

## Automated Test Coverage

There is currently no dedicated unit-test suite defined in `package.json`.

## Integration Coverage

The repository does not currently claim a comprehensive standalone automated integration-test suite.

## Runtime Execution

Workflow persistence and state modeling exist, but a fully hardened worker runtime remains future work.

## Public API

The platform has a direction toward a public API surface, but the current repository should not be interpreted as a completed public API product.

## Enterprise Identity

SSO and SCIM are roadmap capabilities.

## Performance

Formal load testing and published performance baselines have not been completed.

## Multi-Region

Multi-region execution and enforcement remain future work.

## Compliance

The architecture includes security-oriented controls such as RLS, role-aware access, audit records, and credential-handling patterns.

This repository does not claim:

- HIPAA certification;
- SOC 2 certification;
- independent security certification;
- independent compliance audit;
- production authorization for regulated workloads.

Any regulated deployment would require its own security, legal, privacy, compliance, and operational assessment.

---

# Roadmap

## Near Term

- Expand automated unit and integration testing.
- Strengthen workflow runtime validation.
- Continue improving platform readiness checks.
- Expand connector lifecycle capabilities.
- Improve operational telemetry.

## Product Integration Spine

Planned capabilities include:

- product registry;
- service accounts;
- scoped API keys;
- event ingestion;
- shared product-to-core contracts.

## Runtime

Future work includes:

- dedicated worker execution;
- durable background processing;
- stronger retry and recovery semantics;
- runtime health monitoring;
- queue and execution telemetry.

## Identity and Access

Future capabilities include:

- SSO;
- SCIM;
- stronger authentication controls;
- expanded service-account management;
- more granular API authorization.

## Decision Engine

Future work includes:

- live decision-engine execution;
- expanded governance policies;
- richer confidence handling;
- decision replay;
- AI-assisted workflows where appropriate.

## Platform Expansion

Longer-term development may include:

- commercial entitlements;
- broader product integration;
- stronger observability;
- distributed tracing;
- regional execution controls;
- additional shared ValtariOS services.

---

# Documentation

| Resource | Purpose |
| --- | --- |
| `README.md` | Platform overview and current capabilities |
| `src/lib/core/*` | Core platform and decision-engine modules |
| `src/lib/schemas/*` | Domain validation schemas |
| `src/lib/workflows/*` | Workflow-oriented modules |
| `supabase/migrations/*` | Database schema and security history |
| `src/routes/*` | Application routes and platform workflows |

---

# Screenshots

Screenshots and architecture diagrams can be added as the visual demonstration package is finalized.

The primary technical evidence remains the repository source, migrations, application structure, and documented implementation status.

---

# Contributing

Contributors should:

1. Keep changes focused.
2. Follow the existing TypeScript and React patterns.
3. Preserve tenant-aware authorization.
4. Avoid weakening RLS policies to simplify application behavior.
5. Validate schema changes carefully.
6. Add automated tests as shared modules mature.
7. Document behavioral changes affecting workflows, security, integrations, or platform contracts.
8. Use pull requests for reviewable changes.

Before submitting a change, run the applicable repository validation commands, including:

    bun run lint
    bun run build

Additional tests should be added as the platform's automated verification layer expands.

---

# License

Private. All rights reserved.

---

# Author

**George Rios**

Founder & Software Engineer

**Valtaris Technologies**

ValtariOS Core is an independent engineering project focused on shared platform architecture, multi-tenant application infrastructure, workflow systems, integrations, telemetry, and reusable decision-engine foundations.
