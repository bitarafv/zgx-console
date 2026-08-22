import type { Selection } from "./types";

export function parseStoredSelection(value: string | null): Selection | undefined {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null && "platform" in parsed) {
      const platform = (parsed as { platform?: unknown }).platform;
      if (platform === "nano" || platform === "fury") return { platform };
    }
  } catch { /* invalid values are ignored */ }
  return undefined;
}
