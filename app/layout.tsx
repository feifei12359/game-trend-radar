import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "游戏机会雷达",
  description: "Roblox / Steam 游戏机会雷达最小工具。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link href="/" className="brand">
              游戏机会雷达
            </Link>
            <nav className="nav">
              <Link href="/radar">雷达</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
