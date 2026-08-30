// src/nucleus/decision/confidence.ts
// Full file swap — Confidence scoring engine

export class Confidence {
  score(values: number[]): number {
    if (!values.length) return 0;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return sum / values.length;
  }

  meetsThreshold(value: number, min: number): boolean {
    return value >= min;
  }
}
