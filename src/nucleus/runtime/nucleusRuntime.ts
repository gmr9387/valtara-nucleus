// src/nucleus/nucleusRuntime.ts

import { DualpayHealth } from "./subsystems/dualpay/dualpayHealth";

export async function nucleusHealth(organizationId: string) {
  const dualpay = new DualpayHealth(organizationId);

  return {
    status: "healthy",
    subsystems: {
      dualpay: await dualpay.check(),
      // other subsystems...
    },
  };
}
