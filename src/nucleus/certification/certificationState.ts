// Phase 50 — Certification State

export interface CertificationState {
  certified: boolean;
  lastCertifiedAt?: string;
  proofs: string[];
}

export const certificationState: CertificationState = {
  certified: false,
  proofs: [],
};
