/**
 * workflowThemeGlobals.ts
 *
 * Injects workflowTheme tokens as global CSS variables.
 * This creates a deterministic mapping from TS theme tokens → CSS,
 * enabling:
 * - global styling
 * - dark mode overrides
 * - semantic tokens
 * - component-level variants
 */

import { workflowTheme } from "./workflowTheme";

/**
 * Converts the workflowTheme object into CSS variables.
 */
export function injectWorkflowThemeGlobals() {
  const root = document.documentElement;

  /* -------------------------------------------------------
   * Spacing
   * ----------------------------------------------------- */
  Object.entries(workflowTheme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--wf-spacing-${key}`, value);
  });

  /* -------------------------------------------------------
   * Colors
   * ----------------------------------------------------- */
  Object.entries(workflowTheme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--wf-color-${key}`, value);
  });

  /* -------------------------------------------------------
   * Typography
   * ----------------------------------------------------- */
  Object.entries(workflowTheme.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--wf-font-size-${key}`, value);
  });

  Object.entries(workflowTheme.typography.fontWeight).forEach(([key, value]) => {
    root.style.setProperty(`--wf-font-weight-${key}`, value.toString());
  });

  root.style.setProperty(`--wf-font-family`, workflowTheme.typography.fontFamily);

  /* -------------------------------------------------------
   * Component Primitives
   * ----------------------------------------------------- */
  Object.entries(workflowTheme.components.panel).forEach(([key, value]) => {
    root.style.setProperty(`--wf-panel-${key}`, value);
  });

  Object.entries(workflowTheme.components.button).forEach(([key, value]) => {
    root.style.setProperty(`--wf-button-${key}`, value);
  });
}
