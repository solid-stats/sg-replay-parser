/**
 * Represents a replay link extracted from the sg.zone/replays page
 */
export interface ReplayLink {
  /** Full URL to the replay page (e.g., '/replays/1657308763') */
  url: string;
  /** Extracted ID from URL (e.g., '1657308763') */
  replayId: string;
  /** Optional: mission name if visible in the listing */
  title?: string;
  /** Optional: date if visible on listing */
  date?: Date;
}

/**
 * Result of fetching a replays page
 */
export interface FetchReplaysPageResult {
  /** Array of replay links found on the page */
  replays: ReplayLink[];
  /** Total number of pages available (from pagination) */
  totalPages: number;
  /** Current page number */
  currentPage: number;
}

/**
 * Options for the discover new replays function
 */
export interface DiscoverOptions {
  /** Maximum number of pages to fetch (default: 10) */
  maxPages?: number;
  /** Stop when finding this many known replays in a row (default: 5) */
  stopAfterKnownCount?: number;
}
