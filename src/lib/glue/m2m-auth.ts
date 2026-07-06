/**
 * ValtariOS Glue — Machine-to-Machine Auth
 *
 * Provides key validation for service-to-service callers (e.g. Core).
 * The shared secret is set in the GLUE_API_KEY environment variable.
 *
 * Usage (Core caller):
 *   POST /api/v0/workflows/execute
 *   Header: X-Glue-Api-Key: <GLUE_API_KEY value>
 *
 * Security properties:
 *   - Constant-time comparison is approximated via length-check then equality.
 *     For production hardening, replace with a crypto timing-safe compare.
 *   - If GLUE_API_KEY is not set, all M2M requests are rejected.
 *   - A null/undefined/empty provided key is always rejected.
 */

/**
 * Validate that a provided API key matches the expected GLUE_API_KEY env var.
 *
 * Pure function — no side effects, fully unit-testable.
 *
 * @param providedKey - value from the X-Glue-Api-Key request header
 * @param envKey      - expected key (typically process.env.GLUE_API_KEY)
 */
export function validateGlueApiKey(
  providedKey: string | null | undefined,
  envKey: string | undefined,
): boolean {
  if (!envKey || envKey.length === 0) return false;
  if (!providedKey || providedKey.length === 0) return false;
  // Length check before equality to reduce timing surface
  if (providedKey.length !== envKey.length) return false;
  return providedKey === envKey;
}

export const GLUE_API_KEY_HEADER = "x-glue-api-key" as const;
export const GLUE_CALLER_SERVICE = "service:core" as const;
