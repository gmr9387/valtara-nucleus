/**
 * Core v0 Motion — Engine Test Suite
 *
 * Covers:
 *   1. Valid DualPay-style request returns "requires_approval"
 *   2. Missing "amount" fact lowers confidence below full score
 *   3. Unauthenticated M2M key is rejected (validateCoreApiKey)
 *   4. Audit and telemetry IO is invoked per evaluation
 *   5. Response includes a non-empty traceId and the fired rule ID
 */

import { describe, it, expect, vi } from "vitest";
import type { CoreEvaluationRequest } from "../contracts";
import { evaluateRules } from "../evaluator";
import { calculateConfidence } from "../confidence";
import { resolveDecision } from "../decisions";
import { generateTrace } from "../trace";
import { evaluateGovernance } from "../governance";
import { runEvaluation, type CoreEvaluationIO } from "../engine";
import { validateCoreApiKey } from "../m2m-auth";

// ── Fixtures ──────────────────────────────────────────────────────────────

const APPEAL_REQUEST: CoreEvaluationRequest = {
  organizationId: "org-dualpay-001",
  subjectId: "claim-abc-9999",
  mode: "instant",
  facts: {
    domain: "claims",
    event: "appeal.submit",
    amount: 30_000,
  },
  correlationId: "corr-test-001",
};

const LOW_AMOUNT_REQUEST: CoreEvaluationRequest = {
  ...APPEAL_REQUEST,
  facts: {
    domain: "claims",
    event: "appeal.submit",
    amount: 5_000,
  },
};

const NO_AMOUNT_REQUEST: CoreEvaluationRequest = {
  ...APPEAL_REQUEST,
  facts: {
    domain: "claims",
    event: "appeal.submit",
    // amount deliberately omitted
  },
};

const NON_APPEAL_REQUEST: CoreEvaluationRequest = {
  ...APPEAL_REQUEST,
  facts: {
    domain: "claims",
    event: "payment.process",
    amount: 50_000,
  },
};

function makeIO(overrides?: Partial<CoreEvaluationIO>): {
  io: CoreEvaluationIO;
  writeAudit: ReturnType<typeof vi.fn>;
  writeTelemetry: ReturnType<typeof vi.fn>;
  dispatchGlueWorkflow: ReturnType<typeof vi.fn>;
} {
  const writeAudit = vi.fn().mockResolvedValue(undefined);
  const writeTelemetry = vi.fn().mockResolvedValue(undefined);
  const dispatchGlueWorkflow = vi
    .fn()
    .mockResolvedValue({ status: "dispatched", runId: "run-dispatch-001" });
  return {
    io: {
      writeAudit,
      writeTelemetry,
      dispatchGlueWorkflow,
      ...overrides,
    },
    writeAudit,
    writeTelemetry,
    dispatchGlueWorkflow,
  };
}

// ── Test 1: Valid DualPay-style request returns "requires_approval" ────────

describe("evaluateRules — claims appeal rule", () => {
  it("fires and produces requires_approval for domain=claims, appeal event, amount>=25000", () => {
    const { evaluations, candidates } = evaluateRules(APPEAL_REQUEST);

    expect(evaluations).toHaveLength(1);
    const rule = evaluations[0];
    expect(rule.fired).toBe(true);
    expect(rule.ruleId).toBe("claims.appeal.high-value-approval");

    expect(candidates).toHaveLength(1);
    expect(candidates[0].outcome).toBe("requires_approval");
  });

  it("does not fire when amount is below threshold", () => {
    const { evaluations } = evaluateRules(LOW_AMOUNT_REQUEST);
    expect(evaluations[0].fired).toBe(false);
  });

  it("does not fire when event is not appeal-related", () => {
    const { evaluations } = evaluateRules(NON_APPEAL_REQUEST);
    expect(evaluations[0].fired).toBe(false);
  });

  it("resolveDecision returns requires_approval outcome when rule fires", () => {
    const { candidates } = evaluateRules(APPEAL_REQUEST);
    const result = resolveDecision(candidates);
    expect(result.decision.outcome).toBe("requires_approval");
    expect(result.decision.severity).toBe("high");
  });
});

// ── Test 2: Missing "amount" lowers confidence ─────────────────────────────

describe("calculateConfidence — missing facts penalty", () => {
  it("returns high score when all required facts are present", () => {
    const { evaluations } = evaluateRules(APPEAL_REQUEST);
    const result = calculateConfidence(evaluations, APPEAL_REQUEST.facts);

    // Base 0.90, no missing facts → score = 0.90
    expect(result.score).toBeCloseTo(0.9);
    expect(result.missingFacts).toHaveLength(0);
    expect(result.band).toBe("very_high");
  });

  it("lowers confidence when 'amount' is missing", () => {
    const { evaluations } = evaluateRules(NO_AMOUNT_REQUEST);
    const fullResult = calculateConfidence(evaluations, APPEAL_REQUEST.facts);
    const missingResult = calculateConfidence(evaluations, NO_AMOUNT_REQUEST.facts);

    expect(missingResult.score).toBeLessThan(fullResult.score);
    expect(missingResult.missingFacts).toContain("amount");
    // 0.90 - 1*0.25 = 0.65 → band "high"
    expect(missingResult.score).toBeCloseTo(0.65);
    expect(missingResult.band).toBe("high");
  });

  it("sets dataQuality to 0.5 when facts are missing", () => {
    const { evaluations } = evaluateRules(NO_AMOUNT_REQUEST);
    const result = calculateConfidence(evaluations, NO_AMOUNT_REQUEST.facts);
    expect(result.dataQuality).toBe(0.5);
  });
});

// ── Test 3: Unauthenticated M2M request is rejected ──────────────────────

describe("validateCoreApiKey — M2M auth", () => {
  it("rejects when CORE_API_KEY env var is not set", () => {
    expect(validateCoreApiKey("any-key", undefined)).toBe(false);
  });

  it("rejects when provided key is null", () => {
    expect(validateCoreApiKey(null, "correct-key")).toBe(false);
  });

  it("rejects when provided key is empty string", () => {
    expect(validateCoreApiKey("", "correct-key")).toBe(false);
  });

  it("rejects when provided key is wrong", () => {
    expect(validateCoreApiKey("wrong-key", "correct-key")).toBe(false);
  });

  it("rejects when key lengths differ (timing guard)", () => {
    expect(validateCoreApiKey("short", "longer-key")).toBe(false);
  });

  it("accepts when key matches exactly", () => {
    expect(validateCoreApiKey("correct-key", "correct-key")).toBe(true);
  });
});

// ── Test 4: Audit and telemetry IO is invoked ────────────────────────────

describe("runEvaluation — IO invocation", () => {
  it("calls writeAudit and writeTelemetry for a valid request", async () => {
    const { io, writeAudit, writeTelemetry } = makeIO();

    await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);

    // Allow micro-task queue to flush (IO is fire-and-forget)
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(writeAudit).toHaveBeenCalledOnce();
    expect(writeTelemetry).toHaveBeenCalledOnce();
  });

  it("passes traceId, outcome, and callerIdentity to writeAudit", async () => {
    const { io, writeAudit } = makeIO();

    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        traceId: response.trace.traceId,
        outcome: "requires_approval",
        callerIdentity: "service:dualpay",
      }),
    );
  });

  it("does not throw when IO callbacks reject", async () => {
    const { io } = makeIO({
      writeAudit: vi.fn().mockRejectedValue(new Error("db down")),
      writeTelemetry: vi.fn().mockRejectedValue(new Error("tele down")),
    });

    // runEvaluation should still resolve successfully
    await expect(runEvaluation(APPEAL_REQUEST, "service:dualpay", io)).resolves.toBeDefined();
  });
});

// ── Test 5: Response includes traceId and fired rule ─────────────────────

describe("runEvaluation — response structure", () => {
  it("returns a non-empty traceId", async () => {
    const { io } = makeIO();
    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);
    expect(response.trace.traceId).toBeTruthy();
    expect(response.trace.traceId.length).toBeGreaterThan(0);
  });

  it("includes the fired rule in trace evaluations", async () => {
    const { io } = makeIO();
    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);

    const fired = response.trace.evaluations.filter((e) => e.fired);
    expect(fired).toHaveLength(1);
    expect(fired[0].ruleId).toBe("claims.appeal.high-value-approval");
  });

  it("includes TraceRecords with step matching the rule ID", async () => {
    const { io } = makeIO();
    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);

    expect(response.trace.records.length).toBeGreaterThan(0);
    expect(response.trace.records[0].step).toBe("rule:claims.appeal.high-value-approval");
  });

  it("sets auditReady=true for a complete evaluation", async () => {
    const { io } = makeIO();
    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);
    expect(response.governance.auditReady).toBe(true);
    expect(response.governance.explainable).toBe(true);
  });

  it("returns requires_approval decision for a valid DualPay-style appeal", async () => {
    const { io } = makeIO();
    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);
    expect(response.decision.decision.outcome).toBe("requires_approval");
  });
});

// ── Bonus: generateTrace ──────────────────────────────────────────────────

describe("generateTrace", () => {
  it("generates a unique traceId per call", () => {
    const { evaluations } = evaluateRules(APPEAL_REQUEST);
    const t1 = generateTrace(evaluations);
    const t2 = generateTrace(evaluations);
    expect(t1.traceId).not.toBe(t2.traceId);
  });
});

// ── Bonus: evaluateGovernance ─────────────────────────────────────────────

describe("evaluateGovernance", () => {
  it("reports auditReady=false for an empty trace", () => {
    const emptyTrace = { traceId: "", evaluations: [], records: [] };
    const result = evaluateGovernance(emptyTrace);
    expect(result.auditReady).toBe(false);
  });

  it("reports auditReady=true when trace and evaluations are present", () => {
    const { evaluations } = evaluateRules(APPEAL_REQUEST);
    const trace = generateTrace(evaluations);
    const result = evaluateGovernance(trace);
    expect(result.auditReady).toBe(true);
  });
});

// ── Test 6: Glue dispatch — requires_approval triggers dispatch ───────────

describe("runEvaluation — Glue dispatch on requires_approval", () => {
  it("calls dispatchGlueWorkflow when outcome is requires_approval", async () => {
    const { io, dispatchGlueWorkflow } = makeIO();
    await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);

    // Dispatch is awaited before returning, so no micro-task flush needed.
    expect(dispatchGlueWorkflow).toHaveBeenCalledOnce();
  });

  it("passes organizationId and subjectId to dispatchGlueWorkflow", async () => {
    const { io, dispatchGlueWorkflow } = makeIO();
    await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);

    expect(dispatchGlueWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: APPEAL_REQUEST.organizationId,
        subjectId: APPEAL_REQUEST.subjectId,
      }),
    );
  });

  it("uses the correlationId from the request", async () => {
    const { io, dispatchGlueWorkflow } = makeIO();
    await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);

    expect(dispatchGlueWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: APPEAL_REQUEST.correlationId }),
    );
  });

  it("falls back to traceId when correlationId is absent", async () => {
    const { correlationId: _c, ...requestWithoutCorr } = APPEAL_REQUEST;
    const { io, dispatchGlueWorkflow } = makeIO();
    const response = await runEvaluation(
      { ...requestWithoutCorr, correlationId: undefined },
      "service:dualpay",
      io,
    );

    expect(dispatchGlueWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: response.trace.traceId }),
    );
  });

  it("includes dispatch result in response envelope", async () => {
    const { io } = makeIO();
    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);

    expect(response.dispatch).toBeDefined();
    expect(response.dispatch?.status).toBe("dispatched");
    expect(response.dispatch?.runId).toBe("run-dispatch-001");
  });

  it("passes facts as payload to dispatchGlueWorkflow", async () => {
    const { io, dispatchGlueWorkflow } = makeIO();
    await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);

    expect(dispatchGlueWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          domain: "claims",
          event: "appeal.submit",
          amount: 30_000,
        }),
      }),
    );
  });
});

// ── Test 7: Glue dispatch — approve does NOT trigger dispatch ────────────────

describe("runEvaluation — Glue dispatch skipped for non-requires_approval", () => {
  it("does NOT call dispatchGlueWorkflow when outcome is not requires_approval (low amount)", async () => {
    const { io, dispatchGlueWorkflow } = makeIO();
    await runEvaluation(LOW_AMOUNT_REQUEST, "service:dualpay", io);

    // LOW_AMOUNT_REQUEST fires no rules → outcome = "unresolved"
    expect(dispatchGlueWorkflow).not.toHaveBeenCalled();
  });

  it("does NOT call dispatchGlueWorkflow for a non-appeal event", async () => {
    const { io, dispatchGlueWorkflow } = makeIO();
    await runEvaluation(NON_APPEAL_REQUEST, "service:dualpay", io);

    expect(dispatchGlueWorkflow).not.toHaveBeenCalled();
  });

  it("dispatch field is undefined in the response when no dispatch occurred", async () => {
    const { io } = makeIO();
    const response = await runEvaluation(LOW_AMOUNT_REQUEST, "service:dualpay", io);

    expect(response.dispatch).toBeUndefined();
  });
});

// ── Test 8: Glue failure does not fail Core response ────────────────────────

describe("runEvaluation — Glue dispatch failure is best-effort", () => {
  it("still resolves successfully when dispatchGlueWorkflow rejects", async () => {
    const { io } = makeIO({
      dispatchGlueWorkflow: vi.fn().mockRejectedValue(new Error("Glue is down")),
    });

    await expect(runEvaluation(APPEAL_REQUEST, "service:dualpay", io)).resolves.toBeDefined();
  });

  it("sets dispatch.status = 'failed' when dispatchGlueWorkflow rejects", async () => {
    const { io } = makeIO({
      dispatchGlueWorkflow: vi.fn().mockRejectedValue(new Error("Glue is down")),
    });

    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);
    expect(response.dispatch?.status).toBe("failed");
    expect(response.dispatch?.error).toContain("Glue is down");
  });

  it("still resolves successfully when dispatchGlueWorkflow returns status='failed'", async () => {
    const { io } = makeIO({
      dispatchGlueWorkflow: vi.fn().mockResolvedValue({ status: "failed", error: "HTTP 503" }),
    });

    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);
    expect(response.dispatch?.status).toBe("failed");
    expect(response.decision.decision.outcome).toBe("requires_approval");
  });

  it("dispatch status 'skipped' does not affect the decision outcome", async () => {
    const { io } = makeIO({
      dispatchGlueWorkflow: vi.fn().mockResolvedValue({ status: "skipped" }),
    });

    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);
    expect(response.decision.decision.outcome).toBe("requires_approval");
    expect(response.dispatch?.status).toBe("skipped");
  });
});

// ── Test 9: No dispatchGlueWorkflow in IO — dispatch is silently skipped ────

describe("runEvaluation — dispatch omitted when IO has no dispatchGlueWorkflow", () => {
  it("resolves without dispatch field when dispatchGlueWorkflow is not in IO", async () => {
    const io: CoreEvaluationIO = {
      writeAudit: vi.fn().mockResolvedValue(undefined),
      writeTelemetry: vi.fn().mockResolvedValue(undefined),
      // No dispatchGlueWorkflow
    };

    const response = await runEvaluation(APPEAL_REQUEST, "service:dualpay", io);
    expect(response.dispatch).toBeUndefined();
    expect(response.decision.decision.outcome).toBe("requires_approval");
  });
});
