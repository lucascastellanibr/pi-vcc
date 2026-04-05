import { describe, it, expect } from "bun:test";
import { compile } from "../src/core/summarize";
import {
  userMsg,
  assistantText,
  assistantWithToolCall,
  toolResult,
} from "./fixtures";

describe("compile", () => {
  it("returns empty string for no messages", () => {
    expect(compile({ messages: [] })).toBe("");
  });

  it("produces structured output from a conversation", () => {
    const r = compile({
      messages: [
        userMsg("Fix login bug"),
        assistantWithToolCall("Read", { path: "auth.ts" }),
        toolResult("Read", "function login() {}"),
        assistantText("Found the issue.\n1. Fix validation"),
      ],
    });
    expect(r).toContain("[Session Goal]");
    expect(r).toContain("Fix login bug");
    expect(r).toContain("[Actions Taken]");
    expect(r).toContain("[Files And Changes]");
    expect(r).toContain("auth.ts");
  });

  it("merges by section instead of appending delta blocks", () => {
    const r = compile({
      messages: [assistantText("Current state")],
      previousSummary: "[Session Goal]\n- Original goal",
    });
    expect(r).toContain("[Session Goal]\n- Original goal");
    expect(r).toContain("[Key Conversation Turns]");
    expect(r).not.toContain("[Delta Since Last Compaction]");
  });

  it("passes fileOps through to sections", () => {
    const r = compile({
      messages: [userMsg("check")],
      fileOps: { readFiles: ["config.ts"] },
    });
    expect(r).toContain("config.ts");
  });

  it("re-caps rolling sections after merge", () => {
    const previousSummary = [
      "[Actions Taken]",
      "- * Read \"a.ts\"",
      "- * Read \"b.ts\"",
      "- * Read \"c.ts\"",
      "- * Read \"d.ts\"",
      "- * Read \"e.ts\"",
      "- * Read \"f.ts\"",
      "- * Read \"g.ts\"",
      "- * Read \"h.ts\"",
    ].join("\n");
    const r = compile({
      previousSummary,
      messages: [
        assistantWithToolCall("Read", { path: "i.ts" }),
        assistantWithToolCall("Read", { path: "j.ts" }),
      ],
    });
    expect(r).toContain('[Actions Taken]');
    expect(r).toContain('+5 actions omitted');
    expect(r).toContain('* Read "a.ts"');
    expect(r).toContain('* Read "j.ts"');
    expect(r).not.toContain('* Read "d.ts"');
    expect(r).not.toContain('* Read "e.ts"');
    expect(r).not.toContain('* Read "f.ts"');
  });

  it("flattens multiline evidence into a single bullet line", () => {
    const r = compile({
      messages: [
        toolResult("bash", "line one\nline two\nline three"),
      ],
    });
    expect(r).toContain('[Important Evidence]');
    expect(r).toContain('[bash] line one line two line three');
    expect(r).not.toContain('[bash] line one\nline two');
  });
});


