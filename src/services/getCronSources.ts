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
          // Podcasts
          { identifier: "https://www.latent.space/" },
          { identifier: "https://www.sequoiacap.com/trainingdata/" },
          { identifier: "https://www.no-priors.com/" },
          { identifier: "https://danielmiessler.com/podcast" },
          { identifier: "https://www.mattturck.com/podcast" },
          { identifier: "https://every.to/podcast" },
          // Official blogs
          { identifier: "https://www.anthropic.com/engineering" },
          { identifier: "https://claude.com/blog" },
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
          { identifier: "https://x.com/swyx" },
          { identifier: "https://x.com/joshwoodward" },
          { identifier: "https://x.com/kevinweil" },
          { identifier: "https://x.com/petergyang" },
          { identifier: "https://x.com/thenanyu" },
          { identifier: "https://x.com/realmadhuguru" },
          { identifier: "https://x.com/AmandaAskell" },
          { identifier: "https://x.com/_catwu" },
          { identifier: "https://x.com/trq212" },
          { identifier: "https://x.com/amasad" },
          { identifier: "https://x.com/rauchg" },
          { identifier: "https://x.com/alexalbert__" },
          { identifier: "https://x.com/levie" },
          { identifier: "https://x.com/ryolu_" },
          { identifier: "https://x.com/garrytan" },
          { identifier: "https://x.com/mattturck" },
          { identifier: "https://x.com/zarazhangrui" },
          { identifier: "https://x.com/nikunj" },
          { identifier: "https://x.com/steipete" },
          { identifier: "https://x.com/danshipper" },
          { identifier: "https://x.com/adityaag" },
          { identifier: "https://x.com/sama" },
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
