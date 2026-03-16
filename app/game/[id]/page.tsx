import { notFound } from "next/navigation";
import { KeywordCheckList } from "@/components/keyword-check-list";
import { getGameById, getKeywordChecksByGameId } from "@/lib/data";

type GameDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
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
            <span className="label">发现时间</span>
            <span>{new Date(game.discovered_at).toLocaleString("zh-CN")}</span>
          </div>
          <div>
            <span className="label">推荐工具</span>
            <span>{getSuggestedToolLabel(game.suggested_tool)}</span>
          </div>
          <div>
            <span className="label">建议行动</span>
            <span>{getActionLabel(game.action)}</span>
          </div>
          <div>
            <span className="label">备注</span>
            <span>{game.notes || "暂无备注"}</span>
          </div>
        </div>
      </section>

      <section className="score-grid">
        <div className="score-card">
          <strong>24小时视频</strong>
          <span>{game.youtube_24h_count}</span>
        </div>
        <div className="score-card">
          <strong>YouTube 增长</strong>
          <span>{game.youtube_growth_score}</span>
        </div>
        <div className="score-card">
          <strong>工具适配</strong>
          <span>{game.fit_score}</span>
        </div>
        <div className="score-card">
          <strong>SEO空缺</strong>
          <span>{game.serp_gap_score}</span>
        </div>
        <div className="score-card">
          <strong>综合评分</strong>
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
