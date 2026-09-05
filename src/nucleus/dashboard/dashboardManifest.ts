// Phase 48 — Dashboard Manifest

export interface DashboardManifest {
  enabled: boolean;
  port: number;
  title: string;
}

export const dashboardManifest: DashboardManifest = {
  enabled: true,
  port: 7070,
  title: "Valtaris Sovereign Runtime Dashboard",
};
