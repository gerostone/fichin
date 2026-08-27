import Link from "next/link";
import { redirect } from "next/navigation";

import { LibraryGameCard } from "@/components/games/library-game-card";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LibraryPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/me/library");
  }

  const params = await searchParams;
  const status = params.status === "PLAYED" ? "PLAYED" : "WISHLIST";

  const entries = await prisma.userGame.findMany({
    where: {
      userId: session.user.id,
      status,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      game: true,
    },
  });

  const gameIds = entries.map((entry) => entry.gameId);
  const groupedScores =
    gameIds.length > 0
      ? await prisma.review.groupBy({
          by: ["gameId"],
          where: { gameId: { in: gameIds } },
          _avg: { score: true },
          _count: { id: true },
        })
      : [];
  const scoreByGame = new Map(groupedScores.map((row) => [row.gameId, row._avg.score ?? null]));
  const reviewCountByGame = new Map(groupedScores.map((row) => [row.gameId, row._count.id]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Mi biblioteca</h1>
        <div className="mt-3 flex gap-2">
          <Link
            href="/me/library?status=WISHLIST"
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              status === "WISHLIST" ? "bg-cyan-500 text-slate-950" : "bg-slate-900 text-slate-300"
            }`}
          >
            Wishlist
          </Link>
          <Link
            href="/me/library?status=PLAYED"
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              status === "PLAYED" ? "bg-orange-400 text-slate-950" : "bg-slate-900 text-slate-300"
            }`}
          >
            Jugados
          </Link>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-slate-300">
          No tenés juegos en esta sección.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {entries.map((entry) => (
            <LibraryGameCard
              key={entry.id}
              game={{
                title: entry.game.title,
                slug: entry.game.slug,
                coverUrl: entry.game.coverUrl,
              }}
              averageScore={scoreByGame.get(entry.gameId) ?? null}
              reviewCount={reviewCountByGame.get(entry.gameId) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
