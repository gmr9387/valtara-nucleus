// src/glue/glueAdapter.ts

import { GlueRuntime } from "./glueRuntime";

export class GlueAdapter {
  static execute(payload: any) {
    return GlueRuntime.handle("execution", payload);
  }
}
