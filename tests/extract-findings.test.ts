import { describe, it, expect } from "bun:test";
import { extractFindings } from "../src/extract/findings";
import type { NormalizedBlock } from "../src/types";

describe("extractFindings", () => {
  it("returns empty for no blocks", () => {
    expect(extractFindings([])).toEqual([]);
  });

  it("ignores raw tool errors", () => {
    const blocks: NormalizedBlock[] = [
      { kind: "tool_result", name: "Edit", text: "File not found", isError: true },
    ];
    expect(extractFindings(blocks)).toEqual([]);
  });

  it("captures assistant lines matching error patterns", () => {
    const blocks: NormalizedBlock[] = [
      { kind: "assistant", text: "The root cause is a null pointer" },
    ];
    expect(extractFindings(blocks).length).toBe(1);
  });

  it("ignores short lines", () => {
    const blocks: NormalizedBlock[] = [
      { kind: "assistant", text: "error" },
    ];
    expect(extractFindings(blocks)).toEqual([]);
  });

  it("deduplicates findings", () => {
    const blocks: NormalizedBlock[] = [
      { kind: "assistant", text: "found that X is broken" },
      { kind: "assistant", text: "found that X is broken" },
    ];
    expect(extractFindings(blocks).length).toBe(1);
  });
});

