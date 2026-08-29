// src/nucleus/decision/replay.ts
// Full file swap — Decision replay engine

export type ReplayEvent = {
  at: number;
  subsystem: string;
  name: string;
  payload: any;
};

export class Replay {
  private events: ReplayEvent[] = [];

  record(subsystem: string, name: string, payload: any) {
    this.events.push({
      at: Date.now(),
      subsystem,
      name,
      payload,
    });
  }

  replay() {
    return [...this.events];
  }
}
