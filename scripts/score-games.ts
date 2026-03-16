import { prisma } from "../lib/prisma";

const FIT_KEYWORDS = [
  "defense",
  "simulator",
  "unit",
  "battle",
  "dungeon",
  "raid",
  "anime",
  "tycoon",
  "rng",
  "clicker",
  "upgrade",
  "craft",
  "evolve",
  "team",
  "build",
];

const CALCULATOR_KEYWORDS = ["simulator", "rng", "clicker", "craft", "evolve"];
const TIER_LIST_KEYWORDS = ["defense", "unit", "anime", "raid", "dungeon"];
const BUILD_KEYWORDS = ["battle", "build", "team"];

async function main() {
  console.log("start score-games");

  try {
    const games = await prisma.game.findMany({
      orderBy: {
        id: "asc",
      },
    });

    console.log(`scoring games: ${games.length}`);

    for (const game of games) {
      const suggestedTool = getSuggestedTool(game.game_name);
      const youtubeGrowthScore = getYoutubeGrowthScore(game.youtube_24h_count);
      const fitScore = getFitScore(game.game_name);
      const serpGapScore = getSerpGapScore(suggestedTool);
      const totalScore = roundScore(
        youtubeGrowthScore * 0.4 + fitScore * 0.4 + serpGapScore * 0.2,
      );
      const action = getAction(totalScore);

      await prisma.game.update({
        where: {
          id: game.id,
        },
        data: {
          youtube_growth_score: youtubeGrowthScore,
          fit_score: fitScore,
          serp_gap_score: serpGapScore,
          total_score: totalScore,
          suggested_tool: suggestedTool,
          action,
        },
      });

      console.log(
        `updated: ${game.game_name} | total_score=${totalScore} | suggested_tool=${suggestedTool} | action=${action}`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("done score-games");
}

function getYoutubeGrowthScore(count: number) {
  if (count <= 0) {
    return 0;
  }

  if (count === 1) {
    return 20;
  }

  if (count === 2) {
    return 35;
  }

  if (count === 3) {
    return 50;
  }

  if (count <= 5) {
    return 65;
  }

  if (count <= 10) {
    return 80;
  }

  return 95;
}

function getFitScore(gameName: string) {
  const lowerName = gameName.toLowerCase();
  let score = 30;

  for (const keyword of FIT_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      score += 10;
    }
  }

  return Math.min(score, 100);
}

function getSuggestedTool(gameName: string) {
  const lowerName = gameName.toLowerCase();

  if (CALCULATOR_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return "calculator";
  }

  if (TIER_LIST_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return "tier list";
  }

  if (BUILD_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return "build";
  }

  return "codes";
}

function getSerpGapScore(suggestedTool: string) {
  if (suggestedTool === "calculator") {
    return 60;
  }

  if (suggestedTool === "tier list") {
    return 60;
  }

  if (suggestedTool === "build") {
    return 55;
  }

  if (suggestedTool === "codes") {
    return 45;
  }

  return 50;
}

function getAction(totalScore: number) {
  if (totalScore >= 70) {
    return "build now";
  }

  if (totalScore >= 50) {
    return "review";
  }

  return "monitor";
}

function roundScore(score: number) {
  return Math.round(score * 10) / 10;
}

void main();
