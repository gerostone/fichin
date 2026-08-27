import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type NotificationItem = {
  id: string;
  type: "FOLLOW" | "REVIEW";
  createdAt: string;
  actorUsername: string;
  message: string;
  href: string;
};

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [newFollowers, followedUsersReviews] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followingId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        follower: {
          select: {
            username: true,
          },
        },
      },
    }),
    prisma.review.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: session.user.id,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: { username: true },
        },
        game: {
          select: { slug: true, title: true },
        },
      },
    }),
  ]);

  const notifications: NotificationItem[] = [
    ...newFollowers.map((follow) => ({
      id: `follow-${follow.id}`,
      type: "FOLLOW" as const,
      createdAt: follow.createdAt.toISOString(),
      actorUsername: follow.follower.username,
      message: `@${follow.follower.username} comenzó a seguirte.`,
      href: `/users/${follow.follower.username}`,
    })),
    ...followedUsersReviews.map((review) => ({
      id: `review-${review.id}`,
      type: "REVIEW" as const,
      createdAt: review.createdAt.toISOString(),
      actorUsername: review.user.username,
      message: `@${review.user.username} reseñó ${review.game.title}.`,
      href: `/games/${review.game.slug}`,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  return NextResponse.json({ notifications });
}
