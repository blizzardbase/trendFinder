# TrendFinder — project context

## Current state

**Pipeline is working.** Scrape (Firecrawl + xAI Grok) → combined markdown → OpenRouter (Kimi K2.5) → Notion.

- **What works**
  - End-to-end: getCronSources → scrapeSources → generateDraft → sendDraft.
  - **Firecrawl** for non-X sources: 7 news/blog URLs (firecrawl.dev, openai, anthropic, HN, reuters, simonwillison, buttondown) scraped via scrapeUrl with `formats: ["markdown"]`; markdown truncated to 3000 chars per source. Requires `FIRECRAWL_API_KEY`.
  - **xAI Grok** for X profiles: 7 accounts (steipete, karpathy, bcherny, iamtrask, claudeai, OpenAI, theo) fetched via `getTweetsViaGrok()` — OpenAI-compatible client, baseURL `https://api.x.ai/v1`, model `grok-3-mini-fast`. Prompt asks for recent AI/tech/coding tweets in JSON `{tweets: [{text, link, username}]}`; response is formatted as a markdown section. Requires `XAI_API_KEY`.
  - Both outputs are combined into one markdown string (sections joined with `---`) and passed to generateDraft.
  - OpenRouter (Kimi K2.5) receives combined content, returns JSON; markdown code-fence stripping before `JSON.parse` works.
  - Notion: one database row per trend item (Title, Link, Description, Date, Source).
  - Dotenv loaded in `index.ts` before any other app code (dynamic import of cron).

- **What’s been changed from the original repo**
  - OpenAI → OpenRouter (Kimi K2.5); Slack/Discord → Notion (per-item rows).
  - Firecrawl: extract() removed; scrapeUrl() only for non-X URLs.
  - X profiles: use xAI Grok API (not Firecrawl, not X/Twitter API); `XAI_API_KEY` in .env.example.
  - getCronSources returns Firecrawl sources when `FIRECRAWL_API_KEY` set, X profile sources when `XAI_API_KEY` set.
  - Dotenv load order fix; Kimi JSON fence stripping; `npm run run` for one-shot run.

## Changes made (summary)

| Area | Change |
|------|--------|
| LLM | OpenRouter (Kimi K2.5); dotenv load order fixed. |
| Output | Notion database, one row per trend. |
| Parsing | Strip \`\`\`json / \`\`\` from Kimi response before parse. |
| Firecrawl | scrapeUrl() for 7 news/blog sources only. |
| X profiles | xAI Grok (grok-3-mini-fast) via getTweetsViaGrok(); XAI_API_KEY; combined with Firecrawl output. |

## Limitations

- Firecrawl 403s or rate limits depend on API key/plan.
- xAI and OpenRouter need network access; run locally with valid keys for full flow.

## Architecture decisions

- **OpenRouter** — trend draft and extraction (Kimi K2.5).
- **Notion** — structured rows (Title, Link, Description, Date, Source).
- **Firecrawl** — fetch markdown for news/blog URLs only.
- **xAI Grok** — fetch recent tweets for 7 X profiles; OpenAI-compatible client, prompt returns JSON; no X/Twitter bearer token.
