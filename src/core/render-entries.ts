import type { Message } from "@mariozechner/pi-ai";
import { clip, textOf } from "./content";
import { summarizeToolArgs } from "./tool-args";

export interface RenderedEntry {
  index: number;
  role: string;
  summary: string;
}

const toolCalls = (content: Message["content"]): string => {
  if (typeof content === "string") return "";
  return content
    .filter((c) => c.type === "toolCall")
    .map((c) => `${c.name}(${summarizeToolArgs(c.arguments)})`)
    .join(", ");
};

export const renderMessage = (msg: Message, index: number): RenderedEntry => {
  if (msg.role === "user") {
    return { index, role: "user", summary: clip(textOf(msg.content), 300) };
  }
  if (msg.role === "toolResult") {
    const prefix = msg.isError ? "ERROR " : "";
    return {
      index, role: "tool_result",
      summary: `${prefix}[${msg.toolName}] ${clip(textOf(msg.content), 200)}`,
    };
  }
  // assistant
  const text = clip(textOf(msg.content), 300);
  const tools = toolCalls(msg.content);
  const summary = tools ? `${tools}\n${text}` : text;
  return { index, role: "assistant", summary };
};


