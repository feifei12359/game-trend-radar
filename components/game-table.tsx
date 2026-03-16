import Link from "next/link";
import type { GameRow } from "@/lib/data";

type GameTableProps = {
  games: GameRow[];
};

export function GameTable({ games }: GameTableProps) {
  if (games.length === 0) {
    return <p className="empty">暂无数据，请先执行 seed。</p>;
  }

  return (
    <div className="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>Platform</th>
            <th>YouTube 24h</th>
            <th>Fit</th>
            <th>SERP Gap</th>
            <th>Total</th>
            <th>Suggested Tool</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>
                <Link href={`/game/${game.id}`}>{game.game_name}</Link>
              </td>
              <td>{game.platform}</td>
              <td>{game.youtube_24h_count}</td>
              <td>{game.fit_score}</td>
              <td>{game.serp_gap_score}</td>
              <td>{game.total_score}</td>
              <td>{game.suggested_tool}</td>
              <td>{game.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
