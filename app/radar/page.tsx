import { GameTable } from "@/components/game-table";
import { getRadarBuckets } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const { earlyRising, oldHot, noise } = await getRadarBuckets();

  return (
    <main className="grid">
      <section>
        <p className="muted">Daily opportunity-first radar</p>
        <h1 className="page-title">Game Opportunity Radar</h1>
      </section>

      <section className="grid">
        <div>
          <h2 className="section-title">Today&apos;s Early Opportunities</h2>
          <p className="muted">Early-rising candidates worth checking first.</p>
        </div>
        <GameTable games={earlyRising} />
      </section>

      <section className="grid">
        <div>
          <h2 className="section-title">Old Hot Terms</h2>
          <p className="muted">Already-hot terms with weaker early-stage timing.</p>
        </div>
        <GameTable games={oldHot} />
      </section>

      <section className="grid">
        <div>
          <h2 className="section-title">Noise</h2>
          <p className="muted">Lower-confidence or weak-opportunity candidates.</p>
        </div>
        <GameTable games={noise} />
      </section>
    </main>
  );
}
