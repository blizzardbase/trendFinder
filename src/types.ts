import type { TrendCategory } from "./utils";

/**
 * A consolidated trend identified across multiple sources, used for Notion database rows.
 */
export interface TrendItem {
  trend_name: string;
  description: string;
  reasoning: string;
  sources: string[];
  category?: TrendCategory;
}
