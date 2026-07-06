/**
 * ValtariOS Core — Glue Dispatch Client Tests
 *
 * Covers:
 *   1. Successful dispatch returns status="dispatched" with runId
 *   2. X-Glue-Api-Key header is sent
 *   3. correlationId is forwarded in the request body
 *   4. Network failure returns status="failed"
 *   5. Non-2xx HTTP response returns status="failed" with httpStatus
 */

import { describe, it, expect, vi } from "vitest";
import { callGlueExecute } from "../glue-dispatch";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE_ARGS = {
  executeUrl: "https://nucleus.example.com/api/v0/workflows/execute",
  apiKey: "test-glue-key",
  workflowKey: "approval-workflow",
  workflowVersionId: "00000000-0000-0000-0000-000000000002",
  organizationId: "org-nucleus-001",
  subjectId: "claim-xyz-100",
  correlationId: "corr-core-001",
  payload: { amount: 30_000 },
};

function makeFetch(status: number, body: unknown): typeof fetch {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  ) as unknown as typeof fetch;
}

// ── Test 1: Successful dispatch ────────────────────────────────────────────────

describe("callGlueExecute — happy path", () => {
  it("returns status='dispatched' and runId on 201", async () => {
    const fetchFn = makeFetch(201, { runId: "run-abc-001", status: "pending" });
    const result = await callGlueExecute({ ...BASE_ARGS, fetchFn });

    expect(result.status).toBe("dispatched");
    expect(result.runId).toBe("run-abc-001");
    expect(result.httpStatus).toBe(201);
  });

  it("returns status='dispatched' on idempotent 200", async () => {
    const fetchFn = makeFetch(200, { runId: "run-existing", status: "running" });
    const result = await callGlueExecute({ ...BASE_ARGS, fetchFn });

    expect(result.status).toBe("dispatched");
    expect(result.runId).toBe("run-existing");
    expect(result.httpStatus).toBe(200);
  });
});

// ── Test 2: X-Glue-Api-Key header is sent ─────────────────────────────────────

describe("callGlueExecute — auth header", () => {
  it("sends X-Glue-Api-Key header with the configured api key", async () => {
    const fetchFn = makeFetch(201, { runId: "run-001" });
    await callGlueExecute({ ...BASE_ARGS, fetchFn });

    const [, init] = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Glue-Api-Key"]).toBe(BASE_ARGS.apiKey);
  });
});

// ── Test 3: correlationId is preserved in request body ────────────────────────

describe("callGlueExecute — correlationId forwarding", () => {
  it("includes correlationId in the request body", async () => {
    const fetchFn = makeFetch(201, { runId: "run-001" });
    await callGlueExecute({ ...BASE_ARGS, fetchFn });

    const [, init] = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.correlationId).toBe(BASE_ARGS.correlationId);
  });

  it("includes workflowVersionId in the request body when provided", async () => {
    const fetchFn = makeFetch(201, { runId: "run-001" });
    await callGlueExecute({ ...BASE_ARGS, fetchFn });

    const [, init] = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.workflowVersionId).toBe(BASE_ARGS.workflowVersionId);
  });

  it("uses workflowVersion integer when no UUID is provided", async () => {
    const { workflowVersionId: _id, ...argsNoId } = BASE_ARGS;
    const fetchFn = makeFetch(201, { runId: "run-001" });
    await callGlueExecute({ ...argsNoId, workflowVersion: 3, fetchFn });

    const [, init] = (fetchFn as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.workflowVersion).toBe(3);
    expect(body.workflowVersionId).toBeUndefined();
  });
});

// ── Test 4: Network failure returns status="failed" ───────────────────────────

describe("callGlueExecute — network error", () => {
  it("returns status='failed' when fetch throws", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("ECONNREFUSED")) as unknown as typeof fetch;
    const result = await callGlueExecute({ ...BASE_ARGS, fetchFn });

    expect(result.status).toBe("failed");
    expect(result.error).toContain("ECONNREFUSED");
  });
});

// ── Test 5: Non-2xx HTTP response ─────────────────────────────────────────────

describe("callGlueExecute — HTTP error responses", () => {
  it("returns status='failed' with httpStatus when Glue returns 401", async () => {
    const fetchFn = makeFetch(401, { error: "Unauthorized" });
    const result = await callGlueExecute({ ...BASE_ARGS, fetchFn });

    expect(result.status).toBe("failed");
    expect(result.httpStatus).toBe(401);
    expect(result.error).toContain("401");
  });

  it("returns status='failed' with httpStatus when Glue returns 503", async () => {
    const fetchFn = makeFetch(503, { error: "Service Unavailable" });
    const result = await callGlueExecute({ ...BASE_ARGS, fetchFn });

    expect(result.status).toBe("failed");
    expect(result.httpStatus).toBe(503);
  });
});
