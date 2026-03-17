import OpenAI from "openai";
import dotenv from "dotenv";
import type { TrendItem } from "../types";

dotenv.config();

export interface GenerateDraftResult {
  draftPost: string;
  items: TrendItem[];
}

/**
 * Generate a draft and trend items from raw scraped content (markdown + tweet sections).
 * The LLM extracts and summarizes AI/LLM trends from the content in one step.
 */
export async function generateDraft(
  rawContent: string,
): Promise<GenerateDraftResult> {
  console.log(
    `Generating draft from scraped content (${rawContent.length} characters)...`,
  );

  try {
    const currentDate = new Date().toLocaleDateString();
    const header = `🚀 AI and LLM Trends on X for ${currentDate}\n\n`;

    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      {
        role: "system",
        content:
          "You are given raw scraped content from multiple web pages and/or tweet sections. " +
          "Extract the most relevant AI, LLM, or machine learning trends: headlines, posts, and links. " +
          "Return strictly valid JSON with a key 'interestingTweetsOrStories' containing an array of items. " +
          "Each item must have 'description' (short summary or headline) and 'story_or_tweet_link' (URL). " +
          "Optionally include 'headline', 'link', 'date_posted', or 'source' if useful.",
      },
      {
        role: "user",
        content: rawContent,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "moonshotai/kimi-k2.5",
      messages,
    });

    const rawJSON = completion.choices[0].message.content;
    if (!rawJSON) {
      console.log("No JSON output returned from model.");
      return { draftPost: header + "No output.", items: [] };
    }
    console.log(rawJSON);

    const jsonStr = rawJSON
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const parsedResponse = JSON.parse(jsonStr);

    const contentArray: TrendItem[] =
      parsedResponse.interestingTweetsOrStories || parsedResponse.stories || [];
    if (contentArray.length === 0) {
      return {
        draftPost: header + "No trending stories or tweets found at this time.",
        items: [],
      };
    }

    const draftPost =
      header +
      contentArray
        .map(
          (item: TrendItem) =>
            `• ${item.description || item.headline}\n  ${
              item.story_or_tweet_link || item.link
            }`,
        )
        .join("\n\n");

    return { draftPost, items: contentArray };
  } catch (error) {
    console.error("Error generating draft post", error);
    return {
      draftPost: "Error generating draft post.",
      items: [],
    };
  }
}
