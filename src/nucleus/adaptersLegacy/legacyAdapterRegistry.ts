// Phase 45 — Legacy Adapter Registry

import externalContractAdapter from "../adapter/externalContractAdapter";
import externalEventAdapter from "../adapter/externalEventAdapter";
import externalIdentityAdapter from "../adapter/externalIdentityAdapter";

import subsystemContractAdapter from "../adapter/subsystemContractAdapter";
import subsystemEventAdapter from "../adapter/subsystemEventAdapter";
import subsystemIdentityAdapter from "../adapter/subsystemIdentityAdapter";

export const legacyAdapterRegistry = {
  "legacy.externalContractAdapter": externalContractAdapter,
  "legacy.externalEventAdapter": externalEventAdapter,
  "legacy.externalIdentityAdapter": externalIdentityAdapter,

  "legacy.subsystemContractAdapter": subsystemContractAdapter,
  "legacy.subsystemEventAdapter": subsystemEventAdapter,
  "legacy.subsystemIdentityAdapter": subsystemIdentityAdapter,
};
