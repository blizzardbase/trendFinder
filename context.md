# TrendFinder — project context

## Current state

**Pipeline is working.** Scrape (Firecrawl + xAI Grok) → combined markdown → OpenRouter (DeepSeek V3.2) → Notion.

Run cadence: **once every 3 days.** X profiles use a 72-hour tweet window that aligns with this cadence. Note: with 51 sources now, cadence/batching strategy is under review.

- **What works**
  - End-to-end: getCronSources → scrapeSources → generateDraft → sendDraft.
  - **All 51 sources scraped in parallel** via `Promise.allSettled` for speed.
  - **Firecrawl** for web sources, Reddit, podcasts, and blogs: 20 URLs scraped via scrapeUrl with `formats: ["markdown"]`; markdown truncated to 3000 chars per source. Reddit uses old.reddit.com for scraper compatibility. Requires `FIRECRAWL_API_KEY`.
  - **xAI Grok** for X profiles: 31 accounts fetched via `getTweetsViaGrok()` — Grok Responses API (`/v1/responses`), model `grok-4`, with `x_search` tool for live X access. 72-hour tweet window. Requires `XAI_API_KEY`.
  - Both outputs are combined into one markdown string (sections joined with `---`) and passed to generateDraft.
  - **DeepSeek V3.2** via OpenRouter identifies consolidated trends. Category output validated against `TREND_CATEGORIES` constant (falls back to "Other" if LLM returns unexpected value).
  - **Notion**: rows written in parallel via `Promise.all` (Title, Description, Reasoning, Sources, Category, Date).
  - Shared utilities in `src/utils.ts`: `stripCodeFences()` for LLM JSON parsing, `TREND_CATEGORIES` as single source of truth for category values.
  - Dotenv loaded in `index.ts` before any other app code (dynamic import of cron).

## Sources (51 total)

### Web sources (10) — via Firecrawl
- firecrawl.dev/blog, openai.com/news, anthropic.com/news, news.ycombinator.com
- reuters.com/technology/artificial-intelligence, simonwillison.net, buttondown.com/ainews/archive
- anthropic.com/research, deepmind.google/research, ai.meta.com/blog

### Reddit (2) — via Firecrawl on old.reddit.com
- r/MachineLearning, r/LocalLLaMA

### Podcasts (6) — via Firecrawl
- Latent Space (latent.space)
- Training Data (sequoiacap.com/trainingdata)
- No Priors (no-priors.com)
- Unsupervised Learning (danielmiessler.com/podcast)
- MAD Podcast (mattturck.com/podcast)
- AI & I by Every (every.to/podcast)

### Official Blogs (2) — via Firecrawl
- Anthropic Engineering (anthropic.com/engineering) — technical deep-dives
- Claude Blog (claude.com/blog) — product announcements

### X profiles (31) — via xAI Grok-4 with x_search
**Original 10:**
- @karpathy, @ylecun, @ilyasut, @fchollet, @rasbt
- @natolambert, @simonw, @GoogleResearch, @claudeai, @theo

**Added 2026-04-01 (21 new):**
- @swyx, @joshwoodward, @kevinweil, @petergyang, @thenanyu
- @realmadhuguru, @AmandaAskell, @_catwu, @trq212, @amasad
- @rauchg, @alexalbert__, @levie, @ryolu_, @garrytan
- @mattturck, @zarazhangrui, @nikunj, @steipete, @danshipper
- @adityaag, @sama

## Architecture decisions

- **DeepSeek V3.2 via OpenRouter** — trend consolidation and reasoning. Strong reasoning at low cost.
- **xAI Grok-4 Responses API** — live X search via `x_search` tool. Only grok-4 family supports this.
- **Notion** — structured trend rows (Title, Description, Reasoning, Sources, Category, Date).
- **Firecrawl** — fetch markdown for web URLs, Reddit, podcasts, and blogs.
- **3-day cadence** — web sources need 2-3 days to accumulate fresh content; 72-hour tweet window matches.

## Limitations / open questions

- Firecrawl 403s or rate limits depend on API key/plan. With 20 Firecrawl sources now (up from 12), rate limits are more likely.
- xAI and OpenRouter need network access; run locally with valid keys for full flow.
- Grok-4 is more expensive than grok-3-mini-fast but required for live X search. Now hitting 31 X profiles per run — cost will increase.
- **51 sources is a significant increase from 22.** Harish is evaluating when/how to run this — may need batching, tiered runs, or longer intervals.
