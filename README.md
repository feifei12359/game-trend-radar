# Radar MVP

一个从零开始的最小可用项目，用于内部验证 Roblox / Steam 游戏机会雷达。

当前阶段只做三件事：

1. 跑通 Next.js App Router 项目结构
2. 跑通 Prisma + SQLite 数据库
3. 用假数据展示 `/radar` 和 `/game/[id]`

## 技术栈

- Next.js
- TypeScript
- Prisma
- SQLite

## 目录结构

```text
radar-mvp/
  app/
    game/[id]/page.tsx
    radar/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
  lib/
  prisma/
    migrations/
    schema.prisma
    seed.ts
  scripts/
  .env
  package.json
```

## 安装依赖

```bash
npm install
```

## 初始化数据库

先复制环境变量文件：

```bash
cp .env.example .env
```

Windows PowerShell 也可以直接执行：

```powershell
Copy-Item .env.example .env
```

然后执行：

```bash
npm run db:init
```

这会做两件事：

- 根据 `prisma/migrations` 应用 SQLite migration
- 初始化本地数据库文件 `prisma/dev.db`

如果你当前机器上的 `prisma migrate` 在 Windows 路径环境里报权限或路径错误，可使用兜底方案：

```bash
npm run db:init:fallback
```

## 执行 Prisma migrate

日常开发可直接执行：

```bash
npm run prisma:migrate
```

这个命令会在 schema 改动后创建新的 migration。

如果你只想生成 Prisma Client：

```bash
npm run prisma:generate
```

## Seed 假数据

```bash
npm run prisma:seed
```

## 启动项目

```bash
npm run dev
```

启动后访问：

- `http://localhost:3000/radar`
- `http://localhost:3000/game/1`

## 第一阶段已完成内容

- 全新 Next.js App Router 项目骨架
- TypeScript 配置
- Prisma + SQLite 配置
- 两张核心表：`games`、`keyword_checks`
- 最小数据访问函数
- `/radar` 列表页
- `/game/[id]` 详情页
- 假数据 seed

## 下一阶段建议

- 增加手工录入或脚本导入数据
- 增加基础筛选，例如平台、分数区间
- 加入最简单的每日抓取脚本
- 增加更明确的评分规则说明
- 补充数据更新时间和抓取来源字段
