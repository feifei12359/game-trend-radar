import { GameTable } from "@/components/game-table";
import { getTopGames } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const games = await getTopGames();

  return (
    <main className="grid">
      <section>
        <p className="muted">按综合评分排序的 Top20 游戏机会</p>
        <h1 className="page-title">游戏机会雷达</h1>
      </section>
      <GameTable games={games} />
    </main>
  );
}
