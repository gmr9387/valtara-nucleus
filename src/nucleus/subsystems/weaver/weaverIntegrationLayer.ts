// src/nucleus/subsystems/weaver/weaverIntegrationLayer.ts

import { WeaverOpportunityEngine } from "./weaverOpportunityEngine";
import { WeaverRecommendationEngine } from "./weaverRecommendationEngine";

export class WeaverIntegrationLayer {
  static processOpportunity(payload: any) {
    return WeaverOpportunityEngine.evaluate(payload);
  }

  static processRecommendation(payload: any) {
    return WeaverRecommendationEngine.evaluate(payload);
  }
}
