import type { Message } from "@mariozechner/pi-ai";
import type { FileOps } from "../types";
import { normalize } from "./normalize";
import { buildSections } from "./build-sections";
import { formatSummary } from "./format";

export interface CompileInput {
  messages: Message[];
  previousSummary?: string;
  fileOps?: FileOps;
  customInstructions?: string;
}

const headers = [
  "Session Goal", "Current State", "What Was Done",
  "Important Findings", "Files And Changes", "Open Problems",
  "Decisions And Constraints", "User Preferences", "Next Best Steps",
];

const sectionOf = (text: string, header: string): string => {
  const start = text.indexOf(`[${header}]`);
  if (start < 0) return "";
  const after = text.slice(start);
  const next = headers.map((h) => h === header ? -1 : after.indexOf(`[${h}]`))
    .filter((n) => n > 0).sort((a, b) => a - b)[0];
  return (next ? after.slice(0, next) : after).trim();
};

const mergePrevious = (prev: string, fresh: string): string => {
  const merged = headers
    .map((header) => sectionOf(fresh, header) || sectionOf(prev, header))
    .filter(Boolean);
  return merged.join("\n\n");
};

export const compile = (input: CompileInput): string => {
  const blocks = normalize(input.messages);
  const data = buildSections({ blocks, fileOps: input.fileOps });
  if (input.customInstructions?.trim()) {
    data.decisions = [
      `Compaction instruction: ${input.customInstructions.trim()}`,
      ...data.decisions,
    ].slice(0, 10);
  }
  const fresh = formatSummary(data);
  return input.previousSummary ? mergePrevious(input.previousSummary, fresh) : fresh;
};
