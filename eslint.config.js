import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/core/services/**/*"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "ImportDeclaration[source.value=/^@\\/lib\\/core\\/services\\/.*\\.service$/]",
          message:
            "Boundary rail: avoid deep imports from @/lib/core/services/*.service in consumers; import from @/lib/core/services instead.",
        },
        {
          selector:
            "ExportNamedDeclaration[source.value=/^@\\/lib\\/core\\/services\\/.*\\.service$/]",
          message:
            "Boundary rail: avoid re-exporting @/lib/core/services/*.service from consumers; re-export from @/lib/core/services only.",
        },
        {
          selector:
            "ExportAllDeclaration[source.value=/^@\\/lib\\/core\\/services\\/.*\\.service$/]",
          message:
            "Boundary rail: avoid wildcard re-export of @/lib/core/services/*.service from consumers; use @/lib/core/services.",
        },
      ],
    },
  },
  {
    files: ["src/lib/core/index.ts"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "ExportAllDeclaration[source.value='./examples']",
          message: "Boundary rail: do not expose product examples from Core public entrypoints.",
        },
        {
          selector: "ExportNamedDeclaration[source.value='./examples']",
          message: "Boundary rail: do not expose product examples from Core public entrypoints.",
        },
        {
          selector:
            "ExportNamedDeclaration[source.value=/^\\.\\/(evaluator|confidence|decisions|trace|governance|replay)$/]",
          message:
            "Boundary rail: do not export Weaver/decision/governance modules from Core public entrypoints.",
        },
        {
          selector:
            "ExportAllDeclaration[source.value=/^\\.\\/(evaluator|confidence|decisions|trace|governance|replay)$/]",
          message:
            "Boundary rail: do not export Weaver/decision/governance modules from Core public entrypoints.",
        },
        {
          selector:
            "ImportDeclaration[source.value=/^\\.\\/(glue|runtime|workflow-execution|workflows)$/]",
          message:
            "Boundary rail: do not import Glue/runtime/workflow execution modules into Core public entrypoints.",
        },
        {
          selector:
            "ExportNamedDeclaration[source.value=/^\\.\\/(glue|runtime|workflow-execution|workflows)$/]",
          message:
            "Boundary rail: do not export Glue/runtime/workflow execution modules from Core public entrypoints.",
        },
        {
          selector:
            "ExportAllDeclaration[source.value=/^\\.\\/(glue|runtime|workflow-execution|workflows)$/]",
          message:
            "Boundary rail: do not export Glue/runtime/workflow execution modules from Core public entrypoints.",
        },
      ],
    },
  },
  eslintPluginPrettier,
);
