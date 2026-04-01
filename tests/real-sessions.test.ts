import { beforeAll, describe, expect, it } from "bun:test";
import { compile } from "../src/core/summarize";
import { prepareSessionSamples, readSourceStat, type SessionSample } from "./support/real-sessions";
import { loadSessionMessages } from "./support/load-session";

let samples: SessionSample[] = [];

beforeAll(async () => {
  samples = await prepareSessionSamples(2);
});

describe("real session integration", () => {
  it("compiles copied large sessions without mutating originals", async () => {
    for (const sample of samples) {
      const before = await readSourceStat(sample);
      const loaded = loadSessionMessages(sample.copy);
      const summary = compile({ messages: loaded.messages });
      const after = await readSourceStat(sample);

      expect(loaded.messageCount).toBeGreaterThan(0);
      expect(loaded.skippedCount).toBeGreaterThanOrEqual(0);
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).toContain("[");
      expect(after).toEqual(before);
    }
  });

  it("uses read-only copied fixtures", () => {
    for (const sample of samples) {
      expect(sample.copy).not.toBe(sample.source);
      expect(sample.copy.includes("pi-vcc-sessions-")).toBe(true);
    }
  });
});
