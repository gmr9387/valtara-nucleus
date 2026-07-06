/**
 * ValtariOS Glue — Stable Execute API Route Tests
 *
 * Covers:
 *   1. Valid request creates a new workflow run (201)
 *   2. Missing / wrong X-Glue-Api-Key returns 401 (no IO called)
 *   3. Invalid payload returns 400
 *   4. Pinned workflowVersionId is resolved and used
 *   5. Pinned workflowVersion (number) is resolved and used
 *   6. Tenant / organization isolation: workflow not found for wrong org returns 404
 *   7. correlationId is persisted in the run
 *   8. Duplicate correlationId returns existing run (idempotency)
 *   9. Archived workflow returns 404
 *  10. Version not published returns 404
 *  11. First pending step is created when definition has steps
 *  12. No step is created when definition has no steps
 *  13. Response shape: runId, workflowVersionId, status, correlationId
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleExecuteRequest, type GlueExecutionIO } from "../api/execute-handler";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const VALID_API_KEY = "test-glue-api-key-stable";

const WORKFLOW_ID = "00000000-0000-0000-0000-000000000001";
const VERSION_ID = "00000000-0000-0000-0000-000000000002";
const RUN_ID = "00000000-0000-0000-0000-000000000003";
const ORG_ID = "org-nucleus-001";
const CORRELATION_ID = "corr-glue-test-001";

const VALID_PAYLOAD = {
  organizationId: ORG_ID,
  workflowKey: "approval-workflow",
  workflowVersionId: VERSION_ID,
  subjectId: "claim-xyz-100",
  correlationId: CORRELATION_ID,
  payload: { claimId: "xyz-100", amount: 30000 },
};

function makeRequest(options: { key?: string | null; body?: unknown; method?: string }): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.key !== null) {
    headers["x-glue-api-key"] = options.key ?? VALID_API_KEY;
  }
  return new Request("http://localhost/api/v0/workflows/execute", {
    method: options.method ?? "POST",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : JSON.stringify(VALID_PAYLOAD),
  });
}

function makeIO(overrides?: Partial<GlueExecutionIO>): GlueExecutionIO {
  return {
    resolveWorkflow: vi.fn().mockResolvedValue({ id: WORKFLOW_ID, status: "active" }),
    resolveVersion: vi.fn().mockResolvedValue({
      id: VERSION_ID,
      version_number: 1,
      status: "published",
      firstStepKey: "review",
    }),
    findRunByCorrelationId: vi.fn().mockResolvedValue(null),
    createRun: vi.fn().mockResolvedValue({
      id: RUN_ID,
      version_id: VERSION_ID,
      status: "pending",
    }),
    createFirstStep: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  process.env.GLUE_API_KEY = VALID_API_KEY;
});

// ── Test 1: Valid request creates run ─────────────────────────────────────────

describe("POST /api/v0/workflows/execute — happy path", () => {
  it("returns 201 with a valid API key and well-formed payload", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(201);
  });

  it("response body includes runId, workflowVersionId, status, correlationId", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleExecuteRequest(req, io);

    const body = await res.json();
    expect(body).toHaveProperty("runId", RUN_ID);
    expect(body).toHaveProperty("workflowVersionId", VERSION_ID);
    expect(body).toHaveProperty("status", "pending");
    expect(body).toHaveProperty("correlationId", CORRELATION_ID);
  });

  it("calls resolveWorkflow with organizationId and workflowKey", async () => {
    const io = makeIO();
    const req = makeRequest({});
    await handleExecuteRequest(req, io);

    expect(io.resolveWorkflow).toHaveBeenCalledWith(ORG_ID, "approval-workflow");
  });

  it("calls createRun with all required fields including correlationId", async () => {
    const io = makeIO();
    const req = makeRequest({});
    await handleExecuteRequest(req, io);

    expect(io.createRun).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: ORG_ID,
        workflowId: WORKFLOW_ID,
        versionId: VERSION_ID,
        subjectId: "claim-xyz-100",
        correlationId: CORRELATION_ID,
      }),
    );
  });
});

// ── Test 2: Missing / wrong API key returns 401 ───────────────────────────────

describe("POST /api/v0/workflows/execute — auth rejection", () => {
  it("returns 401 when X-Glue-Api-Key header is missing", async () => {
    const io = makeIO();
    const req = makeRequest({ key: null });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when X-Glue-Api-Key is wrong", async () => {
    const io = makeIO();
    const req = makeRequest({ key: "wrong-key" });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(401);
  });

  it("returns 401 when X-Glue-Api-Key is empty string", async () => {
    const io = makeIO();
    const req = makeRequest({ key: "" });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(401);
  });

  it("returns 401 when GLUE_API_KEY env var is not set", async () => {
    delete process.env.GLUE_API_KEY;
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(401);
    process.env.GLUE_API_KEY = VALID_API_KEY;
  });

  it("does NOT call any IO when auth fails", async () => {
    const io = makeIO();
    const req = makeRequest({ key: "bad-key" });
    await handleExecuteRequest(req, io);

    expect(io.resolveWorkflow).not.toHaveBeenCalled();
    expect(io.createRun).not.toHaveBeenCalled();
    expect(io.createFirstStep).not.toHaveBeenCalled();
  });
});

// ── Test 3: Invalid payload returns 400 ──────────────────────────────────────

describe("POST /api/v0/workflows/execute — payload validation", () => {
  it("returns 400 when organizationId is missing", async () => {
    const io = makeIO();
    const { organizationId: _org, ...rest } = VALID_PAYLOAD;
    const req = makeRequest({ body: rest });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Bad Request");
  });

  it("returns 400 when workflowKey is missing", async () => {
    const io = makeIO();
    const { workflowKey: _k, ...rest } = VALID_PAYLOAD;
    const req = makeRequest({ body: rest });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(400);
  });

  it("returns 400 when subjectId is missing", async () => {
    const io = makeIO();
    const { subjectId: _s, ...rest } = VALID_PAYLOAD;
    const req = makeRequest({ body: rest });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(400);
  });

  it("returns 400 when correlationId is missing", async () => {
    const io = makeIO();
    const { correlationId: _c, ...rest } = VALID_PAYLOAD;
    const req = makeRequest({ body: rest });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(400);
  });

  it("returns 400 when payload field is missing", async () => {
    const io = makeIO();
    const { payload: _p, ...rest } = VALID_PAYLOAD;
    const req = makeRequest({ body: rest });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(400);
  });

  it("returns 400 when neither workflowVersionId nor workflowVersion is provided", async () => {
    const io = makeIO();
    const { workflowVersionId: _id, ...rest } = VALID_PAYLOAD;
    const req = makeRequest({ body: rest });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Bad Request");
  });

  it("returns 400 for a non-JSON body", async () => {
    const req = new Request("http://localhost/api/v0/workflows/execute", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "x-glue-api-key": VALID_API_KEY,
      },
      body: "not json",
    });
    const io = makeIO();
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Bad Request");
  });
});

// ── Test 4: Pinned workflowVersionId is resolved ──────────────────────────────

describe("POST /api/v0/workflows/execute — pinned version (by ID)", () => {
  it("resolves version using provided workflowVersionId", async () => {
    const io = makeIO();
    const req = makeRequest({});
    await handleExecuteRequest(req, io);

    expect(io.resolveVersion).toHaveBeenCalledWith(
      WORKFLOW_ID,
      expect.objectContaining({ versionId: VERSION_ID }),
    );
  });

  it("uses the resolved version's ID in the run", async () => {
    const io = makeIO();
    const req = makeRequest({});
    await handleExecuteRequest(req, io);

    expect(io.createRun).toHaveBeenCalledWith(expect.objectContaining({ versionId: VERSION_ID }));
  });
});

// ── Test 5: Pinned workflowVersion (number) is resolved ───────────────────────

describe("POST /api/v0/workflows/execute — pinned version (by number)", () => {
  it("accepts workflowVersion integer as version selector", async () => {
    const { workflowVersionId: _id, ...rest } = VALID_PAYLOAD;
    const body = { ...rest, workflowVersion: 2 };
    const io = makeIO();
    const req = makeRequest({ body });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(201);
    expect(io.resolveVersion).toHaveBeenCalledWith(
      WORKFLOW_ID,
      expect.objectContaining({ versionNumber: 2 }),
    );
  });
});

// ── Test 6: Tenant / organization isolation ────────────────────────────────────

describe("POST /api/v0/workflows/execute — organization isolation", () => {
  it("returns 404 when the workflow does not exist in the given org", async () => {
    const io = makeIO({
      resolveWorkflow: vi.fn().mockResolvedValue(null),
    });
    const req = makeRequest({
      body: { ...VALID_PAYLOAD, organizationId: "org-other-999" },
    });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not Found");
  });

  it("does not create a run when the org does not own the workflow", async () => {
    const io = makeIO({
      resolveWorkflow: vi.fn().mockResolvedValue(null),
    });
    const req = makeRequest({
      body: { ...VALID_PAYLOAD, organizationId: "org-other-999" },
    });
    await handleExecuteRequest(req, io);

    expect(io.createRun).not.toHaveBeenCalled();
  });
});

// ── Test 7: correlationId is persisted ───────────────────────────────────────

describe("POST /api/v0/workflows/execute — correlationId persistence", () => {
  it("passes correlationId to createRun", async () => {
    const io = makeIO();
    const req = makeRequest({});
    await handleExecuteRequest(req, io);

    expect(io.createRun).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: CORRELATION_ID }),
    );
  });

  it("echoes correlationId in the response", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleExecuteRequest(req, io);

    const body = await res.json();
    expect(body.correlationId).toBe(CORRELATION_ID);
  });
});

// ── Test 8: Duplicate correlationId → idempotent 200 ─────────────────────────

describe("POST /api/v0/workflows/execute — idempotency", () => {
  it("returns 200 with the existing run when correlationId matches", async () => {
    const existingRun = {
      id: "existing-run-id",
      version_id: VERSION_ID,
      status: "running",
    };
    const io = makeIO({
      findRunByCorrelationId: vi.fn().mockResolvedValue(existingRun),
    });
    const req = makeRequest({});
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.runId).toBe("existing-run-id");
    expect(body.status).toBe("running");
    expect(body.correlationId).toBe(CORRELATION_ID);
  });

  it("does not call createRun when an existing run is found", async () => {
    const io = makeIO({
      findRunByCorrelationId: vi.fn().mockResolvedValue({
        id: "existing-run-id",
        version_id: VERSION_ID,
        status: "running",
      }),
    });
    const req = makeRequest({});
    await handleExecuteRequest(req, io);

    expect(io.createRun).not.toHaveBeenCalled();
  });
});

// ── Test 9: Archived workflow returns 404 ─────────────────────────────────────

describe("POST /api/v0/workflows/execute — archived workflow", () => {
  it("returns 404 when the workflow is archived", async () => {
    const io = makeIO({
      resolveWorkflow: vi.fn().mockResolvedValue(null),
    });
    const req = makeRequest({});
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(404);
  });
});

// ── Test 10: Version not published returns 404 ────────────────────────────────

describe("POST /api/v0/workflows/execute — unpublished version", () => {
  it("returns 404 when the version is not published", async () => {
    const io = makeIO({
      resolveVersion: vi.fn().mockResolvedValue(null),
    });
    const req = makeRequest({});
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not Found");
  });
});

// ── Test 11: First pending step created when definition has steps ──────────────

describe("POST /api/v0/workflows/execute — step creation", () => {
  it("creates the first pending step when definition has steps", async () => {
    const io = makeIO();
    const req = makeRequest({});
    await handleExecuteRequest(req, io);

    expect(io.createFirstStep).toHaveBeenCalledWith({
      runId: RUN_ID,
      stepKey: "review",
    });
  });

  // ── Test 12: No step when definition has no steps ──────────────────────────

  it("does not create a step when definition has no steps", async () => {
    const io = makeIO({
      resolveVersion: vi.fn().mockResolvedValue({
        id: VERSION_ID,
        version_number: 1,
        status: "published",
        firstStepKey: null,
      }),
    });
    const req = makeRequest({});
    await handleExecuteRequest(req, io);

    expect(io.createFirstStep).not.toHaveBeenCalled();
  });
});

// ── Test 13: Response shape ────────────────────────────────────────────────────

describe("POST /api/v0/workflows/execute — response shape", () => {
  it("response includes only the required envelope fields", async () => {
    const io = makeIO();
    const req = makeRequest({});
    const res = await handleExecuteRequest(req, io);

    const body = await res.json();
    expect(typeof body.runId).toBe("string");
    expect(typeof body.workflowVersionId).toBe("string");
    expect(typeof body.status).toBe("string");
    expect(typeof body.correlationId).toBe("string");
  });

  it("status in response reflects the newly created run status", async () => {
    const io = makeIO({
      createRun: vi.fn().mockResolvedValue({
        id: RUN_ID,
        version_id: VERSION_ID,
        status: "pending",
      }),
    });
    const req = makeRequest({});
    const res = await handleExecuteRequest(req, io);

    const body = await res.json();
    expect(body.status).toBe("pending");
  });
});

// ── Test 14: Same correlationId in different org → separate run ───────────────

describe("POST /api/v0/workflows/execute — cross-org correlationId isolation", () => {
  it("creates a new run when the same correlationId is used under a different org", async () => {
    // For org-B, findRunByCorrelationId returns null (no existing run)
    const io = makeIO({
      findRunByCorrelationId: vi.fn().mockResolvedValue(null),
    });
    const req = makeRequest({
      body: { ...VALID_PAYLOAD, organizationId: "org-other-002" },
    });
    const res = await handleExecuteRequest(req, io);

    // A new run is created, not an idempotent 200
    expect(res.status).toBe(201);
    expect(io.createRun).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-other-002", correlationId: CORRELATION_ID }),
    );
  });

  it("findRunByCorrelationId is called with the correct organizationId", async () => {
    const io = makeIO();
    const req = makeRequest({
      body: { ...VALID_PAYLOAD, organizationId: "org-other-002" },
    });
    await handleExecuteRequest(req, io);

    expect(io.findRunByCorrelationId).toHaveBeenCalledWith("org-other-002", CORRELATION_ID);
  });
});

// ── Test 15: subjectId persists ───────────────────────────────────────────────

describe("POST /api/v0/workflows/execute — subjectId persistence", () => {
  it("passes subjectId to createRun", async () => {
    const io = makeIO();
    const req = makeRequest({ body: { ...VALID_PAYLOAD, subjectId: "subject-abc-001" } });
    await handleExecuteRequest(req, io);

    expect(io.createRun).toHaveBeenCalledWith(
      expect.objectContaining({ subjectId: "subject-abc-001" }),
    );
  });

  it("preserves subjectId value from the request", async () => {
    const customSubjectId = "claim-subject-999";
    const io = makeIO();
    const req = makeRequest({ body: { ...VALID_PAYLOAD, subjectId: customSubjectId } });
    await handleExecuteRequest(req, io);

    const call = (io.createRun as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.subjectId).toBe(customSubjectId);
  });
});

// ── Test 16: payload persists ─────────────────────────────────────────────────

describe("POST /api/v0/workflows/execute — payload persistence", () => {
  it("passes payload to createRun", async () => {
    const customPayload = { claimId: "claim-xyz", amount: 45000, flag: true };
    const io = makeIO();
    const req = makeRequest({ body: { ...VALID_PAYLOAD, payload: customPayload } });
    await handleExecuteRequest(req, io);

    expect(io.createRun).toHaveBeenCalledWith(expect.objectContaining({ payload: customPayload }));
  });

  it("accepts an empty payload object", async () => {
    const io = makeIO();
    const req = makeRequest({ body: { ...VALID_PAYLOAD, payload: {} } });
    const res = await handleExecuteRequest(req, io);

    expect(res.status).toBe(201);
    expect(io.createRun).toHaveBeenCalledWith(expect.objectContaining({ payload: {} }));
  });
});

// ── Test 17: workflowVersionId persists ──────────────────────────────────────

describe("POST /api/v0/workflows/execute — workflowVersionId persistence", () => {
  it("uses the resolved version id in the createRun call", async () => {
    const customVersionId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    const io = makeIO({
      resolveVersion: vi.fn().mockResolvedValue({
        id: customVersionId,
        version_number: 3,
        status: "published",
        firstStepKey: null,
      }),
    });
    const req = makeRequest({ body: { ...VALID_PAYLOAD, workflowVersionId: customVersionId } });
    await handleExecuteRequest(req, io);

    expect(io.createRun).toHaveBeenCalledWith(
      expect.objectContaining({ versionId: customVersionId }),
    );
  });

  it("returns the resolved version id in the response envelope", async () => {
    const customVersionId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    const io = makeIO({
      resolveVersion: vi.fn().mockResolvedValue({
        id: customVersionId,
        version_number: 3,
        status: "published",
        firstStepKey: null,
      }),
      createRun: vi.fn().mockResolvedValue({
        id: RUN_ID,
        version_id: customVersionId,
        status: "pending",
      }),
    });
    const req = makeRequest({ body: { ...VALID_PAYLOAD, workflowVersionId: customVersionId } });
    const res = await handleExecuteRequest(req, io);

    const body = await res.json();
    expect(body.workflowVersionId).toBe(customVersionId);
  });
});
