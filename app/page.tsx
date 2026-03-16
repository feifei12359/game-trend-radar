import Link from "next/link";

export default function HomePage() {
  return (
    <main className="panel hero">
      <p className="muted">Stage 1 / Minimal Skeleton</p>
      <h1>Roblox / Steam 游戏机会雷达</h1>
      <p>
        当前只提供最小骨架：项目结构、SQLite 数据库、Prisma、种子数据，以及两个基础页面。
      </p>
      <Link href="/radar" className="button-link">
        打开 Radar
      </Link>
    </main>
  );
}
