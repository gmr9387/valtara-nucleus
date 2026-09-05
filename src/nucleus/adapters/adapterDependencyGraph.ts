// Phase 43 — Adapter Dependency Graph

export interface AdapterDependency {
  adapter: string;
  dependsOn: string[];
}

export const adapterDependencyGraph: AdapterDependency[] = [
  { adapter: "weaver.adapter", dependsOn: [] },
  { adapter: "guardian.adapter", dependsOn: ["weaver.adapter"] },
  { adapter: "glue.adapter", dependsOn: ["weaver.adapter", "guardian.adapter"] },
  { adapter: "dualpay.adapter", dependsOn: ["glue.adapter"] },

  { adapter: "resources.adapter", dependsOn: [] },
  { adapter: "lineage.adapter", dependsOn: ["resources.adapter"] },
  { adapter: "telemetry.adapter", dependsOn: ["resources.adapter"] },

  { adapter: "environment.adapter", dependsOn: [] },
  { adapter: "federation.adapter", dependsOn: ["environment.adapter"] },
  { adapter: "autonomy.adapter", dependsOn: ["federation.adapter"] },
  { adapter: "sovereignty.adapter", dependsOn: ["autonomy.adapter"] },
];
