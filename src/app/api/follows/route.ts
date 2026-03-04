import { NextRequest, NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { followSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = followSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { username: parsed.data.username },
    select: { id: true, username: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.id === session.user.id) {
    return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
  }

  const follow = await prisma.userFollow.upsert({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUser.id,
      },
    },
    create: {
      followerId: session.user.id,
      followingId: targetUser.id,
    },
    update: {},
  });

  return NextResponse.json({ follow });
}

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const following = await prisma.userFollow.findMany({
    where: { followerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      following: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return NextResponse.json({ following });
}
