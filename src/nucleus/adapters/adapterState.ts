// Phase 43 — Adapter State

export interface AdapterState {
  loaded: string[];
  lastLoadedAt?: string;
}

export const adapterState: AdapterState = {
  loaded: [],
};
