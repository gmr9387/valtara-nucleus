/**
 * ValtariOS Core — Machine-to-Machine Auth
 *
 * Provides key validation for service-to-service callers (e.g. DualPay).
 * The shared secret is set in the CORE_API_KEY environment variable.
 *
 * Usage (DualPay caller):
 *   POST /_server/<hash>
 *   Header: X-Core-Api-Key: <CORE_API_KEY value>
 *
 * Security properties:
 *   - Constant-time comparison is approximated via length-check then equality.
 *     For production hardening, replace with a crypto timing-safe compare.
 *   - If CORE_API_KEY is not set, all M2M requests are rejected.
 *   - A null/undefined/empty provided key is always rejected.
 */

/**
 * Validate that a provided API key matches the expected CORE_API_KEY env var.
 *
 * Pure function — no side effects, fully unit-testable.
 *
 * @param providedKey - value from the X-Core-Api-Key request header
 * @param envKey      - expected key (typically process.env.CORE_API_KEY)
 */
export function validateCoreApiKey(
  providedKey: string | null | undefined,
  envKey: string | undefined,
): boolean {
  if (!envKey || envKey.length === 0) return false;
  if (!providedKey || providedKey.length === 0) return false;
  // Length check before equality to reduce timing surface
  if (providedKey.length !== envKey.length) return false;
  return providedKey === envKey;
}

export const CORE_API_KEY_HEADER = "x-core-api-key" as const;
export const CORE_CALLER_SERVICE = "service:dualpay" as const;
