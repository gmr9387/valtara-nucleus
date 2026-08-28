// src/nucleus/db/nucleusRepository.ts

/**
 * NucleusRepository (Phase 13.3)
 *
 * Purpose:
 *   Provide typed repositories for each contract type.
 */

import { NucleusDB } from "./nucleusDB";
import { NucleusRLS } from "./nucleusRLS";

export class NucleusRepository {
  constructor(
    private db: NucleusDB,
    private subsystem: "weaver" | "guardian" | "glue" | "dualpay",
    private organizationId: string
  ) {}

  async saveContract(name: string, payload: any) {
    NucleusRLS.enforceOrganization(payload, this.organizationId);
    NucleusRLS.enforceContractType(this.subsystem, name);

    return this.db.insert(name, payload);
  }

  async getContracts(name: string) {
    return this.db.select(name, { organizationId: this.organizationId });
  }
}
