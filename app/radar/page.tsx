import { GameTable } from "@/components/game-table";
import { getTopGames } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const games = await getTopGames();

  return (
    <main className="grid">
      <section>
        <p className="muted">Top 20 by total score</p>
        <h1 className="page-title">Radar</h1>
      </section>
      <GameTable games={games} />
    </main>
  );
}
