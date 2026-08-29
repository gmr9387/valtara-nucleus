// src/nucleus/db/nucleusDbBridge.ts
// Full file swap — Nucleus DB persistence layer

import { NucleusDB } from "./nucleusDB";

export class NucleusDBBridge {
  private db = new NucleusDB().getClient();

  async insertContract(
    table: string,
    organizationId: string,
    version: string,
    payload: any
  ) {
    const { error } = await this.db.from(table).insert({
      organization_id: organizationId,
      version,
      payload,
    });

    if (error) {
      console.error("NucleusDBBridge.insertContract error:", error);
      throw error;
    }
  }

  async insertLineage(
    organizationId: string,
    chain: any,
    finalized: boolean = false
  ) {
    const { error } = await this.db.from("nucleus_lineage").insert({
      organization_id: organizationId,
      chain,
      finalized,
    });

    if (error) {
      console.error("NucleusDBBridge.insertLineage error:", error);
      throw error;
    }
  }

  async insertEvent(
    organizationId: string,
    subsystem: string,
    name: string,
    version: string,
    payload: any
  ) {
    const { error } = await this.db.from("nucleus_events").insert({
      organization_id: organizationId,
      subsystem,
      name,
      version,
      payload,
    });

    if (error) {
      console.error("NucleusDBBridge.insertEvent error:", error);
      throw error;
    }
  }

  async insertTelemetry(
    organizationId: string,
    subsystem: string,
    level: string,
    message: string,
    metadata: any = null
  ) {
    const { error } = await this.db.from("nucleus_telemetry").insert({
      organization_id: organizationId,
      subsystem,
      level,
      message,
      metadata,
    });

    if (error) {
      console.error("NucleusDBBridge.insertTelemetry error:", error);
      throw error;
    }
  }

  async insertError(
    organizationId: string,
    subsystem: string,
    code: string,
    message: string,
    context: any = null
  ) {
    const { error } = await this.db.from("nucleus_errors").insert({
      organization_id: organizationId,
      subsystem,
      code,
      message,
      context,
    });

    if (error) {
      console.error("NucleusDBBridge.insertError error:", error);
      throw error;
    }
  }
}
