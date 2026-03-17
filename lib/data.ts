import { prisma } from "@/lib/prisma";
import {
  enrichOpportunityGame,
  getEarlyRisingRankScore,
  isLikelyNoise,
  isSaturated,
  isTrending,
  type OpportunityGame,
} from "@/lib/opportunity";

export type GameRow = Awaited<ReturnType<typeof getTopGames>>[number];
export type KeywordCheckRow = Awaited<ReturnType<typeof getKeywordChecksByGameId>>[number];
export type OpportunityRow = OpportunityGame;

export async function getTopGames() {
  return prisma.game.findMany({
    orderBy: {
      total_score: "desc",
    },
    take: 20,
  });
}

export async function getRadarBuckets() {
  const games = await prisma.game.findMany({
    orderBy: {
      total_score: "desc",
    },
  });

  const enriched = games.map(enrichOpportunityGame);

  const earlyRising = enriched
    .filter((game) => game.opportunity_stage === "early_rising")
    .sort(
      (left, right) => getEarlyRisingRankScore(right) - getEarlyRisingRankScore(left),
    )
    .slice(0, 10);

  if (earlyRising.length < 3) {
    const existingIds = new Set(earlyRising.map((game) => game.id));
    const fallbackCandidates = enriched
      .filter((game) => !existingIds.has(game.id))
      .filter((game) => !isLikelyNoise(game))
      .filter((game) => !isTrending(game))
      .filter((game) => !isSaturated(game))
      .sort(
        (left, right) => getEarlyRisingRankScore(right) - getEarlyRisingRankScore(left),
      )
      .slice(0, Math.max(0, 5 - earlyRising.length));

    earlyRising.push(...fallbackCandidates);
  }

  const trendingNow = enriched
    .filter((game) => game.opportunity_stage === "trending")
    .sort((left, right) => {
      if (right.youtube_24h_count !== left.youtube_24h_count) {
        return right.youtube_24h_count - left.youtube_24h_count;
      }

      return right.total_score - left.total_score;
    })
    .slice(0, 10);

  const noise = enriched
    .filter((game) => game.opportunity_stage === "noise")
    .sort((left, right) => right.total_score - left.total_score)
    .slice(0, 10);

  const saturated = enriched
    .filter((game) => game.opportunity_stage === "saturated")
    .sort((left, right) => {
      if (right.youtube_24h_count !== left.youtube_24h_count) {
        return right.youtube_24h_count - left.youtube_24h_count;
      }

      return right.total_score - left.total_score;
    })
    .slice(0, 10);

  return {
    earlyRising,
    trendingNow,
    saturated,
    noise,
  };
}

export async function getGameById(id: number) {
  return prisma.game.findUnique({
    where: { id },
  });
}

export async function getKeywordChecksByGameId(gameId: number) {
  return prisma.keywordCheck.findMany({
    where: { game_id: gameId },
    orderBy: {
      checked_at: "desc",
    },
  });
}
