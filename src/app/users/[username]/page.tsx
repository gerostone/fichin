import Link from "next/link";
import { notFound } from "next/navigation";

import { FollowButton } from "@/components/social/follow-button";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UserProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;

  const [session, user] = await Promise.all([
    getAuthSession(),
    prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            reviews: true,
            followers: true,
            following: true,
          },
        },
      },
    }),
  ]);

  if (!user) {
    notFound();
  }

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      game: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  const isOwnProfile = session?.user?.id === user.id;

  const isFollowing =
    !isOwnProfile && session?.user?.id
      ? (await prisma.userFollow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: user.id,
            },
          },
          select: { id: true },
        })) !== null
      : false;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">@{user.username}</h1>
            <p className="mt-2 text-sm text-slate-300">Perfil público de reseñas de videojuegos.</p>
          </div>

          {!isOwnProfile && session?.user ? (
            <FollowButton username={user.username} initiallyFollowing={isFollowing} />
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-950/70 p-3">Reseñas: {user._count.reviews}</div>
          <div className="rounded-xl bg-slate-950/70 p-3">Seguidores: {user._count.followers}</div>
          <div className="rounded-xl bg-slate-950/70 p-3">Siguiendo: {user._count.following}</div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Reseñas recientes</h2>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-slate-300">
            Este usuario todavía no publicó reseñas.
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <Link href={`/games/${review.game.slug}`} className="text-lg font-semibold text-cyan-200">
                {review.game.title}
              </Link>
              <p className="mt-1 text-sm text-slate-300">Puntaje: {review.score}/100</p>
              <p className="mt-2 text-sm text-slate-100">{review.content}</p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
