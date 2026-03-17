import { PrismaClient } from "@prisma/client";
import { normalizeGameName } from "../lib/normalize";

const prisma = new PrismaClient();

const BAD_SINGLE_WORDS = new Set([
  "hello",
  "everything",
  "update",
  "gameplay",
  "trailer",
  "guide",
  "tips",
  "video",
  "game",
  "games",
  "play",
  "playing",
  "working",
  "animation",
  "edit",
  "robloxedit",
]);

const BAD_PHRASES = [
  "nuevos personajes",
  "video pertama",
  "robloxedit",
  "brainrot",
  "mmv",
  "animation",
  "all working",
] as const;

async function main() {
  const games = await prisma.game.findMany({
    select: {
      id: true,
      game_name: true,
    },
  });

  let deletedCount = 0;

  for (const game of games) {
    const normalized = normalizeGameName(game.game_name);
    const words = normalized.split(/\s+/).filter(Boolean);

    if (!shouldDeleteGame(game.game_name, normalized, words)) {
      continue;
    }

    await prisma.game.delete({
      where: {
        id: game.id,
      },
    });

    deletedCount += 1;
  }

  console.log(`cleanup-games deleted: ${deletedCount}`);
}

function shouldDeleteGame(gameName: string, normalized: string, words: string[]) {
  if (!normalized) {
    return false;
  }

  if (words.length === 1 && BAD_SINGLE_WORDS.has(normalized)) {
    return true;
  }

  if (BAD_PHRASES.some((phrase) => normalized.includes(phrase))) {
    return true;
  }

  if (isAllUppercaseGarbage(gameName)) {
    return true;
  }

  return false;
}

function isAllUppercaseGarbage(gameName: string) {
  const trimmed = gameName.trim();

  if (!trimmed) {
    return false;
  }

  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length <= 1) {
    return false;
  }

  const hasLetters = /[A-Z]/.test(trimmed);

  if (!hasLetters || trimmed !== trimmed.toUpperCase()) {
    return false;
  }

  return true;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
