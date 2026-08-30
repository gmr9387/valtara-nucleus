/**
 * WorkflowRuntime for the Valtaris Glue engine.
 * Orchestrates workflow execution:
 * - loads workflow + definition
 * - creates workflow instance
 * - invokes WorkflowEngine
 * - manages lifecycle events
 */

import { WorkflowEngine } from "./workflowEngine";
import { WorkflowService } from "./workflowService";
import { WorkflowDefinitionService } from "./workflowDefinitionService";
import { WorkflowInstance } from "./workflowInstance";
import { supabase } from "../runtime/supabase";
import { wrapError } from "../runtime/errors";

export class WorkflowRuntime {
  private workflows: WorkflowService;
  private definitions: WorkflowDefinitionService;
  private engine: WorkflowEngine;

  constructor() {
    this.workflows = new WorkflowService();
    this.definitions = new WorkflowDefinitionService();
    this.engine = new WorkflowEngine();
  }

  /**
   * Execute a workflow by ID.
   */
  async execute(
    ctx: any,
    workflowId: string,
    userId: string
  ): Promise<WorkflowInstance> {
    try {
      // Load workflow
      const workflow = await this.workflows.get(ctx, workflowId);

      // Load active definition
      const definition = await this.definitions.load(
        workflowId,
        workflow.activeVersion
      );

      // Create instance
      const instance = await this.createInstance(workflow, userId);

      // Run engine
      await this.engine.execute(instance, definition);

      // Reload final instance state
      return await this.getInstance(instance.id);
    } catch (err) {
      throw wrapError(err);
    }
  }

  /**
   * Create a workflow instance.
   */
  async createInstance(workflow: any, userId: string): Promise<WorkflowInstance> {
    const instance: Partial<WorkflowInstance> = {
      id: crypto.randomUUID(),
      workflowId: workflow.id,
      version: workflow.activeVersion,
      organizationId: workflow.organizationId,
      projectId: workflow.projectId,
      environmentId: workflow.environmentId,
      status: "running",
      currentStepId: null,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      completedAt: null
    };

    const { data, error } = await supabase
      .from("workflow_instances")
      .insert(instance)
      .select()
      .single();

    if (error) throw error;
    return data as WorkflowInstance;
  }

  /**
   * Fetch a workflow instance by ID.
   */
  async getInstance(instanceId: string): Promise<WorkflowInstance> {
    const { data, error } = await supabase
      .from("workflow_instances")
      .select("*")
      .eq("id", instanceId)
      .single();

    if (error) throw error;
    return data as WorkflowInstance;
  }
}
