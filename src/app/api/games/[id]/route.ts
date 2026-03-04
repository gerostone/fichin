import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;

  const game = await prisma.game.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
  });

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const [reviewStats, recentReviews] = await Promise.all([
    prisma.review.aggregate({
      where: { gameId: game.id },
      _avg: { score: true },
      _count: { id: true },
    }),
    prisma.review.findMany({
      where: { gameId: game.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    game,
    averageScore: reviewStats._avg.score,
    reviewCount: reviewStats._count.id,
    recentReviews,
  });
}
