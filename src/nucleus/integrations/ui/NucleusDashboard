// src/nucleus/integrations/ui/NucleusDashboard.tsx

import React, { useEffect, useState } from "react";

/**
 * Nucleus Dashboard UI Component
 *
 * Displays:
 *   - subsystem health
 *   - metrics
 *   - last event
 *
 * Consumes:
 *   GET /nucleus/dashboard
 *
 * Purely presentational.
 * No execution.
 * No authorization.
 * No domain logic.
 */

export function NucleusDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/nucleus/dashboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 3000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading Nucleus Dashboard…</div>;
  }

  if (!data) {
    return <div style={{ padding: 20 }}>Dashboard unavailable.</div>;
  }

  const { subsystemHealth, metrics, lastEvent } = data;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Nucleus Dashboard</h1>

      <section style={{ marginTop: 20 }}>
        <h2>Subsystem Health</h2>
        <ul>
          {Object.entries(subsystemHealth).map(([name, status]) => (
            <li key={name}>
              <strong>{name}</strong>: {status}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Metrics</h2>
        <ul>
          <li>Events per minute: {metrics.eventsPerMinute}</li>
          <li>Total events: {metrics.eventCount}</li>
          <li>Opportunities detected: {metrics.opportunitiesDetected}</li>
          <li>Authorizations issued: {metrics.authorizationsIssued}</li>
          <li>Executions completed: {metrics.executionsCompleted}</li>
          <li>Anomalies detected: {metrics.anomaliesDetected}</li>
          <li>DualPay signals: {metrics.dualpaySignals}</li>
          <li>
            Avg pipeline latency: {metrics.averagePipelineLatencyMs.toFixed(2)} ms
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Last Event</h2>
        {lastEvent ? (
          <pre
            style={{
              background: "#f5f5f5",
              padding: 10,
              borderRadius: 6,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(lastEvent, null, 2)}
          </pre>
        ) : (
          <p>No events yet.</p>
        )}
      </section>
    </div>
  );
}
