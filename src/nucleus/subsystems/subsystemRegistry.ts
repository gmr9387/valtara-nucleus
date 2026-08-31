// src/nucleus/subsystemRegistry.ts

export type SubsystemId =
  | "contracts"
  | "guardian"
  | "glue"
  | "weaver"
  | "dualpay"; // added

export interface SubsystemDefinition {
  id: SubsystemId;
  label: string;
  enabled: boolean;
}

export const subsystemRegistry: SubsystemDefinition[] = [
  { id: "contracts", label: "Contracts Engine", enabled: true },
  { id: "guardian", label: "Guardian Risk Engine", enabled: true },
  { id: "glue", label: "Glue Integration Engine", enabled: true },
  { id: "weaver", label: "Weaver Intelligence Engine", enabled: true },
  { id: "dualpay", label: "DualPay Payment Intelligence", enabled: true }, // NEW
];
