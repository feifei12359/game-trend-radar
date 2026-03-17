import Link from "next/link";
import type { GameRow } from "@/lib/data";
import { getTrendsUrl, getYouTubeSearchUrl } from "@/lib/links";

type GameTableProps = {
  games: GameRow[];
};

function getSuggestedToolLabel(value: string) {
  if (value === "calculator") {
    return "计算器";
  }

  if (value === "tier list") {
    return "强度榜";
  }

  if (value === "codes") {
    return "兑换码";
  }

  if (value === "build") {
    return "配装";
  }

  return value;
}

function getActionLabel(value: string) {
  if (value === "build now") {
    return "立即做站";
  }

  if (value === "review") {
    return "观察";
  }

  if (value === "monitor") {
    return "监控";
  }

  return value;
}

export function GameTable({ games }: GameTableProps) {
  if (games.length === 0) {
    return <p className="empty">暂无数据，请先执行 seed。</p>;
  }

  return (
    <div className="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>游戏</th>
            <th>平台</th>
            <th>24小时视频</th>
            <th>工具适配</th>
            <th>SEO空缺</th>
            <th>综合评分</th>
            <th>推荐工具</th>
            <th>建议行动</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>
                <div>
                  <Link href={`/game/${game.id}`}>{game.game_name}</Link>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <a
                      href={getYouTubeSearchUrl(game.game_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        padding: "2px 6px",
                        background: "#ff0000",
                        color: "#fff",
                        borderRadius: 4,
                        textDecoration: "none",
                      }}
                    >
                      YouTube
                    </a>

                    <a
                      href={getTrendsUrl(game.game_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        padding: "2px 6px",
                        background: "#4285F4",
                        color: "#fff",
                        borderRadius: 4,
                        textDecoration: "none",
                      }}
                    >
                      Trends
                    </a>
                  </div>
                </div>
              </td>
              <td>{game.platform}</td>
              <td>{game.youtube_24h_count}</td>
              <td>{game.fit_score}</td>
              <td>{game.serp_gap_score}</td>
              <td>{game.total_score}</td>
              <td>{getSuggestedToolLabel(game.suggested_tool)}</td>
              <td>{getActionLabel(game.action)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
