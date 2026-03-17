# TrendFinder

**Automated AI/LLM trend aggregator that scrapes news sources and X profiles, analyzes them with AI, and saves structured trends to a Notion database.**

---

## How it works

### 1. Data collection

- **Web sources (Firecrawl)**  
  7 news/blog sites are scraped via Firecrawl `scrapeUrl()` (markdown only, no Firecrawl LLM):
  - `https://www.firecrawl.dev/blog`
  - `https://openai.com/news/`
  - `https://www.anthropic.com/news`
  - `https://news.ycombinator.com/`
  - `https://www.reuters.com/technology/artificial-intelligence/`
  - `https://simonwillison.net/`
  - `https://buttondown.com/ainews/archive/`

- **X profiles (xAI Grok)**  
  7 X accounts are queried via the xAI Grok API (`grok-3-mini-fast`) using an OpenAI‑compatible client:
  - `https://x.com/steipete`
  - `https://x.com/karpathy`
  - `https://x.com/bcherny`
  - `https://x.com/iamtrask`
  - `https://x.com/claudeai`
  - `https://x.com/OpenAI`
  - `https://x.com/theo`

  For each profile, Grok is prompted to return recent AI/tech/coding tweets from the last 24 hours in JSON, which is then formatted into markdown.

- All Firecrawl markdown and Grok tweet sections are concatenated into **one combined markdown string**.

### 2. AI analysis (OpenRouter / Kimi K2.5)

- The combined markdown is sent to **OpenRouter** using the **Kimi K2.5** model.
- Kimi:
  - Extracts AI/LLM/tech trends (stories and tweets),
  - Normalizes them into structured JSON (e.g. description + link + optional metadata),
  - Produces a human‑readable draft summary plus structured items.

### 3. Persistence (Notion database)

- The structured trend items are written to a Notion database via the Notion API.
- Each row represents a **single trend item** with:
  - **Title**: headline or short description
  - **Link**: URL to the story or tweet
  - **Description**: fuller summary
  - **Date**: when it was posted / collected
  - **Source**: origin (e.g. `HN`, `OpenAI blog`, `@karpathy`)

---

## Required API keys

You must create a `.env` file (see setup below) with the following keys:

- **`OPENROUTER_API_KEY`** – from [`https://openrouter.ai`](https://openrouter.ai)  
  - Used by Kimi K2.5 via OpenRouter for trend analysis and extraction.

- **`FIRECRAWL_API_KEY`** – from [`https://www.firecrawl.dev`](https://www.firecrawl.dev)  
  - Used to scrape the 7 news/blog sources as markdown.

- **`XAI_API_KEY`** – from [`https://console.x.ai`](https://console.x.ai)  
  - Used to call xAI’s Grok API (`grok-3-mini-fast`) for recent tweets from the 7 X profiles.

- **`NOTION_API_KEY`** – from [`https://www.notion.so/my-integrations`](https://www.notion.so/my-integrations)  
  - Notion integration token used to create pages in your database.

- **`NOTION_DATABASE_ID`**  
  - The 32‑character database ID from your Notion database URL, e.g. in  
    `https://www.notion.so/workspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`

No Slack, Discord, Together AI, or OpenAI keys are required; those integrations have been removed or replaced.

---

## Notion database setup

Create a Notion database (table view is easiest) with **exactly** these properties:

- **Title** (type: `title`)  
  - The main title of the row; used for the trend headline.

- **Link** (type: `url`)  
  - Direct link to the story or tweet (e.g. blog post URL or `https://x.com/...`).

- **Description** (type: `rich_text`)  
  - Short summary or explanation of why this item is interesting.

- **Date** (type: `date`)  
  - Date the story/tweet was posted or the date the trend was collected (the app will fill this with an ISO date like `YYYY-MM-DD`).

- **Source** (type: `select`)  
  - Optional; use values like `HN`, `OpenAI`, `Anthropic`, `@karpathy`, etc.  
  - The app will create select options on the fly if they don’t yet exist.

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/blizzardbase/trendFinder.git
cd trendFinder
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Then edit `.env` and set:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
XAI_API_KEY=your_xai_api_key_here
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_notion_database_id_here
```

### 3. Run the pipeline

Run a single end-to-end cycle:

```bash
npm run run
```

This will:

- Scrape the 7 web sources via Firecrawl,
- Fetch recent tweets from the 7 X profiles via Grok,
- Analyze everything with Kimi K2.5 via OpenRouter,
- Write one row per trend item into your Notion database.

You can also use:

```bash
npm run start
```

to run the entrypoint under `nodemon` for development (auto‑restart on file changes).

---

## Tech stack

- **Language**: TypeScript (Node.js)
- **Web scraping**: Firecrawl (`@mendable/firecrawl-js`) with `scrapeUrl()`
- **Trend analysis**: OpenRouter (Kimi K2.5)
- **X profile fetch**: xAI Grok (`grok-3-mini-fast`) via OpenAI‑compatible client
- **Storage**: Notion API (`@notionhq/client`)

---

## Credits and license

- **Original project**: [`ericciarla/trendFinder`](https://github.com/ericciarla/trendFinder) (MIT license)  
- **This fork**: major changes to use OpenRouter (Kimi K2.5), Notion, Firecrawl `scrapeUrl`, and xAI Grok for X profiles, while preserving the original spirit of automated trend discovery.

This project remains under the **MIT license** inherited from the original repository.

