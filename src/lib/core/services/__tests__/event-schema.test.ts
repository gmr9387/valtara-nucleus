import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateEventPayloadSchema } from "@/lib/core/services/event-schema";
import type { EventPayloadContractSchema } from "@/lib/core/services/contracts";

describe("validateEventPayloadSchema", () => {
  const schema: EventPayloadContractSchema = {
    type: "object",
    allowAdditionalProperties: false,
    properties: {
      payoutId: { type: "string", required: true },
      amount: { type: "number", required: true },
      metadata: {
        type: "object",
        properties: {
          source: { type: "string", required: true },
        },
      },
    },
  };

  it("accepts valid payloads", () => {
    const result = validateEventPayloadSchema(schema, {
      payoutId: "po_123",
      amount: 450,
      metadata: { source: "dualpay" },
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
  });

  it("rejects invalid payloads", () => {
    const result = validateEventPayloadSchema(schema, {
      payoutId: 123,
      amount: "450",
      extra: true,
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.length >= 3);
  });
});
