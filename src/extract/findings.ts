import type { NormalizedBlock } from "../types";

const TRUNCATE_TOKENS = 128;
const NOISE_TOOLS = new Set(["TodoWrite", "ToolSearch", "Skill"]);

const truncateText = (text: string, limit = TRUNCATE_TOKENS): string => {
  const flat = text.replace(/\s+/g, " ").trim();
  const words = flat.split(/\s+/).filter(Boolean);
  if (words.length <= limit) return flat;
  return words.slice(0, limit).join(" ") + "...(truncated)";
};

export const extractFindings = (blocks: NormalizedBlock[]): string[] => {
  const results: string[] = [];
  const seen = new Set<string>();

  for (const b of blocks) {
    // Only extract from tool results, not assistant interpretations
    if (b.kind !== "tool_result") continue;
    if (b.isError) continue;
    if (NOISE_TOOLS.has(b.name)) continue;
    
    const text = b.text?.trim();
    if (!text || text.length < 20) continue;

    const label = `[${b.name}] ${truncateText(text, TRUNCATE_TOKENS)}`;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(label);
  }

  return results.slice(-8);
};

