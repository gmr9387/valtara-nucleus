import type {
  EventPayloadContractField,
  EventPayloadContractSchema,
} from "@/lib/core/services/contracts";

export interface EventSchemaValidationResult {
  valid: boolean;
  errors: string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fieldTypeMatches(type: EventPayloadContractField["type"], value: unknown): boolean {
  if (type === "unknown") return true;
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return isPlainObject(value);
  return typeof value === type;
}

function validateField(
  value: unknown,
  field: EventPayloadContractField,
  path: string,
  errors: string[],
): void {
  if (!fieldTypeMatches(field.type, value)) {
    errors.push(`${path} expected ${field.type}`);
    return;
  }

  if (field.type === "object" && field.properties && isPlainObject(value)) {
    const knownKeys = Object.keys(field.properties);

    for (const [key, childField] of Object.entries(field.properties)) {
      const childPath = `${path}.${key}`;
      const childValue = value[key];

      if ((childValue === undefined || childValue === null) && childField.required) {
        errors.push(`${childPath} is required`);
        continue;
      }

      if (childValue !== undefined) {
        validateField(childValue, childField, childPath, errors);
      }
    }

    for (const key of Object.keys(value)) {
      if (!knownKeys.includes(key)) {
        errors.push(`${path}.${key} is not allowed`);
      }
    }
  }

  if (field.type === "array" && field.items && Array.isArray(value)) {
    value.forEach((item, index) => {
      validateField(item, field.items!, `${path}[${index}]`, errors);
    });
  }
}

export function validateEventPayloadSchema(
  schema: EventPayloadContractSchema,
  payload: unknown,
): EventSchemaValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(payload)) {
    return { valid: false, errors: ["payload must be an object"] };
  }

  for (const [key, field] of Object.entries(schema.properties)) {
    const value = payload[key];
    const path = `payload.${key}`;

    if ((value === undefined || value === null) && field.required) {
      errors.push(`${path} is required`);
      continue;
    }

    if (value !== undefined) {
      validateField(value, field, path, errors);
    }
  }

  if (!schema.allowAdditionalProperties) {
    const allowed = new Set(Object.keys(schema.properties));
    for (const key of Object.keys(payload)) {
      if (!allowed.has(key)) {
        errors.push(`payload.${key} is not allowed`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
