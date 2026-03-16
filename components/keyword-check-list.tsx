import type { KeywordCheckRow } from "@/lib/data";

type KeywordCheckListProps = {
  checks: KeywordCheckRow[];
};

export function KeywordCheckList({ checks }: KeywordCheckListProps) {
  if (checks.length === 0) {
    return <p className="empty">这个游戏还没有关键词检查记录。</p>;
  }

  return (
    <div className="grid">
      {checks.map((check) => (
        <article className="keyword-item" key={check.id}>
          <h3>{check.keyword}</h3>
          <p className="muted">
            <span className="badge">{check.has_tool_site ? "已有工具站" : "暂未发现工具站"}</span>
          </p>
          <p>{check.serp_summary}</p>
          <p className="muted">检查时间：{new Date(check.checked_at).toLocaleString("zh-CN")}</p>
        </article>
      ))}
    </div>
  );
}
