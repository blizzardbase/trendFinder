import FirecrawlApp from "@mendable/firecrawl-js";
import dotenv from "dotenv";
import { stripCodeFences } from "../utils";

dotenv.config();

const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
const xaiApiKey = process.env.XAI_API_KEY;

let firecrawlApp: FirecrawlApp | null = null;
function getFirecrawlApp(): FirecrawlApp | null {
  if (!firecrawlApiKey) return null;
  if (!firecrawlApp) firecrawlApp = new FirecrawlApp({ apiKey: firecrawlApiKey });
  return firecrawlApp;
}

const MARKDOWN_TRUNCATE_LENGTH = 3000;

type GrokTweet = { text?: string; link?: string; username?: string };

/**
 * Fetch recent tweets for a user via xAI Grok Responses API with x_search.
 * Uses grok-4 model which supports live X search.
 */
async function getTweetsViaGrok(username: string): Promise<string> {
  if (!xaiApiKey) {
    console.error(`Skipping @${username}: XAI_API_KEY not set.`);
    return "";
  }

  const today = new Date().toISOString().split("T")[0];
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString().split("T")[0];

  const prompt = `List the most recent tweets from @${username} about AI, tech, or coding from the last 72 hours. For each tweet, provide the text and a direct link to the tweet. Return as JSON with format: {"tweets": [{"text": "...", "link": "https://x.com/...", "username": "${username}"}]}. If there are no matching tweets, return {"tweets": []}. Return only valid JSON, no markdown or extra text.`;

  try {
    const res = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${xaiApiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4",
        input: prompt,
        tools: [
          {
            type: "x_search",
            x_search: {
              allowed_x_handles: [username],
              from_date: threeDaysAgo,
              to_date: today,
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Grok API error for @${username}: ${res.status} ${errBody}`);
      return "";
    }

    const data = await res.json() as {
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };

    // Extract and concatenate all text output blocks from the response
    const textBlocks: string[] = [];
    for (const item of data.output ?? []) {
      for (const block of item.content ?? []) {
        if (block.type === "output_text" && block.text) {
          textBlocks.push(block.text);
        }
      }
    }
    const raw = textBlocks.join("");

    if (!raw) {
      console.error(`No response from Grok for @${username}.`);
      return "";
    }

    const parsed = JSON.parse(stripCodeFences(raw)) as { tweets?: GrokTweet[] };
    const tweets = parsed?.tweets ?? [];

    if (tweets.length === 0) {
      console.log(`No tweets from Grok for @${username}.`);
      return `## Tweets from @${username}\n\n(No recent tweets found.)`;
    }

    const lines = tweets.map(
      (t) => `- ${t.text ?? ""}\n  ${t.link ?? `https://x.com/${username}`}`,
    );
    console.log(`Grok: ${tweets.length} tweets for @${username}.`);
    return `## Tweets from @${username}\n\n${lines.join("\n\n")}`;
  } catch (err: any) {
    console.error(`Error fetching tweets for @${username} via Grok:`, err?.message ?? err);
    return "";
  }
}

/**
 * Scrape a single web/Reddit source via Firecrawl.
 */
async function scrapeWebSource(source: string): Promise<string> {
  const app = getFirecrawlApp();
  if (!app) {
    console.error(`Skipping ${source}: FIRECRAWL_API_KEY not set.`);
    return "";
  }

  try {
    const scrapeResult = await app.scrapeUrl(source, {
      formats: ["markdown"],
    });

    const result = scrapeResult as { success?: boolean; markdown?: string; error?: string };
    if (result?.success && result.markdown) {
      const charCount = result.markdown.length;
      let markdown = result.markdown;
      if (markdown.length > MARKDOWN_TRUNCATE_LENGTH) {
        markdown = markdown.slice(0, MARKDOWN_TRUNCATE_LENGTH) + "\n\n[... truncated]";
      }
      console.log(`Scraped ${charCount} chars from ${source}`);
      return `## Source: ${source}\n\n${markdown}`;
    } else {
      const err = result?.error ?? "No markdown in response";
      console.error(`Scrape failed or empty for ${source}:`, err);
      return "";
    }
  } catch (error: any) {
    if (error.statusCode === 429) {
      console.error(`Rate limit exceeded for ${source}. Skipping.`);
    } else {
      console.error(`Error scraping ${source}:`, error);
    }
    return "";
  }
}

/**
 * Scrape all sources in parallel: Firecrawl for web/Reddit, xAI Grok for X profiles.
 * Returns one combined markdown string for the LLM to process.
 */
export async function scrapeSources(
  sources: { identifier: string }[],
): Promise<string> {
  const promises = sources.map((sourceObj) => {
    const source = sourceObj.identifier;

    if (source.includes("x.com")) {
      const match = source.match(/x\.com\/([^\/]+)/);
      if (!match) return Promise.resolve("");
      return getTweetsViaGrok(match[1]);
    }

    return scrapeWebSource(source);
  });

  const results = await Promise.allSettled(promises);
  const sections = results
    .map((r) => (r.status === "fulfilled" ? r.value : ""))
    .filter(Boolean);

  const combined = sections.join("\n\n---\n\n");
  console.log("[scrapeSources] Combined length:", combined.length, "chars");
  return combined;
}
