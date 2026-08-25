/**
 * Supabase runtime utilities for the Valtaris ecosystem.
 * This module provides a typed Supabase client, environment
 * aware initialization, and deterministic query helpers used
 * across all runtimes.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseRuntimeConfig {
  url: string;
  key: string;
  environmentId: string;
  metadata: Record<string, unknown>;
}

export class SupabaseRuntime {
  private client: SupabaseClient;
  private environmentId: string;
  private metadata: Record<string, unknown>;

  constructor(config: SupabaseRuntimeConfig) {
    this.client = createClient(config.url, config.key);
    this.environmentId = config.environmentId;
    this.metadata = config.metadata;
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getEnvironmentId(): string {
    return this.environmentId;
  }

  getMetadata(): Record<string, unknown> {
    return this.metadata;
  }

  async query<T>(table: string, filters: Record<string, unknown>): Promise<T[]> {
    let q = this.client.from(table).select("*");

    for (const [key, value] of Object.entries(filters)) {
      q = q.eq(key, value);
    }

    const { data, error } = await q;

    if (error) {
      throw new Error(error.message);
    }

    return data as T[];
  }

  async insert<T>(table: string, payload: Record<string, unknown>): Promise<T> {
    const { data, error } = await this.client.from(table).insert(payload).select().single();

    if (error) {
      throw new Error(error.message);
    }

    return data as T;
  }
}
