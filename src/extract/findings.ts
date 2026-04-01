import type { NormalizedBlock } from "../types";
import { clip, nonEmptyLines } from "../core/content";

const ERROR_PATTERNS = [
  /error[:\s]/i,
  /fail(ed|ure|ing)?[:\s]/i,
  /exception[:\s]/i,
  /bug[:\s]/i,
  /root cause/i,
  /found that/i,
  /discovered/i,
  /confirmed/i,
  /test(s)?\s+(pass|fail)/i,
  /lint\s+(pass|fail|error)/i,
];

export const extractFindings = (blocks: NormalizedBlock[]): string[] => {
  const findings: string[] = [];

  for (const b of blocks) {
    if (b.kind !== "assistant") continue;
    for (const line of nonEmptyLines(b.text)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 10) continue;
      if (ERROR_PATTERNS.some((p) => p.test(trimmed))) {
        findings.push(clip(trimmed, 200));
      }
    }
  }

  return [...new Set(findings)].slice(0, 15);
};

