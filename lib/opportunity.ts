type BaseGame = {
  id: number;
  game_name: string;
  platform: string;
  discovered_at: Date;
  youtube_24h_count: number;
  fit_score: number;
  serp_gap_score: number;
  total_score: number;
  suggested_tool: string;
  action: string;
};

export type OpportunityStage = "early_rising" | "old_hot" | "noise";

export type OpportunityGame = BaseGame & {
  youtube_6h_count: number;
  youtube_growth_ratio: number;
  opportunity_stage: OpportunityStage;
};

function isGarbageGame(name: string) {
  const n = name.toLowerCase().trim();

  if (n.length <= 3) {
    return true;
  }

  const badWords = [
    "game",
    "games",
    "video",
    "free",
    "new",
    "update",
    "play",
    "roblox",
    "steam",
  ];

  if (badWords.includes(n)) {
    return true;
  }

  if (!/[A-Z]/.test(name)) {
    return true;
  }

  return false;
}

function isOpportunity(game: BaseGame) {
  return (
    game.youtube_24h_count >= 20 &&
    game.serp_gap_score >= 40 &&
    game.fit_score >= 30
  );
}

function calcOpportunityScore(game: BaseGame) {
  let score = 0;
  score += game.youtube_24h_count * 2;
  score += game.serp_gap_score * 1.5;
  score += game.fit_score * 1.2;
  return score;
}

export function pickTodayOpportunity(games: BaseGame[]) {
  const filtered = games.filter((g) => !isGarbageGame(g.game_name));
  const candidates = filtered.filter(isOpportunity);

  if (candidates.length === 0) {
    return null;
  }

  const sorted = candidates.sort(
    (a, b) => calcOpportunityScore(b) - calcOpportunityScore(a),
  );

  return sorted[0];
}

export function classifyOpportunityStage(game: OpportunityGame): OpportunityStage {
  if (game.youtube_24h_count >= 80 || game.youtube_growth_ratio < 0.25) {
    return "old_hot";
  }

  if (
    game.youtube_24h_count >= 5 &&
    game.youtube_24h_count <= 50 &&
    game.youtube_growth_ratio >= 0.35 &&
    game.fit_score >= 30 &&
    game.serp_gap_score >= 40
  ) {
    return "early_rising";
  }

  return "noise";
}

export function enrichOpportunityGame(game: BaseGame): OpportunityGame {
  const youtube_6h_count = estimateYoutube6hCount(game);
  const youtube_growth_ratio = youtube_6h_count / Math.max(game.youtube_24h_count, 1);

  const enriched: OpportunityGame = {
    ...game,
    youtube_6h_count,
    youtube_growth_ratio,
    opportunity_stage: "noise",
  };

  enriched.opportunity_stage = classifyOpportunityStage(enriched);
  return enriched;
}

function estimateYoutube6hCount(game: BaseGame) {
  const discoveredAt = new Date(game.discovered_at).getTime();

  if (Number.isNaN(discoveredAt)) {
    return Math.max(1, Math.round(game.youtube_24h_count * 0.25));
  }

  const elapsedHours = Math.max(1, (Date.now() - discoveredAt) / (1000 * 60 * 60));
  const ratio = Math.min(1, 6 / elapsedHours);
  return Math.min(game.youtube_24h_count, Math.max(1, Math.round(game.youtube_24h_count * ratio)));
}

