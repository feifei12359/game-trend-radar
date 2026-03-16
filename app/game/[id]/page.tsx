import { notFound } from "next/navigation";
import { KeywordCheckList } from "@/components/keyword-check-list";
import { getGameById, getKeywordChecksByGameId } from "@/lib/data";

type GameDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;
  const gameId = Number(id);

  if (!Number.isInteger(gameId)) {
    notFound();
  }

  const game = await getGameById(gameId);

  if (!game) {
    notFound();
  }

  const checks = await getKeywordChecksByGameId(game.id);

  return (
    <main className="grid">
      <section>
        <p className="muted">{game.platform}</p>
        <h1 className="page-title">{game.game_name}</h1>
      </section>

      <section className="panel">
        <h2 className="section-title">基本信息</h2>
        <div className="detail-list">
          <div>
            <span className="label">Discovered At</span>
            <span>{new Date(game.discovered_at).toLocaleString("zh-CN")}</span>
          </div>
          <div>
            <span className="label">Suggested Tool</span>
            <span>{game.suggested_tool}</span>
          </div>
          <div>
            <span className="label">Action</span>
            <span>{game.action}</span>
          </div>
          <div>
            <span className="label">Notes</span>
            <span>{game.notes || "暂无备注"}</span>
          </div>
        </div>
      </section>

      <section className="score-grid">
        <div className="score-card">
          <strong>YouTube 24h</strong>
          <span>{game.youtube_24h_count}</span>
        </div>
        <div className="score-card">
          <strong>YouTube Growth</strong>
          <span>{game.youtube_growth_score}</span>
        </div>
        <div className="score-card">
          <strong>Fit Score</strong>
          <span>{game.fit_score}</span>
        </div>
        <div className="score-card">
          <strong>SERP Gap</strong>
          <span>{game.serp_gap_score}</span>
        </div>
        <div className="score-card">
          <strong>Total Score</strong>
          <span>{game.total_score}</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">关键词验证结果</h2>
        <KeywordCheckList checks={checks} />
      </section>
    </main>
  );
}
