import { GameTable } from "@/components/game-table";
import { getTopGames } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const games = await getTopGames();

  return (
    <main className="grid">
      <section>
        <p className="muted">Top 20 game opportunities ranked by total score</p>
        <h1 className="page-title">Game Opportunity Radar</h1>
      </section>
      <GameTable games={games} />
    </main>
  );
}
