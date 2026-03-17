import { GameTable } from "@/components/game-table";
import { getRadarBuckets } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const { earlyRising, trendingNow, noise } = await getRadarBuckets();

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
          <h2 className="section-title">Trending Now</h2>
          <p className="muted">Games currently gaining traction and rising fast.</p>
          <p className="muted">正在爆发中的游戏词，仍有机会进入。</p>
        </div>
        <GameTable games={trendingNow} />
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
