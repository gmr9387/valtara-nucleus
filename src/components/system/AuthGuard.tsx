import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { LoadingState } from "@/components/system/LoadingState";

/**
 * Client-side auth guard for nested layouts. Renders a loading state until
 * the session is resolved, then redirects unauthenticated users to /login.
 *
 * We use a render-time guard here instead of a `beforeLoad` redirect because
 * Supabase session hydration is async on the client and prerender lacks a
 * bearer token. This avoids redirect loops during SSR.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-mono-xs text-muted-foreground">LOADING…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <LoadingState rows={2} label="Redirecting to sign in…" />
      </div>
    );
  }

  return <>{children}</>;
}
