// src/nucleus/subsystems/index.ts

import { guardianLifecycleRouter } from "./guardian/guardianLifecycleRouter";
import { guardianRiskRouter } from "./guardian/guardianRiskRouter";
import { guardianRulesRouter } from "./guardian/guardianRulesRouter";
import { guardianScoringRouter } from "./guardian/guardianScoringRouter";
import { guardianKillSwitchRouter } from "./guardian/guardianKillSwitchRouter";
import { guardianRepairRouter } from "./guardian/guardianRepairRouter";

export const NucleusSubsystems = {
  guardian: {
    lifecycle: guardianLifecycleRouter,
    risk: guardianRiskRouter,
    rules: guardianRulesRouter,
    scoring: guardianScoringRouter,
    killSwitch: guardianKillSwitchRouter,
    repair: guardianRepairRouter,
  },
};
