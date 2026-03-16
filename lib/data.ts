import { prisma } from "@/lib/prisma";

export type GameRow = Awaited<ReturnType<typeof getTopGames>>[number];
export type KeywordCheckRow = Awaited<ReturnType<typeof getKeywordChecksByGameId>>[number];

export async function getTopGames() {
  return prisma.game.findMany({
    orderBy: {
      total_score: "desc",
    },
    take: 20,
  });
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
