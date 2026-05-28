import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "@/components/system/ErrorState";
import { logTelemetryEvent } from "@/lib/telemetry";

interface Props {
  children: ReactNode;
  module?: string;
  fallback?: (error: unknown, reset: () => void) => ReactNode;
}

interface State {
  error: unknown;
}

/**
 * Last-resort React error boundary.
 * Route-level boundaries are handled by TanStack Router's errorComponent;
 * this is for component subtrees we want to isolate from the full route.
 */
export class CrashBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[CrashBoundary]", error, info.componentStack);
    void logTelemetryEvent({
      module: this.props.module ?? "ui",
      event_type: "ui.crash",
      severity: "error",
      message: error.message,
      attributes: { stack: info.componentStack ?? null },
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <ErrorState error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
