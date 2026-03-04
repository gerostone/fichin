import Image from "next/image";
import { notFound } from "next/navigation";

import { ReviewForm } from "@/components/forms/review-form";
import { SaveGameForm } from "@/components/forms/save-game-form";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type GameDetailProps = {
  params: Promise<{ slug: string }>;
};

export default async function GameDetailPage({ params }: GameDetailProps) {
  const { slug } = await params;

  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) {
    notFound();
  }

  const session = await getAuthSession();
  const [stats, recentReviews, userGame, userReview] = await Promise.all([
    prisma.review.aggregate({
      where: { gameId: game.id },
      _avg: { score: true },
      _count: { id: true },
    }),
    prisma.review.findMany({
      where: { gameId: game.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    }),
    session?.user?.id
      ? prisma.userGame.findUnique({
          where: {
            userId_gameId: {
              userId: session.user.id,
              gameId: game.id,
            },
          },
        })
      : null,
    session?.user?.id
      ? prisma.review.findUnique({
          where: {
            userId_gameId: {
              userId: session.user.id,
              gameId: game.id,
            },
          },
        })
      : null,
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-[280px_1fr] md:p-8">
        <div className="overflow-hidden rounded-2xl bg-slate-800">
          {game.coverUrl ? (
            <Image src={game.coverUrl} alt={game.title} width={700} height={900} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-52 items-center justify-center text-sm text-slate-400">Sin portada</div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold md:text-4xl">{game.title}</h1>
          <p className="mt-3 text-sm text-slate-300">{game.summary ?? "Este juego no tiene descripción cargada todavía."}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {game.genres.map((item) => (
              <span key={item} className="rounded-full bg-cyan-500/20 px-2 py-1 text-cyan-100">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
            <p>Score global: {game.ratingGlobal ?? "N/A"}</p>
            <p>Promedio comunidad: {stats._avg.score ? Math.round(stats._avg.score) : "N/A"}</p>
            <p>Reseñas: {stats._count.id}</p>
            <p>Lanzamiento: {game.releaseDate ? game.releaseDate.toLocaleDateString("es-AR") : "N/A"}</p>
          </div>

          <div className="mt-5">
            <SaveGameForm gameId={game.id} initialStatus={userGame?.status ?? null} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold">Tu reseña</h2>
        <ReviewForm
          gameId={game.id}
          reviewId={userReview?.id}
          initialScore={userReview?.score ?? 80}
          initialContent={userReview?.content ?? ""}
        />
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold">Reseñas recientes</h2>
        {recentReviews.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-slate-300">Todavía no hay reseñas.</div>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-sm text-cyan-200">
                  @{review.user.username} - <span className="font-semibold">{review.score}/100</span>
                </p>
                <p className="mt-2 text-sm text-slate-200">{review.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
