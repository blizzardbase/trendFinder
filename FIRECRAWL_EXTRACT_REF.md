# Firecrawl extract() — current prompt, schema, and call

## 1. Exact prompt passed to `app.extract()`

```ts
const currentDate = new Date().toLocaleDateString();  // e.g. "3/7/2025"
const promptForFirecrawl = `
Return only today's AI or LLM related story or post headlines and links in JSON format from the page content. 
They must be posted today, ${currentDate}. The format should be:
{
  "stories": [
    {
      "headline": "headline1",
      "link": "link1",
      "date_posted": "YYYY-MM-DD"
    },
    ...
  ]
}
If there are no AI or LLM stories from today, return {"stories": []}.

The source link is ${source}. 
If a story link is not absolute, prepend ${source} to make it absolute. 
Return only pure JSON in the specified format (no extra text, no markdown, no \`\`\`).
`;
```

So the prompt:
- Requires "only today's" and "must be posted today, {currentDate}".
- Asks for AI/LLM stories in a fixed JSON shape.
- Many listing pages (HN, blog indexes) don’t expose per-item dates; the extract model often correctly returns `{"stories": []}` when it can’t confirm "today".

---

## 2. Exact Zod schema passed

```ts
const StorySchema = z.object({
  headline: z.string().describe("Story or post headline"),
  link: z.string().describe("A link to the post or story"),
  date_posted: z.string().describe("The date the story or post was published"),
});

const StoriesSchema = z.object({
  stories: z
    .array(StorySchema)
    .describe("A list of today's AI or LLM-related stories"),
});
```

So the schema matches the prompt: top-level `stories` array of `{ headline, link, date_posted }`.

---

## 3. Full extract call (all arguments)

```ts
const scrapeResult = await app.extract([source], {
  prompt: promptForFirecrawl,
  schema: StoriesSchema,
});
```

- **First argument:** `[source]` — array of one URL, e.g. `["https://news.ycombinator.com/"]`.
- **Second argument (ExtractParams):**
  - `prompt`: the string above.
  - `schema`: `StoriesSchema` (Zod). The SDK converts it to JSON Schema and sends that to `/v1/extract`.
- **Not passed:** `systemPrompt`, `allowExternalLinks`, `enableWebSearch`, `includeSubdomains`, `origin`, `showSources` (all optional).

The SDK sends to the API: `{ urls: [source], prompt, schema: <json-schema>, origin: "api-sdk" }` (see SDK source).

---

## 4. Why you get empty `stories`

- The prompt is very strict: "only today's" and "must be posted today".
- Listing pages (HN, blog archives, etc.) often don’t have per-item publish dates; the extract model has no way to satisfy "posted today" and returns `{"stories": []}`.

---

## 5. Suggested fix (in code)

- **Option A (recommended first):** Loosen the prompt: ask for "recent" or "visible" AI/LLM headlines and links; say "use today’s date if no date is visible" so the model can fill `date_posted` without requiring proof of "today". Keep using `extract()` and the same schema.
- **Option B:** Switch to `scrapeUrl()` to get raw markdown/HTML, then parse (e.g. with your existing OpenRouter/Kimi step or a small regex/parser) to build the `stories` array. More control, more code.

Implementing Option A in `scrapeSources.ts` next.
