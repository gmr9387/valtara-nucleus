/**
 * ValtariOS Core — Stable Evaluate API Route Tests
 *
 * Covers:
 *   1. POST /api/v0/evaluate works with a valid API key
 *   2. Invalid / missing API key is rejected with 401
 *   3. Valid DualPay-style payload returns requires_approval
 *   4. Response includes traceId, decision, confidence, and governance
 *   5. Audit and telemetry IO still runs through the route handler
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleEvaluateRequest } from "../api/evaluate-handler";
import type { CoreEvaluationIO } from "../engine";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const VALID_API_KEY = "test-core-api-key-stable";

const DUALPAY_PAYLOAD = {
  organizationId: "org-dualpay-001",
  subjectId: "claim-abc-9999",
  mode: "instant",
  facts: {
    domain: "claims",
    event: "appeal.submit",
    amount: 30_000,
  },
  correlationId: "corr-api-test-001",
};

function makeRequest(options: { key?: string | null; body?: unknown; method?: string }): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.key !== null) {
    headers["x-core-api-key"] = options.key ?? VALID_API_KEY;
  }
  return new Request("http://localhost/api/v0/evaluate", {
    method: options.method ?? "POST",
    headers,
    body:
      options.body !== undefined ? JSON.stringify(options.body) : JSON.stringify(DUALPAY_PAYLOAD),
  });
}

function makeIO(overrides?: Partial<CoreEvaluationIO>): CoreEvaluationIO {
  return {
    writeAudit: vi.fn().mockResolvedValue(undefined),
    writeTelemetry: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// ── Setup: inject CORE_API_KEY env var ────────────────────────────────────────

beforeEach(() => {
  process.env.CORE_API_KEY = VALID_API_KEY;
});

// ── Test 1: POST with valid API key returns 200 ───────────────────────────────

describe("POST /api/v0/evaluate — happy path", () => {
  it("returns 200 with a valid API key and well-formed payload", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toBeDefined();
  });

  it("response body includes decision, confidence, trace, and governance", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    const body = await res.json();
    expect(body).toHaveProperty("decision");
    expect(body).toHaveProperty("confidence");
    expect(body).toHaveProperty("trace");
    expect(body).toHaveProperty("governance");
  });

  it("response includes a non-empty traceId", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    const body = await res.json();
    expect(typeof body.trace.traceId).toBe("string");
    expect(body.trace.traceId.length).toBeGreaterThan(0);
  });
});

// ── Test 2: Invalid / missing API key is rejected ─────────────────────────────

describe("POST /api/v0/evaluate — auth rejection", () => {
  it("returns 401 when X-Core-Api-Key header is missing", async () => {
    const io = makeIO();
    const req = makeRequest({ key: null });
    const res = await handleEvaluateRequest(req, io);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when X-Core-Api-Key is wrong", async () => {
    const io = makeIO();
    const req = makeRequest({ key: "wrong-key" });
    const res = await handleEvaluateRequest(req, io);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when X-Core-Api-Key is empty string", async () => {
    const io = makeIO();
    const req = makeRequest({ key: "" });
    const res = await handleEvaluateRequest(req, io);

    expect(res.status).toBe(401);
  });

  it("returns 401 when CORE_API_KEY env var is not set", async () => {
    delete process.env.CORE_API_KEY;
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    expect(res.status).toBe(401);
    // Restore for other tests
    process.env.CORE_API_KEY = VALID_API_KEY;
  });
});

// ── Test 3: Valid DualPay payload returns requires_approval ───────────────────

describe("POST /api/v0/evaluate — DualPay payload evaluation", () => {
  it("returns requires_approval for a high-value claims appeal", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    const body = await res.json();
    expect(body.decision.decision.outcome).toBe("requires_approval");
  });

  it("decision has severity=high for a claims appeal", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    const body = await res.json();
    expect(body.decision.decision.severity).toBe("high");
  });

  it("confidence score is not zero for a complete payload", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    const body = await res.json();
    expect(body.confidence.score).toBeGreaterThan(0);
  });

  it("governance.auditReady is true for a complete evaluation", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    const body = await res.json();
    expect(body.governance.auditReady).toBe(true);
  });
});

// ── Test 4: Response shape includes all required fields ───────────────────────

describe("POST /api/v0/evaluate — response shape", () => {
  it("decision block includes outcome, confidence, confidenceBand, severity", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    const body = await res.json();
    const d = body.decision.decision;
    expect(typeof d.outcome).toBe("string");
    expect(typeof d.confidence).toBe("number");
    expect(typeof d.confidenceBand).toBe("string");
    expect(typeof d.severity).toBe("string");
  });

  it("trace block includes traceId and evaluations array", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    const body = await res.json();
    expect(typeof body.trace.traceId).toBe("string");
    expect(Array.isArray(body.trace.evaluations)).toBe(true);
  });

  it("governance block includes score, explainable, and auditReady", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);

    const body = await res.json();
    expect(typeof body.governance.score).toBe("number");
    expect(typeof body.governance.explainable).toBe("boolean");
    expect(typeof body.governance.auditReady).toBe("boolean");
  });
});

// ── Test 5: Audit and telemetry IO runs through the handler ──────────────────

describe("POST /api/v0/evaluate — IO invocation", () => {
  it("calls writeAudit and writeTelemetry once per successful evaluation", async () => {
    const io = makeIO();
    const req = makeRequest({});
    await handleEvaluateRequest(req, io);

    // Allow micro-task queue to flush (IO is fire-and-forget)
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(io.writeAudit).toHaveBeenCalledOnce();
    expect(io.writeTelemetry).toHaveBeenCalledOnce();
  });

  it("writeAudit receives traceId, outcome, and callerIdentity=service:dualpay", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleEvaluateRequest(req, io);
    const body = await res.json();

    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(io.writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        traceId: body.trace.traceId,
        outcome: "requires_approval",
        callerIdentity: "service:dualpay",
      }),
    );
  });

  it("does NOT call IO when request is rejected due to bad auth", async () => {
    const io = makeIO();
    const req = makeRequest({ key: "bad-key" });
    await handleEvaluateRequest(req, io);

    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(io.writeAudit).not.toHaveBeenCalled();
    expect(io.writeTelemetry).not.toHaveBeenCalled();
  });
});

// ── Test 6: Bad payload returns 400 ──────────────────────────────────────────

describe("POST /api/v0/evaluate — payload validation", () => {
  it("returns 400 for a payload missing organizationId", async () => {
    const io = makeIO();
    const req = makeRequest({
      body: {
        subjectId: "sub-1",
        mode: "instant",
        facts: {},
      },
    });
    const res = await handleEvaluateRequest(req, io);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Bad Request");
  });

  it("returns 400 for an invalid mode value", async () => {
    const io = makeIO();
    const req = makeRequest({
      body: { ...DUALPAY_PAYLOAD, mode: "not-a-valid-mode" },
    });
    const res = await handleEvaluateRequest(req, io);

    expect(res.status).toBe(400);
  });

  it("returns 400 for a non-JSON body", async () => {
    const req = new Request("http://localhost/api/v0/evaluate", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "x-core-api-key": VALID_API_KEY,
      },
      body: "not json",
    });
    const io = makeIO();
    const res = await handleEvaluateRequest(req, io);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Bad Request");
  });
});
