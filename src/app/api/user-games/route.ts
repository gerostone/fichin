import { NextRequest, NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userGameSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const status = statusParam === "WISHLIST" || statusParam === "PLAYED" ? statusParam : undefined;

  const entries = await prisma.userGame.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      game: true,
    },
  });

  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = userGameSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const game = await prisma.game.findUnique({ where: { id: parsed.data.gameId }, select: { id: true } });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const userGame = await prisma.userGame.upsert({
    where: {
      userId_gameId: {
        userId: session.user.id,
        gameId: parsed.data.gameId,
      },
    },
    create: {
      userId: session.user.id,
      gameId: parsed.data.gameId,
      status: parsed.data.status,
    },
    update: {
      status: parsed.data.status,
    },
  });

  return NextResponse.json({ userGame });
}
