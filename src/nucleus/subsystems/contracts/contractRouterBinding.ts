// src/nucleus/subsystems/contracts/contractRouterBinding.ts
// Full file — Bind Contract Subsystem Router into Nucleus API Layer

import { ContractSubsystemRouter } from "./contractSubsystemRouter";

export function bindContractSubsystemRoutes(app: any, organizationId: string) {
  const router = new ContractSubsystemRouter(organizationId);

  // -----------------------------
  // Contract Route Binding
  // -----------------------------
  app.post("/contract/:type/:version", async (req: any, res: any) => {
    try {
      const result = await router.handleRequest(req);
      res.status(result.status).json(result.data ?? { error: result.error });
    } catch (err: any) {
      res.status(500).json({
        error: err.message || "Contract subsystem routing failure",
      });
    }
  });
}
