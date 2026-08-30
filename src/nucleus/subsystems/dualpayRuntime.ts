import { NucleusApi } from "../api/nucleusApi";

export class DualPayRuntime {
  constructor(private organizationId: string) {}

  async payment(version: string, payload: any) {
    const api = new NucleusApi("dualpay", this.organizationId);
    await api.emit("payment", version, payload);
    return api.lineage();
  }
}
