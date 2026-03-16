import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Opportunity Radar",
  description: "Minimal internal radar for Roblox and Steam game opportunities.",
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
              Game Opportunity Radar
            </Link>
            <nav className="nav">
              <Link href="/radar">Radar</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
