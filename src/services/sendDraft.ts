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
 * Parse a date string to YYYY-MM-DD or return today.
 */
function toISODate(value: string | undefined): string {
  if (!value || String(value).trim() === "") {
    return new Date().toISOString().slice(0, 10);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

/**
 * Write trend items to the configured Notion database as one row per item.
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

  for (const item of items) {
    const title = truncateForNotion(item.headline ?? item.description, 2000);
    const link = item.story_or_tweet_link ?? item.link ?? "";
    const description = truncateForNotion(item.description ?? item.headline);
    const dateValue = toISODate(item.date_posted);
    const source = item.source ? truncateForNotion(item.source, 100) : undefined;

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [{ text: { content: title } }],
        },
        ...(link ? { Link: { url: link } } : {}),
        Description: {
          rich_text: [{ text: { content: description } }],
        },
        Date: {
          date: { start: dateValue },
        },
        ...(source !== undefined && source !== "—"
          ? { Source: { select: { name: source } } }
          : {}),
      } as Parameters<typeof notion.pages.create>[0]["properties"],
    });
  }

  return `Success writing ${items.length} trend(s) to Notion at ${new Date().toISOString()}`;
}
