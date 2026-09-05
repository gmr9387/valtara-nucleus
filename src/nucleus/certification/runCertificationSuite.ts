// Phase 31 — Full Subsystem Certification Runner

import { certifyWeaver } from "./weaverCertification";
import { certifyGuardian } from "./guardianCertification";
import { certifyGlue } from "./glueCertification";
import { certifyDualPay } from "./dualpayCertification";

export function runCertificationSuite() {
  console.log("🔵 Phase 31 — Subsystem Certification Suite Starting...");

  const weaver = certifyWeaver();
  const guardian = certifyGuardian();
  const glue = certifyGlue();
  const dualpay = certifyDualPay();

  console.log("🟢 Weaver certification:", weaver);
  console.log("🟢 Guardian certification:", guardian);
  console.log("🟢 Glue certification:", glue);
  console.log("🟢 DualPay certification:", dualpay);

  console.log("🔵 Phase 31 — Subsystem Certification Suite Complete.");
}
