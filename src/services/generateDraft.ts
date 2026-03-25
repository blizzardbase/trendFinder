import OpenAI from "openai";
import dotenv from "dotenv";
import type { TrendItem } from "../types";

dotenv.config();

export interface GenerateDraftResult {
  draftPost: string;
  items: TrendItem[];
}

/**
 * Analyze scraped content from multiple sources and identify consolidated trends.
 * Uses DeepSeek V3.2 via OpenRouter for reasoning and pattern recognition.
 */
export async function generateDraft(
  rawContent: string,
): Promise<GenerateDraftResult> {
  console.log(
    `Generating draft from scraped content (${rawContent.length} characters)...`,
  );

  try {
    const currentDate = new Date().toLocaleDateString();
    const header = `AI Trend Analysis for ${currentDate}\n\n`;

    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      {
        role: "system",
        content:
          "You are an AI trend analyst. You will receive raw scraped content from multiple web pages, Reddit posts, and X (Twitter) profiles about AI, LLMs, and technology.\n\n" +
          "Your job is NOT to list individual news items. Instead, you must:\n" +
          "1. Read ALL the content together\n" +
          "2. Identify EMERGING TRENDS or THEMES that appear across multiple sources\n" +
          "3. Only report trends that have evidence from at least 2 different sources\n\n" +
          "For each trend, provide:\n" +
          "- trend_name: A clear, concise name (e.g. \"Supply Chain Security Attacks on AI Libraries\")\n" +
          "- description: What this trend is about and WHY it matters (2-3 sentences)\n" +
          "- reasoning: What specific evidence from the sources led you to identify this as a trend\n" +
          "- sources: Array of the source URLs or profile names that contributed to this trend\n" +
          '- category: One of "Security", "AI Models", "Tool Launches", "Industry Shifts", "Developer Experience", "Open Source", or "Other"\n\n' +
          'Return strictly valid JSON: {"trends": [...]}\n\n' +
          "Important rules:\n" +
          "- Minimum 2 sources per trend (that's what makes it a trend, not just news)\n" +
          "- Aim for 3-7 trends per run — quality over quantity\n" +
          "- Do NOT just repackage individual news items as \"trends\"\n" +
          "- If you genuinely only find 1-2 trends, that's fine — don't pad",
      },
      {
        role: "user",
        content: rawContent,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-v3.2",
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

    const contentArray: TrendItem[] = parsedResponse.trends || [];
    if (contentArray.length === 0) {
      return {
        draftPost: header + "No consolidated trends found at this time.",
        items: [],
      };
    }

    const draftPost =
      header +
      contentArray
        .map(
          (item: TrendItem) =>
            `## ${item.trend_name}\n${item.description}\nSources: ${(item.sources || []).join(", ")}`,
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
