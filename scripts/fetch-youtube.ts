import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { normalizeGameName } from "../lib/normalize";

const QUERIES = [
  "roblox new game",
  "roblox new update",
  "roblox codes",
  "roblox gameplay",
  "roblox tower defense",
  "steam new game",
  "steam upcoming game",
  "steam gameplay",
] as const;

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const CACHE_PATH = path.join(process.cwd(), "data", "youtube-cache.json");
const MAX_RECENT_VIDEO_IDS = 300;
const FETCH_TIMEOUT_MS = 12_000;
const STOP_WORDS = new Set([
  "new",
  "update",
  "updates",
  "codes",
  "gameplay",
  "guide",
  "tips",
  "trailer",
  "release",
  "official",
  "best",
  "how",
  "to",
  "roblox",
  "steam",
  "live",
  "beta",
  "alpha",
  "launch",
  "review",
  "walkthrough",
  "playthrough",
  "part",
  "episode",
  "ep",
  "vs",
  "with",
  "from",
  "the",
  "a",
  "an",
  "in",
  "on",
  "for",
  "and",
  "pc",
  "mobile",
]);
const BAD_PHRASES = new Set([
  "tower defense",
  "new game",
  "new update",
  "update",
  "codes",
  "gameplay",
  "gameplay trailer",
  "trailer",
  "guide",
  "tips",
]);

type SearchItem = {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
  };
};

type SearchResponse = {
  items?: SearchItem[];
  error?: {
    code?: number;
    message?: string;
    errors?: Array<{
      reason?: string;
      message?: string;
    }>;
  };
};

type CacheFile = {
  queries: Record<string, string>;
  processedVideoIds: string[];
};

type Candidate = {
  gameName: string;
  normalizedName: string;
  platform: "ROBLOX" | "STEAM";
  videoId: string;
};

type ExistingGame = {
  id: number;
  game_name: string;
  platform: string;
  youtube_24h_count: number;
};

type QueryStats = {
  videos: number;
  candidates: number;
  inserted: number;
  updated: number;
};

async function main() {
  console.log("start fetch-youtube");

  loadEnvFile();

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (!apiKey) {
    console.error("missing YOUTUBE_API_KEY in .env");
    process.exitCode = 1;
    return;
  }

  const cache = await readCache();
  const todayUtc = new Date().toISOString().slice(0, 10);
  const publishedAfter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const seenVideoIds = new Set(cache.processedVideoIds);
  const seenCandidates = new Set<string>();
  const existingGames = await prisma.game.findMany({
    select: {
      id: true,
      game_name: true,
      platform: true,
      youtube_24h_count: true,
    },
  });
  const gameMap = new Map<string, ExistingGame>();

  for (const game of existingGames) {
    const key = `${game.platform}:${normalizeGameName(game.game_name)}`;
    gameMap.set(key, game);
  }

  let queriedCount = 0;
  let totalVideos = 0;
  let totalCandidates = 0;
  let totalInserted = 0;
  let totalUpdated = 0;

  try {
    for (const query of QUERIES) {
      if (cache.queries[query] === todayUtc) {
        console.log(`query: ${query}`);
        console.log("skipped query (already fetched today)");
        continue;
      }

      queriedCount += 1;
      console.log(`query: ${query}`);

      let response: SearchResponse;

      try {
        response = await fetchYoutubeVideos({
          apiKey,
          query,
          publishedAfter,
        });
      } catch (error) {
        if (isQuotaError(error)) {
          console.log("stopped because quota limit detected");
          break;
        }

        console.error(`query failed: ${query}`);
        console.error(error instanceof Error ? error.message : String(error));
        continue;
      }

      const items = response.items ?? [];
      const stats: QueryStats = {
        videos: items.length,
        candidates: 0,
        inserted: 0,
        updated: 0,
      };

      totalVideos += stats.videos;
      console.log(`fetched videos: ${stats.videos}`);

      for (const item of items) {
        const videoId = item.id?.videoId?.trim();
        const title = item.snippet?.title?.trim();

        if (!videoId || !title) {
          continue;
        }

        if (seenVideoIds.has(videoId)) {
          continue;
        }

        seenVideoIds.add(videoId);

        const platform = detectPlatform(query);
        const gameName = extractCandidateGameName(title, platform);

        if (!gameName) {
          continue;
        }

        const normalizedName = normalizeGameName(gameName);

        if (!normalizedName) {
          continue;
        }

        const candidateKey = `${platform}:${normalizedName}`;

        if (seenCandidates.has(candidateKey)) {
          continue;
        }

        seenCandidates.add(candidateKey);
        stats.candidates += 1;

        const candidate: Candidate = {
          gameName,
          normalizedName,
          platform,
          videoId,
        };

        const result = await upsertGame(candidate, gameMap);
        stats.inserted += result.inserted;
        stats.updated += result.updated;
      }

      cache.queries[query] = todayUtc;
      totalCandidates += stats.candidates;
      totalInserted += stats.inserted;
      totalUpdated += stats.updated;

      console.log(`extracted candidates: ${stats.candidates}`);
      console.log(`inserted: ${stats.inserted}, updated: ${stats.updated}`);
    }
  } finally {
    cache.processedVideoIds = Array.from(seenVideoIds).slice(-MAX_RECENT_VIDEO_IDS);
    await writeCache(cache);
    await prisma.$disconnect();
  }

  console.log(
    `done fetch-youtube | queries: ${queriedCount}, videos: ${totalVideos}, candidates: ${totalCandidates}, inserted: ${totalInserted}, updated: ${totalUpdated}`,
  );
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");

  try {
    const content = require("node:fs").readFileSync(envPath, "utf8") as string;
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

async function fetchYoutubeVideos(input: {
  apiKey: string;
  query: string;
  publishedAfter: string;
}) {
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    order: "date",
    maxResults: "10",
    relevanceLanguage: "en",
    publishedAfter: input.publishedAfter,
    q: input.query,
    key: input.apiKey,
  });

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    response = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, {
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`request timeout while fetching YouTube for query "${input.query}"`);
    }

    throw new Error(
      `network error while fetching YouTube for query "${input.query}": ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    clearTimeout(timeout);
  }

  const data = (await response.json()) as SearchResponse;

  if (!response.ok) {
    const message = data.error?.message || `HTTP ${response.status}`;
    const reason = data.error?.errors?.[0]?.reason || "";
    const error = new Error(`youtube api error for "${input.query}": ${message} (${reason})`);
    error.name = response.status === 403 ? "QuotaError" : "YoutubeApiError";
    throw error;
  }

  return data;
}

function isQuotaError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    error.name === "QuotaError" ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("ratelimit") ||
    message.includes("dailylimitexceeded") ||
    message.includes("quotaexceeded")
  );
}

function detectPlatform(query: string): "ROBLOX" | "STEAM" {
  return query.includes("roblox") ? "ROBLOX" : "STEAM";
}

function extractCandidateGameName(title: string, platform: "ROBLOX" | "STEAM") {
  let cleaned = title
    .replace(/\[[^\]]*]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[|/:,_#+~*"'`]+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return null;
  }

  const lower = cleaned.toLowerCase();
  const splitPatterns = [
    /\bnew update for\b/i,
    /\bnew game on\b/i,
    /\bgameplay of\b/i,
    /\bcodes for\b/i,
    /\bguide to\b/i,
    /\bhow to play\b/i,
    /\bplaying\b/i,
    /\bin\b/i,
    /\bfor\b/i,
    /\bon\b/i,
    /\b-\b/i,
  ];

  for (const pattern of splitPatterns) {
    const parts = cleaned.split(pattern);
    if (parts.length > 1) {
      cleaned = chooseBetterSegment(parts, platform);
      break;
    }
  }

  const rawWords = cleaned.split(/\s+/).filter(Boolean);
  const words = rawWords.filter((word) => !STOP_WORDS.has(word.toLowerCase()));

  if (words.length === 0) {
    return null;
  }

  const preferred = pickPreferredWords(words, rawWords);

  if (preferred.length === 0 || preferred.length > 4) {
    return null;
  }

  const candidate = preferred.join(" ").trim();
  const normalized = normalizeGameName(candidate);

  if (!normalized || normalized.length < 2 || BAD_PHRASES.has(normalized)) {
    return null;
  }

  return toTitleCase(candidate);
}

function chooseBetterSegment(parts: string[], platform: "ROBLOX" | "STEAM") {
  const ranked = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .sort((left, right) => scoreSegment(right, platform) - scoreSegment(left, platform));

  return ranked[0] ?? "";
}

function scoreSegment(segment: string, platform: "ROBLOX" | "STEAM") {
  const words = segment.split(/\s+/).filter(Boolean);
  let score = 0;

  for (const word of words) {
    const lower = word.toLowerCase();

    if (!STOP_WORDS.has(lower)) {
      score += 2;
    }

    if (/^[A-Z0-9][A-Za-z0-9'-]*$/.test(word)) {
      score += 1;
    }
  }

  if (segment.toLowerCase().includes(platform.toLowerCase())) {
    score -= 2;
  }

  if (words.length > 4) {
    score -= 2;
  }

  return score;
}

function pickPreferredWords(words: string[], rawWords: string[]) {
  const titleCaseWords = rawWords.filter((word) => {
    if (STOP_WORDS.has(word.toLowerCase())) {
      return false;
    }

    return /^[A-Z0-9][A-Za-z0-9'-]*$/.test(word);
  });

  const source = titleCaseWords.length > 0 ? titleCaseWords : words;
  return source.slice(0, 4);
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (/^[A-Z0-9]+$/.test(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

async function upsertGame(candidate: Candidate, gameMap: Map<string, ExistingGame>) {
  try {
    const key = `${candidate.platform}:${candidate.normalizedName}`;
    const existing = gameMap.get(key);

    if (existing) {
      const nextCount = existing.youtube_24h_count + 1;

      await prisma.game.update({
        where: {
          id: existing.id,
        },
        data: {
          youtube_24h_count: nextCount,
        },
      });

      gameMap.set(key, {
        ...existing,
        youtube_24h_count: nextCount,
      });

      return { inserted: 0, updated: 1 };
    }

    const created = await prisma.game.create({
      data: {
        game_name: candidate.gameName,
        platform: candidate.platform,
        discovered_at: new Date(),
        youtube_24h_count: 1,
        youtube_growth_score: 0,
        fit_score: 0,
        serp_gap_score: 0,
        total_score: 0,
        suggested_tool: "pending",
        action: "review",
        notes: "seeded from youtube",
      },
    });

    gameMap.set(key, {
      id: created.id,
      game_name: created.game_name,
      platform: created.platform,
      youtube_24h_count: created.youtube_24h_count,
    });

    return { inserted: 1, updated: 0 };
  } catch (error) {
    console.error(`failed to write game: ${candidate.gameName} (${candidate.platform})`);
    console.error(error instanceof Error ? error.message : String(error));
    return { inserted: 0, updated: 0 };
  }
}

async function readCache(): Promise<CacheFile> {
  await mkdir(path.dirname(CACHE_PATH), { recursive: true });

  try {
    const raw = await readFile(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<CacheFile>;

    return {
      queries: parsed.queries ?? {},
      processedVideoIds: Array.isArray(parsed.processedVideoIds) ? parsed.processedVideoIds : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("failed to read cache, using empty cache");
    }

    return {
      queries: {},
      processedVideoIds: [],
    };
  }
}

async function writeCache(cache: CacheFile) {
  const stableCache: CacheFile = {
    queries: cache.queries,
    processedVideoIds: cache.processedVideoIds.slice(-MAX_RECENT_VIDEO_IDS),
  };

  await writeFile(CACHE_PATH, JSON.stringify(stableCache, null, 2) + "\n", "utf8");
}

void main();
