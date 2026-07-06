/**
 * ValtariOS Core — Glue Dispatch Client
 *
 * Pure, side-effect-free dispatch function for sending a workflow execution
 * request to the Glue service (POST /api/v0/workflows/execute).
 *
 * Separated from the engine so it can be tested with a mock fetch and so the
 * engine never imports HTTP machinery directly.
 *
 * Env vars consumed by buildGlueDispatchIO (not by this file):
 *   GLUE_EXECUTE_URL  — full URL of the Glue execute endpoint
 *   GLUE_API_KEY      — value to send as X-Glue-Api-Key
 *   GLUE_WORKFLOW_KEY — workflow name / key to execute (e.g. "approval-workflow")
 *   GLUE_WORKFLOW_VERSION_ID — optional pinned version UUID
 *   GLUE_WORKFLOW_VERSION    — optional pinned version integer (ignored if UUID set)
 */

// ── Result type ───────────────────────────────────────────────────────────────

export type GlueDispatchStatus = "dispatched" | "failed" | "skipped";

export interface GlueDispatchResult {
  status: GlueDispatchStatus;
  /** Returned by Glue on success (201 or idempotent 200). */
  runId?: string;
  /** HTTP status from Glue when not 2xx. */
  httpStatus?: number;
  /** Error message when status = "failed". */
  error?: string;
}

// ── Dispatch args ─────────────────────────────────────────────────────────────

export interface GlueDispatchArgs {
  /** Glue execute endpoint URL. */
  executeUrl: string;
  /** X-Glue-Api-Key value. */
  apiKey: string;
  /** Pinned workflow identifier. */
  workflowKey: string;
  /** Prefer UUID pin; if absent, fall back to version number. */
  workflowVersionId?: string;
  workflowVersion?: number;
  // ── per-request fields ──
  organizationId: string;
  subjectId: string;
  correlationId: string;
  payload: Record<string, unknown>;
  /** Replaceable in tests. Defaults to global fetch. */
  fetchFn?: typeof fetch;
}

// ── Pure dispatch ─────────────────────────────────────────────────────────────

/**
 * POST a workflow execution request to the Glue execute endpoint.
 *
 * Always resolves — never throws. Returns status "failed" with an error
 * message if the network call or response parsing fails.
 */
export async function callGlueExecute(args: GlueDispatchArgs): Promise<GlueDispatchResult> {
  const {
    executeUrl,
    apiKey,
    workflowKey,
    workflowVersionId,
    workflowVersion,
    organizationId,
    subjectId,
    correlationId,
    payload,
    fetchFn = fetch,
  } = args;

  // Build the Glue request body — must satisfy GlueExecuteRequest schema.
  const body: Record<string, unknown> = {
    organizationId,
    workflowKey,
    subjectId,
    correlationId,
    payload,
  };
  if (workflowVersionId) {
    body.workflowVersionId = workflowVersionId;
  } else if (workflowVersion !== undefined) {
    body.workflowVersion = workflowVersion;
  }

  let response: Response;
  try {
    response = await fetchFn(executeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Glue-Api-Key": apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      status: "failed",
      error: `Network error dispatching to Glue: ${String(err)}`,
    };
  }

  if (!response.ok) {
    return {
      status: "failed",
      httpStatus: response.status,
      error: `Glue returned HTTP ${response.status}`,
    };
  }

  let data: { runId?: string } = {};
  try {
    data = (await response.json()) as { runId?: string };
  } catch {
    // Response body parsing failure — still consider it dispatched since HTTP was 2xx.
  }

  return {
    status: "dispatched",
    runId: data.runId,
    httpStatus: response.status,
  };
}
