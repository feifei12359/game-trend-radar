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
      const earlySignal = hasEarlySignal(game.game_name);
      const suggestedTool = getSuggestedTool(game.game_name);
      const youtubeGrowthScore = getYoutubeGrowthScore(game.youtube_24h_count);
      const fitScore = getFitScore(game.game_name);
      const serpGapScore = getSerpGapScore(suggestedTool);
      let totalScore =
        youtubeGrowthScore * 0.4 + fitScore * 0.4 + serpGapScore * 0.2;

      if (earlySignal) {
        totalScore += 30;
      }

      if (!earlySignal && game.youtube_24h_count <= 2) {
        totalScore -= 15;
      }

      totalScore = roundScore(totalScore);
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

function hasEarlySignal(gameName: string) {
  return /code|update|event|demo|playtest/i.test(gameName);
}

function getYoutubeGrowthScore(count: number) {
  let score = 0;

  if (count <= 0) {
    score = 0;
  } else if (count === 1) {
    score = 20;
  } else if (count === 2) {
    score = 35;
  } else if (count === 3) {
    score = 50;
  } else if (count <= 5) {
    score = 65;
  } else if (count <= 10) {
    score = 80;
  } else {
    score = 95;
  }

  if (count > 80) {
    score -= 20;
  }

  if (count >= 2 && count <= 20) {
    score += 15;
  }

  return Math.max(0, Math.min(score, 100));
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
