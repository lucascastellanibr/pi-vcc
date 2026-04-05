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

  it("only captures tool results, not assistant text", () => {
    const blocks: NormalizedBlock[] = [
      { kind: "assistant", text: "The root cause is a null pointer" },
    ];
    expect(extractFindings(blocks).length).toBe(0);
  });

  it("ignores short lines", () => {
    const blocks: NormalizedBlock[] = [
      { kind: "assistant", text: "error" },
    ];
    expect(extractFindings(blocks)).toEqual([]);
  });

  it("deduplicates tool results", () => {
    const blocks: NormalizedBlock[] = [
      { kind: "tool_result", name: "bash", text: "same output repeated here", isError: false },
      { kind: "tool_result", name: "bash", text: "same output repeated here", isError: false },
    ];
    expect(extractFindings(blocks).length).toBe(1);
  });
});

