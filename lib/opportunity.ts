type Game = {
  id: number;
  game_name: string;
  platform: "ROBLOX" | "STEAM";
  youtube_24h_count: number;
  fit_score: number;
  serp_gap_score: number;
  total_score: number;
};

function isGarbageGame(name: string) {
  const n = name.toLowerCase().trim();

  // 太短
  if (n.length <= 3) {
    return true;
  }

  // 单词垃圾
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

  // 没有大写（不像游戏名）
  if (!/[A-Z]/.test(name)) {
    return true;
  }

  return false;
}

function isOpportunity(game: Game) {
  return (
    game.youtube_24h_count >= 20 &&
    game.serp_gap_score >= 40 &&
    game.fit_score >= 30
  );
}

function calcOpportunityScore(game: Game) {
  let score = 0;

  // 热度
  score += game.youtube_24h_count * 2;

  // SEO 空缺
  score += game.serp_gap_score * 1.5;

  // 工具适配
  score += game.fit_score * 1.2;

  return score;
}

export function pickTodayOpportunity(games: Game[]) {
  // 1. 过滤垃圾词
  const filtered = games.filter((g) => !isGarbageGame(g.game_name));

  // 2. 过滤没价值的
  const candidates = filtered.filter(isOpportunity);

  if (candidates.length === 0) {
    return null;
  }

  // 3. 排序
  const sorted = candidates.sort(
    (a, b) => calcOpportunityScore(b) - calcOpportunityScore(a),
  );

  // 4. 只取第 1 个
  return sorted[0];
}

