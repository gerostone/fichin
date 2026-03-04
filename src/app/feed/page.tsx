import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FeedPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/feed");
  }

  const reviews = await prisma.review.findMany({
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
    take: 80,
    include: {
      user: {
        select: { username: true },
      },
      game: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Feed</h1>
        <p className="mt-2 text-sm text-slate-300">Reseñas recientes de las personas que seguís.</p>
      </header>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-slate-300">
          Aún no hay reseñas en tu feed. Seguí a otros usuarios para ver su actividad.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-cyan-200">
                <Link href={`/users/${review.user.username}`} className="font-semibold">
                  @{review.user.username}
                </Link>
                <span className="text-slate-400">reseñó</span>
                <Link href={`/games/${review.game.slug}`} className="font-semibold">
                  {review.game.title}
                </Link>
              </div>
              <p className="mt-2 text-sm text-slate-300">Puntaje: {review.score}/100</p>
              <p className="mt-2 text-sm text-slate-100">{review.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
