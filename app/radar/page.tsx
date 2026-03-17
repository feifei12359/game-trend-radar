import { GameTable } from "@/components/game-table";
import { TRENDS_REFERENCE_TERM } from "@/lib/config";
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
      <div
        style={{
          padding: 12,
          background: "#f5f5f5",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 14,
        }}
      >
        Trends reference term: <b>{TRENDS_REFERENCE_TERM}</b>
      </div>
      <GameTable games={games} />
    </main>
  );
}
