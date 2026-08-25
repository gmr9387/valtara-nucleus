/**
 * Workflow service layer for the Valtaris Glue engine.
 * Provides deterministic CRUD operations, workflow loading,
 * version retrieval, and execution preparation.
 */

import { supabase } from "../runtime/supabase";
import { Workflow, WorkflowDefinition, WorkflowVersion } from "./workflow";
import { wrapError } from "../runtime/errors";

export class WorkflowService {
  async list(ctx: any): Promise<Workflow[]> {
    try {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("organizationId", ctx.organizationId)
        .eq("projectId", ctx.projectId)
        .eq("environmentId", ctx.environmentId);

      if (error) throw error;
      return data as Workflow[];
    } catch (err) {
      throw wrapError(err);
    }
  }

  async create(ctx: any, body: any): Promise<Workflow> {
    try {
      const workflow: Partial<Workflow> = {
        id: crypto.randomUUID(),
        organizationId: ctx.organizationId,
        projectId: ctx.projectId,
        environmentId: ctx.environmentId,
        name: body.name,
        description: body.description ?? "",
        activeVersion: 1,
        createdAt: new Date().toISOString(),
        createdBy: ctx.userId ?? "system",
        metadata: body.metadata ?? {}
      };

      const { data, error } = await supabase
        .from("workflows")
        .insert(workflow)
        .select()
        .single();

      if (error) throw error;
      return data as Workflow;
    } catch (err) {
      throw wrapError(err);
    }
  }

  async get(ctx: any, id: string): Promise<Workflow> {
    try {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Workflow;
    } catch (err) {
      throw wrapError(err);
    }
  }

  async loadVersion(workflowId: string, version: number): Promise<WorkflowVersion> {
    try {
      const { data, error } = await supabase
        .from("workflow_versions")
        .select("*")
        .eq("workflowId", workflowId)
        .eq("version", version)
        .single();

      if (error) throw error;
      return data as WorkflowVersion;
    } catch (err) {
      throw wrapError(err);
    }
  }

  async loadForExecution(
    ctx: any,
    workflowId: string
  ): Promise<{ workflow: Workflow; definition: WorkflowDefinition }> {
    try {
      const workflow = await this.get(ctx, workflowId);
      const version = await this.loadVersion(workflowId, workflow.activeVersion);

      return {
        workflow,
        definition: version.definition
      };
    } catch (err) {
      throw wrapError(err);
    }
  }
}
