/**
 * WorkflowEngine for the Valtaris Glue runtime.
 * Executes workflow definitions deterministically:
 * - task steps
 * - decision steps
 * - connector calls
 * - delay steps
 * - branching
 * - metadata propagation
 */

import { WorkflowDefinition, WorkflowStep } from "./workflow";
import { WorkflowInstance, WorkflowStepState } from "./workflowInstance";
import { supabase } from "../runtime/supabase";
import { wrapError } from "../runtime/errors";

export class WorkflowEngine {
  async execute(instance: WorkflowInstance, definition: WorkflowDefinition) {
    try {
      const steps = definition.steps;
      let currentStepId = instance.currentStepId ?? steps[0]?.id;

      while (currentStepId) {
        const step = steps.find(s => s.id === currentStepId);
        if (!step) throw new Error(`Step not found: ${currentStepId}`);

        const state = await this.startStep(instance, step);

        const result = await this.runStep(step, instance, definition);

        await this.completeStep(state.id, result);

        currentStepId = this.nextStep(step, result, definition);
        await this.updateInstance(instance.id, currentStepId, result);
      }

      await this.finishInstance(instance.id);
    } catch (err) {
      throw wrapError(err);
    }
  }

  // ------------------------------------------------------------
  // Step Execution
  // ------------------------------------------------------------

  async runStep(
    step: WorkflowStep,
    instance: WorkflowInstance,
    definition: WorkflowDefinition
  ): Promise<any> {
    switch (step.type) {
      case "task":
        return await this.runTask(step, instance);

      case "decision":
        return await this.runDecision(step, instance);

      case "connector_call":
        return await this.runConnectorCall(step, instance);

      case "delay":
        return await this.runDelay(step);

      case "branch":
        return await this.runBranch(step, instance);

      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  // ------------------------------------------------------------
  // Step Type Implementations
  // ------------------------------------------------------------

  async runTask(step: WorkflowStep, instance: WorkflowInstance) {
    return {
      status: "completed",
      output: step.config ?? {}
    };
  }

  async runDecision(step: WorkflowStep, instance: WorkflowInstance) {
    const condition = step.config?.condition;
    const result = Boolean(condition);
    return { status: "completed", output: { result } };
  }

  async runConnectorCall(step: WorkflowStep, instance: WorkflowInstance) {
    const endpoint = step.config?.endpoint;
    const payload = step.config?.payload ?? {};

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    return {
      status: "completed",
      output: json
    };
  }

  async runDelay(step: WorkflowStep) {
    const ms = step.config?.ms ?? 0;
    await new Promise(resolve => setTimeout(resolve, ms));
    return { status: "completed", output: { delayed: ms } };
  }

  async runBranch(step: WorkflowStep, instance: WorkflowInstance) {
    const branch = step.config?.branch;
    return { status: "completed", output: { branch } };
  }

  // ------------------------------------------------------------
  // Step State Management
  // ------------------------------------------------------------

  async startStep(instance: WorkflowInstance, step: WorkflowStep) {
    const state: Partial<WorkflowStepState> = {
      id: crypto.randomUUID(),
      instanceId: instance.id,
      stepId: step.id,
      status: "running",
      startedAt: new Date().toISOString(),
      metadata: {}
    };

    const { data, error } = await supabase
      .from("workflow_step_states")
      .insert(state)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async completeStep(stateId: string, result: any) {
    const { error } = await supabase
      .from("workflow_step_states")
      .update({
        status: result.status,
        completedAt: new Date().toISOString(),
        output: result.output ?? null
      })
      .eq("id", stateId);

    if (error) throw error;
  }

  // ------------------------------------------------------------
  // Instance Management
  // ------------------------------------------------------------

  async updateInstance(
    instanceId: string,
    nextStepId: string | null,
    result: any
  ) {
    const { error } = await supabase
      .from("workflow_instances")
      .update({
        currentStepId: nextStepId,
        updatedAt: new Date().toISOString(),
        metadata: result.output ?? {}
      })
      .eq("id", instanceId);

    if (error) throw error;
  }

  async finishInstance(instanceId: string) {
    const { error } = await supabase
      .from("workflow_instances")
      .update({
        status: "completed",
        completedAt: new Date().toISOString()
      })
      .eq("id", instanceId);

    if (error) throw error;
  }

  // ------------------------------------------------------------
  // Step Navigation
  // ------------------------------------------------------------

  nextStep(
    step: WorkflowStep,
    result: any,
    definition: WorkflowDefinition
  ): string | null {
    if (step.type === "decision") {
      return result.output.result
        ? step.config?.trueNext
        : step.config?.falseNext;
    }

    if (step.type === "branch") {
      return step.config?.branches?.[result.output.branch] ?? null;
    }

    return step.config?.next ?? null;
  }
}
