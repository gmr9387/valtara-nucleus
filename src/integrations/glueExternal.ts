// src/integrations/glueExternal.ts

import axios from "axios";

export class GlueExternal {
  static async executeWorkflow(payload: any) {
    const response = await axios.post(
      "https://your-glue-service-url.com/api/execute",
      payload
    );

    return response.data;
  }
}
