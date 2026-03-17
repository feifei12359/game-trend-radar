import { GameTable } from "@/components/game-table";
import { getRadarBuckets } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const { earlyRising, watchlist } = await getRadarBuckets();

  return (
    <main className="grid">
      <section>
        <p className="muted">Daily opportunity-first radar</p>
        <h1 className="page-title">Game Opportunity Radar</h1>
      </section>

      <section className="grid">
        <div>
          <h2 className="section-title">Today&apos;s Opportunities</h2>
          <p className="muted">High-confidence keywords worth acting on today.</p>
        </div>
        <GameTable games={earlyRising} />
      </section>

      <section className="grid">
        <div>
          <h2 className="section-title">Watchlist</h2>
          <p className="muted">Rising but not confirmed yet.</p>
        </div>
        <GameTable games={watchlist} />
      </section>
    </main>
  );
}
