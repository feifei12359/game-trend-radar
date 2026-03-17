import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MAX_GAMES = 10;
const MAX_CONSECUTIVE_ERRORS = 3;
const SEARCH_URL = "https://duckduckgo.com/";
const KNOWN_SITES = [
  "fandom",
  "ign",
  "dexerto",
  "game8",
  "sportskeeda",
  "gosunoob",
  "progameguides",
  "pockettactics",
];
const TOOL_TERMS = ["calculator", "tier list", "codes", "build", "wiki", "guide"];
const KEYWORD_SUFFIXES = ["calculator", "codes", "tier list", "build", "unit", "upgrade"];

async function main() {
  console.log("start check-keywords");

  let consecutiveErrors = 0;

  try {
    const games = await prisma.game.findMany({
      orderBy: {
        total_score: "desc",
      },
      take: MAX_GAMES,
      select: {
        id: true,
        game_name: true,
      },
    });

    console.log(`checking games: ${games.length}`);

    for (const game of games) {
      console.log(`game: ${game.game_name}`);

      let missingCount = 0;

      for (const suffix of KEYWORD_SUFFIXES) {
        const keyword = `${game.game_name} ${suffix}`;
        console.log(`keyword: ${keyword}`);

        try {
          const html = await searchKeyword(keyword);
          const result = analyzeSearchResult(html);

          if (!result.hasToolSite) {
            missingCount += 1;
          }

          await upsertKeywordCheck({
            gameId: game.id,
            keyword,
            hasToolSite: result.hasToolSite,
            summary: result.summary,
          });

          consecutiveErrors = 0;
          console.log(`result: has_tool_site=${result.hasToolSite}`);

          await sleep(randomDelay(800, 1500));
        } catch (error) {
          consecutiveErrors += 1;
          console.error(`keyword check failed: ${keyword}`);
          console.error(error instanceof Error ? error.message : String(error));

          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            throw new Error("stopped after consecutive search errors");
          }

          await sleep(randomDelay(800, 1500));
        }
      }

      const serpGapScore = getSerpGapScore(missingCount);

      await prisma.game.update({
        where: {
          id: game.id,
        },
        data: {
          serp_gap_score: serpGapScore,
        },
      });

      console.log(`updated serp_gap_score=${serpGapScore}`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("done check-keywords");
}

async function searchKeyword(keyword: string) {
  const params = new URLSearchParams({
    q: keyword,
    kl: "us-en",
    kp: "-1",
  });

  const response = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`search request failed with status ${response.status}`);
  }

  return response.text();
}

function analyzeSearchResult(html: string) {
  const lowerHtml = html.toLowerCase();
  const domainHits = KNOWN_SITES.filter((site) => lowerHtml.includes(site));
  const toolTermHits = TOOL_TERMS.filter((term) => lowerHtml.includes(term));
  const resultBlocks = countMatches(lowerHtml, /result__title|result__snippet|result-link/g);

  const hasToolSite =
    domainHits.length >= 1 ||
    toolTermHits.length >= 3 ||
    (toolTermHits.length >= 2 && resultBlocks >= 3);

  return {
    hasToolSite,
    summary: buildSummary(domainHits, toolTermHits, resultBlocks, hasToolSite),
  };
}

function buildSummary(
  domainHits: string[],
  toolTermHits: string[],
  resultBlocks: number,
  hasToolSite: boolean,
) {
  if (hasToolSite && domainHits.length > 0) {
    return truncateSummary(
      `found likely tool pages from ${domainHits.slice(0, 2).join(" and ")}`,
    );
  }

  if (hasToolSite && toolTermHits.length > 0) {
    return truncateSummary(
      `mixed results, found tool-like pages around ${toolTermHits.slice(0, 2).join(" and ")}`,
    );
  }

  if (resultBlocks <= 1) {
    return "results look weak, no obvious dedicated tool site";
  }

  return "mixed results, mostly generic videos and forum pages";
}

async function upsertKeywordCheck(input: {
  gameId: number;
  keyword: string;
  hasToolSite: boolean;
  summary: string;
}) {
  const existing = await prisma.keywordCheck.findFirst({
    where: {
      game_id: input.gameId,
      keyword: input.keyword,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    await prisma.keywordCheck.update({
      where: {
        id: existing.id,
      },
      data: {
        has_tool_site: input.hasToolSite,
        serp_summary: input.summary,
        checked_at: new Date(),
      },
    });

    return;
  }

  await prisma.keywordCheck.create({
    data: {
      game_id: input.gameId,
      keyword: input.keyword,
      has_tool_site: input.hasToolSite,
      serp_summary: input.summary,
      checked_at: new Date(),
    },
  });
}

function getSerpGapScore(missingCount: number) {
  if (missingCount <= 0) {
    return 20;
  }

  if (missingCount === 1) {
    return 30;
  }

  if (missingCount === 2) {
    return 45;
  }

  if (missingCount === 3) {
    return 60;
  }

  if (missingCount === 4) {
    return 75;
  }

  if (missingCount === 5) {
    return 85;
  }

  return 95;
}

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

function truncateSummary(value: string) {
  if (value.length <= 120) {
    return value;
  }

  return `${value.slice(0, 117)}...`;
}

function randomDelay(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

void main();
