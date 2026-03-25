# TrendFinder — project context

## Current state

**Pipeline is working.** Scrape (Firecrawl + xAI Grok) → combined markdown → OpenRouter (DeepSeek V3.2) → Notion.

Run cadence: **once every 3 days.** X profiles use a 72-hour tweet window that aligns with this cadence.

- **What works**
  - End-to-end: getCronSources → scrapeSources → generateDraft → sendDraft.
  - **Firecrawl** for web sources + Reddit: 12 URLs (news/blog sites + 2 subreddits) scraped via scrapeUrl with `formats: ["markdown"]`; markdown truncated to 3000 chars per source. Reddit uses old.reddit.com for scraper compatibility. Requires `FIRECRAWL_API_KEY`.
  - **xAI Grok** for X profiles: 10 accounts fetched via `getTweetsViaGrok()` — Grok Responses API (`/v1/responses`), model `grok-4`, with `x_search` tool for live X access. 72-hour tweet window. Requires `XAI_API_KEY`.
  - Both outputs are combined into one markdown string (sections joined with `---`) and passed to generateDraft.
  - **DeepSeek V3.2** via OpenRouter receives combined content, identifies consolidated trends across sources (not individual news items), returns JSON with trend_name, description, reasoning, sources, category.
  - **Notion**: one database row per consolidated trend (Title, Description, Reasoning, Sources, Category, Date).
  - Dotenv loaded in `index.ts` before any other app code (dynamic import of cron).

## Sources (22 total)

### Web sources (10) — via Firecrawl
- firecrawl.dev/blog, openai.com/news, anthropic.com/news, news.ycombinator.com
- reuters.com/technology/artificial-intelligence, simonwillison.net, buttondown.com/ainews/archive
- anthropic.com/research, deepmind.google/research, ai.meta.com/blog

### Reddit (2) — via Firecrawl on old.reddit.com
- r/MachineLearning, r/LocalLLaMA

### X profiles (10) — via xAI Grok-4 with x_search
- @karpathy, @ylecun, @ilyasut, @fchollet, @rasbt
- @natolambert, @simonw, @GoogleResearch, @claudeai, @theo

## Architecture decisions

- **DeepSeek V3.2 via OpenRouter** — trend consolidation and reasoning. Strong reasoning at low cost.
- **xAI Grok-4 Responses API** — live X search via `x_search` tool. Only grok-4 family supports this.
- **Notion** — structured trend rows (Title, Description, Reasoning, Sources, Category, Date).
- **Firecrawl** — fetch markdown for web URLs and Reddit.
- **3-day cadence** — web sources need 2-3 days to accumulate fresh content; 72-hour tweet window matches.

## Limitations

- Firecrawl 403s or rate limits depend on API key/plan.
- xAI and OpenRouter need network access; run locally with valid keys for full flow.
- Grok-4 is more expensive than grok-3-mini-fast but required for live X search.
