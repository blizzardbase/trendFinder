import dotenv from "dotenv";

dotenv.config();

export async function getCronSources(): Promise<{ identifier: string }[]> {
  try {
    console.log("Fetching sources...");

    const hasFirecrawlKey = !!process.env.FIRECRAWL_API_KEY;
    const hasXaiKey = !!process.env.XAI_API_KEY;
    console.log(
      "[getCronSources] FIRECRAWL_API_KEY:",
      hasFirecrawlKey ? "set" : "not set",
      "| XAI_API_KEY:",
      hasXaiKey ? "set" : "not set",
    );

    const firecrawlSources: { identifier: string }[] = hasFirecrawlKey
      ? [
          { identifier: "https://www.firecrawl.dev/blog" },
          { identifier: "https://openai.com/news/" },
          { identifier: "https://www.anthropic.com/news" },
          { identifier: "https://news.ycombinator.com/" },
          { identifier: "https://www.reuters.com/technology/artificial-intelligence/" },
          { identifier: "https://simonwillison.net/" },
          { identifier: "https://buttondown.com/ainews/archive/" },
          { identifier: "https://anthropic.com/research" },
          { identifier: "https://deepmind.google/research" },
          { identifier: "https://ai.meta.com/blog" },
          { identifier: "https://old.reddit.com/r/MachineLearning/" },
          { identifier: "https://old.reddit.com/r/LocalLLaMA/" },
        ]
      : [];

    const xProfileSources: { identifier: string }[] = hasXaiKey
      ? [
          { identifier: "https://x.com/karpathy" },
          { identifier: "https://x.com/ylecun" },
          { identifier: "https://x.com/ilyasut" },
          { identifier: "https://x.com/fchollet" },
          { identifier: "https://x.com/rasbt" },
          { identifier: "https://x.com/natolambert" },
          { identifier: "https://x.com/simonw" },
          { identifier: "https://x.com/GoogleResearch" },
          { identifier: "https://x.com/claudeai" },
          { identifier: "https://x.com/theo" },
        ]
      : [];

    const sources = [...firecrawlSources, ...xProfileSources];
    console.log("[getCronSources] Returning", sources.length, "sources (Firecrawl:", firecrawlSources.length, ", X profiles:", xProfileSources.length, ")");

    return sources;
  } catch (error) {
    console.error(error);
    return [];
  }
}
