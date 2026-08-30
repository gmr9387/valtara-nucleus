import { NucleusApi } from "../api/nucleusApi";

export class GuardianRuntime {
  constructor(private organizationId: string) {}

  async authorization(version: string, payload: any) {
    const api = new NucleusApi("guardian", this.organizationId);
    await api.emit("authorization", version, payload);
    return api.lineage();
  }
}
