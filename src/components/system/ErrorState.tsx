import { AlertTriangle, RefreshCcw } from "lucide-react";
import { mapAuthError } from "@/lib/auth-errors";

export function ErrorState({
  error,
  onRetry,
  title,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const mapped = mapAuthError(error);
  const code = mapped?.code ?? "unknown";
  const message = mapped?.message ?? "Something went wrong.";

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center"
    >
      <div className="mb-3 rounded-full border border-destructive/30 bg-destructive/10 p-3 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>

      <p className="text-mono-xs uppercase tracking-widest text-destructive">
        {code.replace(/_/g, " ")}
      </p>

      <p className="mt-2 text-sm font-medium">{title ?? "Request failed"}</p>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 text-xs hover:bg-surface-3"
        >
          <RefreshCcw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  );
}
