/**
 * dualPayActions.ts
 *
 * Glue → DualPay Action Module
 *
 * This module registers DualPay actions into the Glue Action Registry.
 * Workflows can now call:
 * - initiate payments
 * - issue refunds
 * - update ledger entries
 */

import { registerAction, GlueAction } from "./actionRegistry";
import { NucleusIdentity } from "../../integrations/identityBinding";
import { createLog } from "../../integrations/telemetry";

/**
 * Placeholder DualPay client.
 *
 * Later swaps will:
 * - bind to real DualPay API
 * - bind to Supabase functions
 * - bind to ledger + reconciliation engine
 */

const dualPayClient = {
  async initiatePayment(
    rail: string,
    amount: number,
    currency: string,
    payload: any,
    identity: NucleusIdentity
  ) {
    return {
      rail,
      amount,
      currency,
      payload,
      status: "initiated",
      identity
    };
  },

  async refund(
    paymentId: string,
    amount: number,
    payload: any,
    identity: NucleusIdentity
  ) {
    return {
      paymentId,
      amount,
      payload,
      status: "refunded",
      identity
    };
  },

  async updateLedger(
    entryId: string,
    delta: number,
    payload: any,
    identity: NucleusIdentity
  ) {
    return {
      entryId,
      delta,
      payload,
      status: "updated",
      identity
    };
  }
};

/**
 * Action: dualpay.initiatePayment
 */
const initiatePaymentAction: GlueAction = {
  id: "dualpay.initiatePayment",
  description: "Initiate a payment using DualPay.",
  async execute(input, context) {
    const { rail, amount, currency, payload } = input;

    context.telemetry.log(
      createLog("dualpay", "info", "Initiating payment", { rail, amount })
    );

    return await dualPayClient.initiatePayment(
      rail,
      amount,
      currency,
      payload,
      context.identity
    );
  }
};

/**
 * Action: dualpay.refund
 */
const refundAction: GlueAction = {
  id: "dualpay.refund",
  description: "Issue a refund using DualPay.",
  async execute(input, context) {
    const { paymentId, amount, payload } = input;

    context.telemetry.log(
      createLog("dualpay", "info", "Issuing refund", { paymentId, amount })
    );

    return await dualPayClient.refund(
      paymentId,
      amount,
      payload,
      context.identity
    );
  }
};

/**
 * Action: dualpay.updateLedger
 */
const updateLedgerAction: GlueAction = {
  id: "dualpay.updateLedger",
  description: "Update a ledger entry using DualPay.",
  async execute(input, context) {
    const { entryId, delta, payload } = input;

    context.telemetry.log(
      createLog("dualpay", "info", "Updating ledger", { entryId, delta })
    );

    return await dualPayClient.updateLedger(
      entryId,
      delta,
      payload,
      context.identity
    );
  }
};

/**
 * Register all actions
 */
registerAction(initiatePaymentAction);
registerAction(refundAction);
registerAction(updateLedgerAction);
