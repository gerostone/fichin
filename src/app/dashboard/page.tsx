import Link from "next/link";

import { GameCarousel } from "@/components/games/game-carousel";
import { GamePosterCard } from "@/components/games/game-poster-card";
import { buildCanonicalGameFilter } from "@/lib/game-catalog";
import { prisma } from "@/lib/prisma";

type DashboardPageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    platform?: string;
    page?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const genre = params.genre?.trim() ?? "";
  const platform = params.platform?.trim() ?? "";
  const requestedPage = Math.max(Number(params.page ?? "1") || 1, 1);
  const limit = 12;

  const canonicalFilter = buildCanonicalGameFilter();
  const where = {
    ...canonicalFilter,
    ...(q
      ? {
          title: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(genre ? { genres: { has: genre } } : {}),
    ...(platform ? { platforms: { has: platform } } : {}),
  };

  const [total, facets, popularByCommunityRaw, latestReviewActivity] = await Promise.all([
    prisma.game.count({ where }),
    prisma.game.findMany({
      take: 200,
      where: canonicalFilter,
      select: { genres: true, platforms: true },
    }),
    prisma.review.groupBy({
      by: ["gameId"],
      _avg: { score: true },
      _count: { id: true },
      orderBy: [{ _avg: { score: "desc" } }, { _count: { id: "desc" } }],
      take: 18,
    }),
    prisma.review.findMany({
      select: { gameId: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const page = Math.min(requestedPage, totalPages);

  const games = await prisma.game.findMany({
    where,
    orderBy: [{ ratingGlobal: "desc" }, { title: "asc" }],
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      genres: true,
      platforms: true,
      ratingGlobal: true,
    },
  });

  const gameIds = games.map((game) => game.id);
  const grouped = gameIds.length
    ? await prisma.review.groupBy({
        by: ["gameId"],
        where: { gameId: { in: gameIds } },
        _avg: { score: true },
        _count: { id: true },
      })
    : [];

  const scoreByGame = new Map(grouped.map((row) => [row.gameId, row._avg.score]));
  const reviewCountByGame = new Map(grouped.map((row) => [row.gameId, row._count.id]));

  const genreOptions = Array.from(new Set(facets.flatMap((entry) => entry.genres))).sort();
  const platformOptions = Array.from(new Set(facets.flatMap((entry) => entry.platforms))).sort();
  const hasActiveFilters = Boolean(q || genre || platform);
  const hasTitleSearch = q.length > 0;

  const popularIds = popularByCommunityRaw.map((row) => row.gameId);
  const popularGameRows =
    popularIds.length > 0
      ? await prisma.game.findMany({
          where: {
            id: { in: popularIds },
            ...canonicalFilter,
          },
          select: { id: true, slug: true, title: true, coverUrl: true, platforms: true },
        })
      : [];
  const popularGameMap = new Map(popularGameRows.map((game) => [game.id, game]));
  const popularGames = popularByCommunityRaw
    .map((entry) => {
      const game = popularGameMap.get(entry.gameId);
      if (!game) {
        return null;
      }

      return {
        ...game,
        communityScore: entry._avg.score ?? null,
        reviewCount: entry._count.id,
      };
    })
    .filter((entry) => entry !== null);

  const recentIds = Array.from(new Set(latestReviewActivity.map((row) => row.gameId))).slice(0, 18);
  const recentAggregates =
    recentIds.length > 0
      ? await prisma.review.groupBy({
          by: ["gameId"],
          where: { gameId: { in: recentIds } },
          _avg: { score: true },
          _count: { id: true },
        })
      : [];
  const recentAggregateMap = new Map(recentAggregates.map((row) => [row.gameId, row]));
  const recentGamesRows =
    recentIds.length > 0
      ? await prisma.game.findMany({
          where: {
            id: { in: recentIds },
            ...canonicalFilter,
          },
          select: { id: true, slug: true, title: true, coverUrl: true, platforms: true },
        })
      : [];
  const recentGamesMap = new Map(recentGamesRows.map((game) => [game.id, game]));
  const recentlyReviewedGames = recentIds
    .map((id) => {
      const game = recentGamesMap.get(id);
      const aggregate = recentAggregateMap.get(id);
      if (!game) {
        return null;
      }

      return {
        ...game,
        communityScore: aggregate?._avg.score ?? null,
        reviewCount: aggregate?._count.id ?? 0,
      };
    })
    .filter((entry) => entry !== null);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:p-6">
        <div className="space-y-2">
          <p className="text-xs tracking-[0.14em] text-slate-300 uppercase">Explorar por</p>
          <h1 className="text-center text-xl font-semibold text-slate-100 md:text-2xl">Inicio</h1>
        </div>
        <form action="/dashboard" className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="genre"
              defaultValue={genre}
              className="min-h-11 rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Todos los géneros</option>
              {genreOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              name="platform"
              defaultValue={platform}
              className="min-h-11 rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Todas las plataformas</option>
              {platformOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar videojuego..."
              className="min-h-11 rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 sm:col-span-2"
            />
          </div>
          <div className="flex items-center gap-2 self-end lg:self-stretch">
            <button className="h-10 rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-slate-950">Aplicar</button>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-lg border border-white/20 px-4 text-sm font-semibold text-slate-200 hover:border-cyan-300/60 hover:text-cyan-100"
            >
              Limpiar
            </Link>
          </div>
        </form>
      </section>

      {!hasTitleSearch ? (
        <>
          <GameCarousel
            title="Videojuegos más populares"
            games={popularGames}
            emptyText="Todavía no hay reseñas suficientes para ordenar por comunidad."
          />

          <GameCarousel
            title="Recién reseñados"
            games={recentlyReviewedGames}
            emptyText="Todavía no hay actividad de reseñas reciente."
          />
        </>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/20 pb-2">
          <h2 className="text-base font-semibold tracking-[0.08em] text-slate-200 uppercase">
            {hasActiveFilters ? "Resultados filtrados" : "Catálogo para explorar"}
          </h2>
          <span className="text-xs text-slate-400">
            {total} resultado{total === 1 ? "" : "s"}
          </span>
        </div>

        {games.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-slate-300">No se encontraron juegos.</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 md:justify-start">
            {games.map((game) => (
              <div key={game.id} className="w-[180px] md:w-[220px]">
                <GamePosterCard
                  game={{
                    slug: game.slug,
                    title: game.title,
                    coverUrl: game.coverUrl,
                    platforms: game.platforms,
                  }}
                  communityScore={scoreByGame.get(game.id) ?? null}
                  reviewCount={reviewCountByGame.get(game.id) ?? 0}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm text-slate-300">
          Página {page} de {totalPages}
        </span>

        {page > 1 ? (
          <Link
            href={`/dashboard?q=${encodeURIComponent(q)}&genre=${encodeURIComponent(genre)}&platform=${encodeURIComponent(platform)}&page=${page - 1}`}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm"
          >
            Anterior
          </Link>
        ) : null}

        {page < totalPages ? (
          <Link
            href={`/dashboard?q=${encodeURIComponent(q)}&genre=${encodeURIComponent(genre)}&platform=${encodeURIComponent(platform)}&page=${page + 1}`}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm"
          >
            Siguiente
          </Link>
        ) : null}
      </section>
    </div>
  );
}
