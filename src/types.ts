/**
 * One trend item from the LLM output, used for Notion database rows.
 */
export interface TrendItem {
  description?: string;
  headline?: string;
  story_or_tweet_link?: string;
  link?: string;
  date_posted?: string;
  source?: string;
}
