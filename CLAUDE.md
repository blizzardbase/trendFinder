# TrendFinder

Automated AI trend aggregator that scrapes 51 sources, identifies consolidated trends using DeepSeek V3.2, and writes them to Notion.

## Quick Reference

- **Run pipeline**: `npm run run` (single end-to-end cycle)
- **Dev mode**: `npm run start` (nodemon, auto-restart on changes)
- **Run cadence**: Once every 3 days
- **Language**: TypeScript / Node.js

## Architecture

Scrape (Firecrawl + Grok-4) → Consolidate (DeepSeek V3.2 via OpenRouter) → Save (Notion)

### Pipeline flow
1. `getCronSources.ts` — returns 51 source URLs (20 Firecrawl + 31 X profiles)
2. `scrapeSources.ts` — scrapes all sources **in parallel** (Firecrawl for web/Reddit/podcasts/blogs, Grok-4 with `x_search` for X profiles, 72-hour window). Lazy Firecrawl init; fresh dates per call.
3. `generateDraft.ts` — DeepSeek V3.2 identifies cross-source trends (not individual news). Category output validated against `TREND_CATEGORIES` in `utils.ts`. Explicit error logging on JSON parse failure.
4. `sendDraft.ts` — writes Notion rows **in parallel** via `Promise.allSettled` with partial success reporting (Title, Description, Reasoning, Sources, Category, Date)
5. `utils.ts` — shared utilities: `stripCodeFences()`, `TREND_CATEGORIES` constant

### API dependencies
- **Firecrawl** — web scraping (FIRECRAWL_API_KEY)
- **xAI Grok-4** — live X/Twitter search (XAI_API_KEY)
- **OpenRouter** — LLM for trend analysis (OPENROUTER_API_KEY)
- **Notion** — storage (NOTION_API_KEY + NOTION_DATABASE_ID)

## Sources (51)

- **Web (10)**: firecrawl.dev, openai.com, anthropic.com (news + research), HN, Reuters AI, simonwillison.net, buttondown AI news, deepmind.google, ai.meta.com
- **Reddit (2)**: r/MachineLearning, r/LocalLLaMA (via old.reddit.com)
- **Podcasts (6)**: Latent Space, Training Data, No Priors, Unsupervised Learning, MAD Podcast, AI & I by Every
- **Blogs (2)**: Anthropic Engineering, Claude Blog
- **X (31)**: @karpathy, @ylecun, @ilyasut, @fchollet, @rasbt, @natolambert, @simonw, @GoogleResearch, @claudeai, @theo, @swyx, @joshwoodward, @kevinweil, @petergyang, @thenanyu, @realmadhuguru, @AmandaAskell, @_catwu, @trq212, @amasad, @rauchg, @alexalbert__, @levie, @ryolu_, @garrytan, @mattturck, @zarazhangrui, @nikunj, @steipete, @danshipper, @adityaag, @sama

## Important Notes

- X fetching requires Grok-4 (only model supporting x_search); grok-3-mini-fast does NOT work
- Notion database ID: check .env (columns: Title, Description, Reasoning, Sources, Category, Date)
- Deeper architecture docs in `context.md`

## Git Workflow

- Never commit directly to main — use feature branches
- Always `git pull` before starting work
- Never auto-run `git push`, `git commit`, or `rm` — always confirm first
- Show `git diff` before any push

## Security

- All API keys live in `.env` — never commit this file
- Never commit strings matching: `sk-`, `ghp_`, `AKIA`, `xox`
- No plaintext passwords or tokens in code — use environment variables only
- `.env.example` shows structure without real values

## Code Standards

- 300-line max per file — split if it grows beyond this
- Single-responsibility functions
- No dead code — delete unused code, don't comment it out
- No `console.log` left in committed code (use proper logging or remove after debugging)
- Update `context.md` at end of any significant work session
