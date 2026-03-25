# TrendFinder

**Automated AI trend aggregator that scrapes 22 sources across the web, Reddit, and X, identifies consolidated trends using AI, and saves them to a Notion database with reasoning and evidence.**

Unlike a simple news feed, TrendFinder doesn't just list individual stories. It reads everything together and identifies **emerging themes** that appear across multiple sources — so you see the signal, not the noise.

---

## How it works

### 1. Data collection (22 sources)

- **Web sources (Firecrawl)** — 10 news/blog/research sites scraped as markdown:
  - `firecrawl.dev/blog`, `openai.com/news`, `anthropic.com/news`, `anthropic.com/research`
  - `news.ycombinator.com`, `reuters.com/technology/artificial-intelligence`
  - `simonwillison.net`, `buttondown.com/ainews/archive`
  - `deepmind.google/research`, `ai.meta.com/blog`

- **Reddit (Firecrawl)** — 2 subreddits scraped via `old.reddit.com`:
  - `r/MachineLearning`, `r/LocalLLaMA`

- **X profiles (xAI Grok)** — 10 accounts queried via the xAI Grok-4 Responses API with live `x_search` (72-hour window):
  - `@karpathy`, `@ylecun`, `@ilyasut`, `@fchollet`, `@rasbt`
  - `@natolambert`, `@simonw`, `@GoogleResearch`, `@claudeai`, `@theo`

All scraped content is combined into one markdown string for analysis.

### 2. Trend consolidation (DeepSeek V3.2 via OpenRouter)

The combined content is sent to **DeepSeek V3.2** via OpenRouter. The model:
- Reads all sources together
- Identifies **emerging trends** that appear across 2+ sources
- Provides reasoning and evidence for each trend
- Categorizes trends (Security, AI Models, Tool Launches, Industry Shifts, Developer Experience, Open Source)
- Aims for 3-7 quality trends per run

### 3. Notion database

Each consolidated trend is saved as one row with:
- **Title** — trend name
- **Description** — what the trend is and why it matters
- **Reasoning** — evidence from the sources that led to identification
- **Sources** — which URLs/profiles contributed
- **Category** — trend category
- **Date** — date of analysis

---

## Run cadence

**Recommended: once every 3 days.**

- Web/Reddit sources need 2-3 days to accumulate fresh content
- X profiles use a 72-hour tweet window that aligns with this cadence
- Running more frequently produces repetitive results

---

## Required API keys

Create a `.env` file (see setup below) with:

- **`OPENROUTER_API_KEY`** — from [openrouter.ai](https://openrouter.ai). Used by DeepSeek V3.2 for trend consolidation.
- **`FIRECRAWL_API_KEY`** — from [firecrawl.dev](https://www.firecrawl.dev). Used to scrape web and Reddit sources.
- **`XAI_API_KEY`** — from [console.x.ai](https://console.x.ai). Used for Grok-4 with live X search.
- **`NOTION_API_KEY`** — from [notion.so/my-integrations](https://www.notion.so/my-integrations). Notion integration token.
- **`NOTION_DATABASE_ID`** — the 32-character ID from your Notion database URL.

---

## Notion database setup

Create a Notion database (table view) with these properties:

| Property | Type | Description |
|----------|------|-------------|
| Title | title | Trend name |
| Description | rich_text | What the trend is and why it matters |
| Reasoning | rich_text | Evidence from sources |
| Sources | rich_text | Contributing URLs/profiles |
| Category | select | Security, AI Models, Tool Launches, Industry Shifts, Developer Experience, Open Source, Other |
| Date | date | Date of analysis (auto-filled) |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/blizzardbase/trendFinder.git
cd trendFinder
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
XAI_API_KEY=your_xai_api_key_here
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_notion_database_id_here
```

### 3. Run the pipeline

```bash
npm run run
```

This will scrape all 22 sources, identify consolidated trends, and write them to your Notion database.

For development with auto-restart:

```bash
npm run start
```

---

## Tech stack

- **Language**: TypeScript (Node.js)
- **Web scraping**: Firecrawl (`@mendable/firecrawl-js`)
- **X profile search**: xAI Grok-4 Responses API with `x_search`
- **Trend analysis**: DeepSeek V3.2 via OpenRouter
- **Storage**: Notion API (`@notionhq/client`)

---

## Credits and license

- **Original project**: [`ericciarla/trendFinder`](https://github.com/ericciarla/trendFinder) (MIT license)
- **This fork**: major rewrite — trend consolidation instead of news listing, DeepSeek V3.2, Grok-4 live search, expanded sources, Notion with reasoning.

This project remains under the **MIT license** inherited from the original repository.
