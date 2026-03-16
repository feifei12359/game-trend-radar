-- CreateTable
CREATE TABLE "games" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "game_name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "discovered_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "youtube_24h_count" INTEGER NOT NULL,
    "youtube_growth_score" REAL NOT NULL,
    "fit_score" REAL NOT NULL,
    "serp_gap_score" REAL NOT NULL,
    "total_score" REAL NOT NULL,
    "suggested_tool" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "keyword_checks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "game_id" INTEGER NOT NULL,
    "keyword" TEXT NOT NULL,
    "has_tool_site" BOOLEAN NOT NULL,
    "serp_summary" TEXT NOT NULL,
    "checked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "keyword_checks_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "keyword_checks_game_id_idx" ON "keyword_checks"("game_id");
