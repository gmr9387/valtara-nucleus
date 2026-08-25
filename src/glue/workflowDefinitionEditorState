/**
 * workflowDefinitionEditorState.ts
 *
 * Reactive state container for the Valtaris Glue Workflow Definition Editor.
 *
 * Responsibilities:
 * - hold the current workflow definition being edited
 * - track dirty state
 * - track validation state
 * - support undo/redo history
 * - support step selection
 * - integrate with registry (Swap 78)
 */

import { useState, useCallback } from "react";
import {
  WorkflowDefinition,
  WorkflowValidationResult,
  WorkflowStepDefinition
} from "./workflowDefinitionTypes";

import { validateWorkflowDefinition } from "./workflowDefinitionValidator";
import { registryPublish } from "./workflowDefinitionRegistry";

/* -------------------------------------------------------
 * Editor State Shape
 * ----------------------------------------------------- */

export interface WorkflowDefinitionEditorState {
  definition: WorkflowDefinition;
  validation: WorkflowValidationResult;
  dirty: boolean;
  selectedStepId: string | null;
  undoStack: WorkflowDefinition[];
  redoStack: WorkflowDefinition[];

  selectStep: (stepId: string | null) => void;
  updateStep: (step: WorkflowStepDefinition) => void;
  addStep: (step: WorkflowStepDefinition) => void;
  removeStep: (stepId: string) => void;

  undo: () => void;
  redo: () => void;

  publish: () => Promise<{ success: boolean; error: string | null }>;
}

/* -------------------------------------------------------
 * Hook Implementation
 * ----------------------------------------------------- */

export function useWorkflowDefinitionEditorState(
  initial: WorkflowDefinition
): WorkflowDefinitionEditorState {
  const [definition, setDefinition] = useState<WorkflowDefinition>(initial);
  const [validation, setValidation] = useState<WorkflowValidationResult>(
    validateWorkflowDefinition(initial)
  );
  const [dirty, setDirty] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const [undoStack, setUndoStack] = useState<WorkflowDefinition[]>([]);
  const [redoStack, setRedoStack] = useState<WorkflowDefinition[]>([]);

  /* -------------------------------------------------------
   * Internal: push history
   * ----------------------------------------------------- */
  const pushHistory = useCallback(
    (prev: WorkflowDefinition) => {
      setUndoStack(stack => [...stack, prev]);
      setRedoStack([]); // clear redo on new edit
    },
    []
  );

  /* -------------------------------------------------------
   * Step Selection
   * ----------------------------------------------------- */
  const selectStep = useCallback((stepId: string | null) => {
    setSelectedStepId(stepId);
  }, []);

  /* -------------------------------------------------------
   * Update Step
   * ----------------------------------------------------- */
  const updateStep = useCallback(
    (step: WorkflowStepDefinition) => {
      const prev = definition;

      const updated: WorkflowDefinition = {
        ...definition,
        steps: definition.steps.map(s => (s.id === step.id ? step : s))
      };

      pushHistory(prev);
      setDefinition(updated);
      setValidation(validateWorkflowDefinition(updated));
      setDirty(true);
    },
    [definition, pushHistory]
  );

  /* -------------------------------------------------------
   * Add Step
   * ----------------------------------------------------- */
  const addStep = useCallback(
    (step: WorkflowStepDefinition) => {
      const prev = definition;

      const updated: WorkflowDefinition = {
        ...definition,
        steps: [...definition.steps, step]
      };

      pushHistory(prev);
      setDefinition(updated);
      setValidation(validateWorkflowDefinition(updated));
      setDirty(true);
    },
    [definition, pushHistory]
  );

  /* -------------------------------------------------------
   * Remove Step
   * ----------------------------------------------------- */
  const removeStep = useCallback(
    (stepId: string) => {
      const prev = definition;

      const updated: WorkflowDefinition = {
        ...definition,
        steps: definition.steps.filter(s => s.id !== stepId)
      };

      pushHistory(prev);
      setDefinition(updated);
      setValidation(validateWorkflowDefinition(updated));
      setDirty(true);

      if (selectedStepId === stepId) {
        setSelectedStepId(null);
      }
    },
    [definition, selectedStepId, pushHistory]
  );

  /* -------------------------------------------------------
   * Undo
   * ----------------------------------------------------- */
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const prev = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);

    setRedoStack(stack => [...stack, definition]);
    setUndoStack(newUndo);

    setDefinition(prev);
    setValidation(validateWorkflowDefinition(prev));
    setDirty(true);
  }, [undoStack, definition]);

  /* -------------------------------------------------------
   * Redo
   * ----------------------------------------------------- */
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);

    setUndoStack(stack => [...stack, definition]);
    setRedoStack(newRedo);

    setDefinition(next);
    setValidation(validateWorkflowDefinition(next));
    setDirty(true);
  }, [redoStack, definition]);

  /* -------------------------------------------------------
   * Publish
   * ----------------------------------------------------- */
  const publish = useCallback(async () => {
    const result = await registryPublish(definition);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    setDirty(false);
    return { success: true, error: null };
  }, [definition]);

  /* -------------------------------------------------------
   * Final State Object
   * ----------------------------------------------------- */
  return {
    definition,
    validation,
    dirty,
    selectedStepId,
    undoStack,
    redoStack,

    selectStep,
    updateStep,
    addStep,
    removeStep,

    undo,
    redo,

    publish
  };
}
