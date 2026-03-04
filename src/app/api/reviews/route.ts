import { NextRequest, NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientKey, rateLimit } from "@/lib/rate-limit";
import { sanitizeReviewContent } from "@/lib/sanitize";
import { reviewSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");

  const canProceed = rateLimit(getClientKey(ip, "review-write"), 15, 60_000);
  if (!canProceed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const game = await prisma.game.findUnique({ where: { id: parsed.data.gameId }, select: { id: true } });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const sanitizedContent = sanitizeReviewContent(parsed.data.content);
  if (sanitizedContent.length < 3) {
    return NextResponse.json({ error: "Review content is too short" }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: {
      userId_gameId: {
        userId: session.user.id,
        gameId: parsed.data.gameId,
      },
    },
    create: {
      userId: session.user.id,
      gameId: parsed.data.gameId,
      score: parsed.data.score,
      content: sanitizedContent,
    },
    update: {
      score: parsed.data.score,
      content: sanitizedContent,
    },
  });

  return NextResponse.json({ review });
}
