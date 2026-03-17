import { prisma } from "@/lib/prisma";
import {
  classify,
  enrichOpportunityGame,
  getEarlyRisingRankScore,
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
    .filter((game) => game.stars >= 4)
    .sort(
      (left, right) => getEarlyRisingRankScore(right) - getEarlyRisingRankScore(left),
    )
    .slice(0, 10);

  const watchlist = enriched
    .filter((game) => classify(game) === "watchlist")
    .sort((left, right) => {
      if (right.youtube_24h_count !== left.youtube_24h_count) {
        return right.youtube_24h_count - left.youtube_24h_count;
      }

      return right.total_score - left.total_score;
    })
    .slice(0, 10);

  return {
    earlyRising,
    watchlist,
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
