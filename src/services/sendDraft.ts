import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import type { TrendItem } from "../types";

dotenv.config();

/**
 * Normalize a string for Notion (max 2000 chars per rich text block; empty becomes placeholder).
 */
function truncateForNotion(text: string | undefined, maxLength = 2000): string {
  if (text == null || String(text).trim() === "") return "—";
  const s = String(text).trim();
  return s.length > maxLength ? s.slice(0, maxLength - 3) + "..." : s;
}

/**
 * Write consolidated trend items to the configured Notion database as one row per trend.
 */
export async function sendDraft(items: TrendItem[]): Promise<string> {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !databaseId) {
    throw new Error(
      "NOTION_API_KEY and NOTION_DATABASE_ID must be set in the environment.",
    );
  }

  const notion = new Client({ auth: apiKey });

  if (items.length === 0) {
    return `No trend items to write to Notion at ${new Date().toISOString()}`;
  }

  const dateValue = new Date().toISOString().slice(0, 10);

  for (const item of items) {
    const title = truncateForNotion(item.trend_name, 2000);
    const description = truncateForNotion(item.description);
    const reasoning = truncateForNotion(item.reasoning);
    const sourcesText = truncateForNotion(
      Array.isArray(item.sources) ? item.sources.join(", ") : String(item.sources ?? ""),
    );
    const category = item.category ? truncateForNotion(item.category, 100) : undefined;

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [{ text: { content: title } }],
        },
        Description: {
          rich_text: [{ text: { content: description } }],
        },
        Reasoning: {
          rich_text: [{ text: { content: reasoning } }],
        },
        Sources: {
          rich_text: [{ text: { content: sourcesText } }],
        },
        Date: {
          date: { start: dateValue },
        },
        ...(category !== undefined && category !== "—"
          ? { Category: { select: { name: category } } }
          : {}),
      } as Parameters<typeof notion.pages.create>[0]["properties"],
    });
  }

  return `Success writing ${items.length} trend(s) to Notion at ${new Date().toISOString()}`;
}
