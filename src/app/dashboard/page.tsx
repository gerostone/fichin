import Link from "next/link";

import { GameCard } from "@/components/games/game-card";
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

  const where = {
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

  const [total, facets] = await Promise.all([
    prisma.game.count({ where }),
    prisma.game.findMany({
      take: 200,
      select: { genres: true, platforms: true },
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
  const grouped =
    gameIds.length > 0
      ? await prisma.review.groupBy({
          by: ["gameId"],
          where: { gameId: { in: gameIds } },
          _avg: { score: true },
          _count: { id: true },
        })
      : [];

  const scoreByGame = new Map(grouped.map((row) => [row.gameId, row._avg.score]));

  const genreOptions = Array.from(new Set(facets.flatMap((entry) => entry.genres))).sort();
  const platformOptions = Array.from(new Set(facets.flatMap((entry) => entry.platforms))).sort();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 md:p-6">
        <h1 className="text-2xl font-bold md:text-3xl">Explorar videojuegos</h1>
        <form action="/dashboard" className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por título"
            className="min-h-11 rounded-xl border border-white/15 bg-slate-950 px-3 py-2"
          />

          <select
            name="genre"
            defaultValue={genre}
            className="min-h-11 rounded-xl border border-white/15 bg-slate-950 px-3 py-2"
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
            className="min-h-11 rounded-xl border border-white/15 bg-slate-950 px-3 py-2"
          >
            <option value="">Todas las plataformas</option>
            {platformOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button className="min-h-11 rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">Filtrar</button>
        </form>
      </section>

      <section>
        {games.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-slate-300">No se encontraron juegos.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={{
                  ...game,
                  averageScore: scoreByGame.get(game.id) ?? null,
                }}
              />
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
