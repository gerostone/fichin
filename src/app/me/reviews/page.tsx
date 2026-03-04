import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyReviewsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/me/reviews");
  }

  const reviews = await prisma.review.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
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
      <h1 className="text-3xl font-bold">Mis reseñas</h1>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-slate-300">
          Aún no escribiste reseñas.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <Link href={`/games/${review.game.slug}`} className="text-lg font-semibold text-cyan-200">
                {review.game.title}
              </Link>
              <p className="mt-1 text-sm text-slate-300">Puntaje: {review.score}/100</p>
              <p className="mt-2 text-sm text-slate-100">{review.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
