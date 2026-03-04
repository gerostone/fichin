import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { gameQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const parsed = gameQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    genre: searchParams.get("genre") ?? undefined,
    platform: searchParams.get("platform") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    page: searchParams.get("page") ?? "1",
    limit: searchParams.get("limit") ?? "12",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  const { q, genre, platform, sort, page: requestedPage, limit } = parsed.data;

  const where = {
    ...(q
      ? {
          title: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(genre ? { genres: { has: genre } } : {}),
    ...(platform ? { platforms: { has: platform } } : {}),
  };

  const orderBy =
    sort === "title"
      ? [{ title: "asc" as const }]
      : sort === "recent"
        ? [{ releaseDate: "desc" as const }, { title: "asc" as const }]
        : [{ ratingGlobal: "desc" as const }, { title: "asc" as const }];

  const total = await prisma.game.count({ where });
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const page = Math.min(requestedPage, totalPages);

  const games = await prisma.game.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      genres: true,
      platforms: true,
      releaseDate: true,
      ratingGlobal: true,
      _count: {
        select: { reviews: true },
      },
    },
  });

  const scoreMap = new Map<string, number | null>();
  if (games.length > 0) {
    const grouped = await prisma.review.groupBy({
      by: ["gameId"],
      where: { gameId: { in: games.map((game) => game.id) } },
      _avg: { score: true },
    });

    for (const row of grouped) {
      scoreMap.set(row.gameId, row._avg.score);
    }
  }

  return NextResponse.json({
    games: games.map((game) => ({
      ...game,
      averageScore: scoreMap.get(game.id) ?? null,
      reviewCount: game._count.reviews,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}
