// src/nucleus/telemetry/nucleusTracing.ts
// Full file swap — Nucleus Distributed Tracing

export type TraceSpan = {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  subsystem?: string;
  startedAt: number;
  endedAt?: number;
};

export class NucleusTracing {
  private spans: TraceSpan[] = [];

  startSpan(name: string, subsystem?: string, parentSpanId?: string): TraceSpan {
    const span: TraceSpan = {
      traceId: this.id(),
      spanId: this.id(),
      parentSpanId,
      name,
      subsystem,
      startedAt: Date.now(),
    };
    this.spans.push(span);
    return span;
  }

  endSpan(spanId: string) {
    const span = this.spans.find((s) => s.spanId === spanId);
    if (span) {
      span.endedAt = Date.now();
    }
  }

  getSpans() {
    return [...this.spans];
  }

  private id() {
    return Math.random().toString(16).slice(2);
  }
}
