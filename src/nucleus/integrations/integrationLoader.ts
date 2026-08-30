// src/nucleus/integrations/integrationLoader.ts

/**
 * Integration Loader
 *
 * Constitutional roles:
 * Nucleus = KNOW
 * Weaver  = FIND
 * Guardian = ALLOW
 * Glue = DO
 * DualPay = SPECIALIZE
 *
 * This loader activates all subsystem integrations:
 *   - Nucleus ↔ Weaver
 *   - Nucleus ↔ Guardian
 *   - Nucleus ↔ Glue
 *   - Nucleus ↔ DualPay
 *
 * It does NOT execute workflows.
 * It does NOT authorize.
 * It does NOT perform domain logic.
 */

import { startNucleusWeaverIntegration } from "./nucleusWeaverIntegration";
import { startNucleusGuardianIntegration } from "./nucleusGuardianIntegration";
import { startNucleusGlueIntegration } from "./nucleusGlueIntegration";
import { startNucleusDualPayIntegration } from "./nucleusDualPayIntegration";

export function loadIntegrations() {
  startNucleusWeaverIntegration();
  startNucleusGuardianIntegration();
  startNucleusGlueIntegration();
  startNucleusDualPayIntegration();

  console.log("[Nucleus] All integrations loaded.");
}
