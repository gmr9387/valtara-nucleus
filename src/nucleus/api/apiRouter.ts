// src/nucleus/api/apiRouter.ts

import express from "express";
import { APIController } from "./apiController";

const router = express.Router();

/**
 * POST /claim
 * External orgs submit claims here.
 */
router.post("/claim", APIController.submitClaim);

export { router as APIRouter };
