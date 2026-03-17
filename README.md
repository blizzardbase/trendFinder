# Trend Finder 🔦

**Stay on top of trending topics on social media — all in one place.**

Trend Finder collects and analyzes posts from key influencers, then saves trends to a Notion database when it detects new trends or product launches. This has been a complete game-changer for the Firecrawl marketing team by:

- **Saving time** normally spent manually searching social channels
- **Keeping you informed** of relevant, real-time conversations
- **Enabling rapid response** to new opportunities or emerging industry shifts

_Spend less time hunting for trends and more time creating impactful campaigns._

## Watch the Demo & Tutorial video

[![Thumbnail](https://i.ytimg.com/vi/puimQSun92g/hqdefault.jpg)](https://www.youtube.com/watch?v=puimQSun92g)

Learn how to set up Trend Finder and start monitoring trends in this video!

## How it Works

1. **Data Collection** 📥
   - Scrapes websites and X profile pages via Firecrawl (markdown); no X API token needed
   - Runs on a scheduled basis using cron jobs

2. **AI Analysis** 🧠
   - Processes collected content through OpenRouter (Kimi K2.5)
   - Identifies emerging trends, releases, and news.
   - Analyzes sentiment and relevance

3. **Notion Database** 📋
   - When significant trends are detected, writes one row per trend to your Notion database
   - Each row includes title, link, description, date, and optional source
   - Enables quick review and response to emerging opportunities

## Features

- 🤖 AI-powered trend analysis using OpenRouter (Kimi K2.5)
- 📱 X profile pages scraped via Firecrawl (with other news/blog sources)
- 📋 Trends saved to a Notion database (one row per trend)
- 🔍 Website monitoring with Firecrawl
- ⏱️ Scheduled monitoring using cron jobs

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker
- Docker Compose
- Notion workspace with a database and integration token
- API keys for required services

## Notion Setup

1. Create a database in Notion with these properties (names must match exactly):
   - **Title** (title)
   - **Link** (url)
   - **Description** (rich text)
   - **Date** (date)
   - **Source** (select, optional)

2. Create an integration at [Notion My Integrations](https://www.notion.so/my-integrations), copy the API key.

3. Share the database with your integration (database page → ... → Add connections).

4. Copy the database ID from the database URL: `https://notion.so/workspace/DATABASE_ID?v=...` (the 32-character UUID).

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```
# Required: API key for OpenRouter (https://openrouter.ai/) for trend analysis
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Required if monitoring web pages (https://www.firecrawl.dev/)
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Required: Notion integration token (https://www.notion.so/my-integrations)
NOTION_API_KEY=your_notion_api_key_here

# Required: Notion database ID where trends are saved (UUID from database URL)
NOTION_DATABASE_ID=your_notion_database_id_here
```

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd trend-finder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application:**
   ```bash
   # Development mode with hot reloading
   npm run start

   # Build for production
   npm run build
   ```

## Using Docker

1. **Build the Docker image:**
   ```bash
   docker build -t trend-finder .
   ```

2. **Run the Docker container:**
   ```bash
   docker run -d -p 3000:3000 --env-file .env trend-finder
   ```

## Using Docker Compose

1. **Start the application with Docker Compose:**
   ```bash
   docker-compose up --build -d
   ```

2. **Stop the application with Docker Compose:**
   ```bash
   docker-compose down
   ```

## Project Structure

```
trend-finder/
├── src/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── types.ts        # Shared types (e.g. TrendItem)
│   └── index.ts        # Application entry point
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
