import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.keywordCheck.deleteMany();
  await prisma.game.deleteMany();

  await prisma.game.create({
    data: {
      game_name: "Grow a Garden",
      platform: "Roblox",
      discovered_at: new Date("2026-03-15T09:30:00+08:00"),
      youtube_24h_count: 184,
      youtube_growth_score: 8.7,
      fit_score: 8.9,
      serp_gap_score: 7.4,
      total_score: 25.0,
      suggested_tool: "Crop Planner",
      action: "做一个作物价值计算器",
      notes: "搜索结果里攻略内容多，但工具型页面少。",
      keyword_checks: {
        create: [
          {
            keyword: "grow a garden value calculator",
            has_tool_site: false,
            serp_summary: "搜索结果主要是视频和普通攻略，没有稳定的计算器站点。",
            checked_at: new Date("2026-03-15T10:00:00+08:00"),
          },
          {
            keyword: "grow a garden mutation guide",
            has_tool_site: true,
            serp_summary: "有少量 wiki 和资料页，但结构比较松散。",
            checked_at: new Date("2026-03-15T10:20:00+08:00"),
          },
        ],
      },
    },
  });

  await prisma.game.create({
    data: {
      game_name: "Schedule I",
      platform: "Steam",
      discovered_at: new Date("2026-03-14T14:10:00+08:00"),
      youtube_24h_count: 96,
      youtube_growth_score: 7.8,
      fit_score: 8.2,
      serp_gap_score: 8.6,
      total_score: 24.6,
      suggested_tool: "Craft Tree",
      action: "做配方与利润路线页",
      notes: "社区讨论热，但搜索结果里高质量工具页偏少。",
      keyword_checks: {
        create: [
          {
            keyword: "schedule i crafting calculator",
            has_tool_site: false,
            serp_summary: "目前以论坛帖子和视频为主，缺少专门计算工具。",
            checked_at: new Date("2026-03-14T15:00:00+08:00"),
          },
          {
            keyword: "schedule i mixing guide",
            has_tool_site: false,
            serp_summary: "有零散 wiki 页面，但没有好用的交互式路径工具。",
            checked_at: new Date("2026-03-14T15:30:00+08:00"),
          },
        ],
      },
    },
  });

  await prisma.game.create({
    data: {
      game_name: "Anime Rangers X",
      platform: "Roblox",
      discovered_at: new Date("2026-03-13T20:45:00+08:00"),
      youtube_24h_count: 121,
      youtube_growth_score: 7.1,
      fit_score: 7.9,
      serp_gap_score: 7.2,
      total_score: 22.2,
      suggested_tool: "Tier List + Codes",
      action: "先做角色 tier list 和 code 页面",
      notes: "更偏内容型，但仍可作为低成本验证项。",
      keyword_checks: {
        create: [
          {
            keyword: "anime rangers x tier list",
            has_tool_site: true,
            serp_summary: "已有几篇榜单文章，但页面质量一般，更新频率不稳定。",
            checked_at: new Date("2026-03-13T21:10:00+08:00"),
          },
          {
            keyword: "anime rangers x codes",
            has_tool_site: true,
            serp_summary: "已有聚合页，竞争中等，适合后续补充而非主打。",
            checked_at: new Date("2026-03-13T21:20:00+08:00"),
          },
        ],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
