// src/nucleus/subsystems/nucleusSubsystemRouter.ts

import { Router } from "express";

import { guardianRouter } from "./guardian/guardianRouter";
import { contractsRouter } from "./contracts/contractsRouter";
import { glueRouter } from "./glue/glueRouter";
import { weaverRouter } from "./weaver/weaverRouter";
import { dualpayRouter } from "./dualpay/dualpayRouter";

export function nucleusSubsystemRouter() {
  const router = Router();

  router.use("/guardian", guardianRouter());
  router.use("/contracts", contractsRouter());
  router.use("/glue", glueRouter());
  router.use("/weaver", weaverRouter());
  router.use("/dualpay", dualpayRouter());

  return router;
}
