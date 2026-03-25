/**
 * Strip markdown code fences from LLM JSON output and parse it.
 */
export function stripCodeFences(raw: string): string {
  return raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

/**
 * Valid trend categories. Single source of truth used in the LLM prompt and Notion select.
 */
export const TREND_CATEGORIES = [
  "Security",
  "AI Models",
  "Tool Launches",
  "Industry Shifts",
  "Developer Experience",
  "Open Source",
  "Other",
] as const;

export type TrendCategory = (typeof TREND_CATEGORIES)[number];
