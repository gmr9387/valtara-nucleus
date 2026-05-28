import { QueryClient } from "@tanstack/react-query";
import { mapAuthError, isAuthError } from "@/lib/auth-errors";

/**
 * Build a fresh QueryClient per request / per app boot.
 * - Conservative default staleTime to reduce duplicate fetches.
 * - Retry only transient failures; never retry auth errors.
 * - Exponential backoff capped at 8s.
 */
export function buildQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (isAuthError(error)) return false;
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
      },
      mutations: {
        retry: (failureCount, error) => {
          if (isAuthError(error)) return false;
          return failureCount < 1;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4_000),
        onError: (error) => {
          // Centralized mutation error surface — components may still attach onError.
          const mapped = mapAuthError(error);
          if (mapped && import.meta.env.DEV) {
            console.warn("[mutation]", mapped.message);
          }
        },
      },
    },
  });
}
