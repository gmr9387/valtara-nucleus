// Phase 20 — Resource State Container

import { ResourceIdentity } from "./resourceIdentity";

export interface ResourceState<T = unknown> {
  id: string;
  type: string;

  identity: ResourceIdentity;
  data: T;

  updatedAt: string;
  createdAt: string;
}
