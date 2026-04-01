import type { NormalizedBlock } from "../types";
import { nonEmptyLines } from "../core/content";

export const extractGoals = (blocks: NormalizedBlock[]): string[] => {
  const goals: string[] = [];
  for (const b of blocks) {
    if (b.kind !== "user") continue;
    const lines = nonEmptyLines(b.text);
    // First user messages are typically goals
    if (goals.length === 0 && lines.length > 0) {
      goals.push(...lines.slice(0, 3));
    }
  }
  return goals;
};
