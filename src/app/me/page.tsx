import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserGameStatus } from "@prisma/client";

import { ProfileAvatarEditor } from "@/components/social/profile-avatar-editor";
import { buildAvatarSeed, getInitials } from "@/lib/avatar";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatMonthDay(date: Date): string {
  const month = date.toLocaleString("es-AR", { month: "short" }).toUpperCase();
  return `${month} ${date.getDate()}`;
}

export default async function MyProfilePage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/me");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          reviews: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin?callbackUrl=/me");
  }

  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [playedCount, thisYearReviews, favoriteReviews, recentReviews, watchlist] = await Promise.all([
    prisma.userGame.count({
      where: {
        userId: user.id,
        status: UserGameStatus.PLAYED,
      },
    }),
    prisma.review.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: yearStart,
        },
      },
    }),
    prisma.review.findMany({
      where: { userId: user.id },
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
      take: 4,
      include: {
        game: {
          select: {
            title: true,
            slug: true,
            coverUrl: true,
          },
        },
      },
    }),
    prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        game: {
          select: {
            title: true,
            slug: true,
            coverUrl: true,
          },
        },
      },
    }),
    prisma.userGame.findMany({
      where: {
        userId: user.id,
        status: UserGameStatus.WISHLIST,
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        game: {
          select: {
            title: true,
            slug: true,
            coverUrl: true,
          },
        },
      },
    }),
  ]);

  const avatarColor = buildAvatarSeed(user.username);
  const initials = getInitials(user.username);

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-4">
            <ProfileAvatarEditor username={user.username} avatarUrl={user.avatarUrl} avatarColor={avatarColor} initials={initials} />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">@{user.username}</h1>
                <Link href={`/users/${user.username}`} className="rounded-lg border border-white/20 px-3 py-1 text-xs text-slate-200">
                  Ver perfil público
                </Link>
              </div>
              <p className="mt-2 text-sm text-slate-300">Tu espacio personal para seguir actividad y reseñas.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div className="rounded-xl bg-slate-950/70 p-3">
              <p className="text-2xl font-bold text-slate-100">{playedCount}</p>
              <p className="text-xs text-slate-400">JUGADOS</p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-3">
              <p className="text-2xl font-bold text-slate-100">{thisYearReviews}</p>
              <p className="text-xs text-slate-400">ESTE AÑO</p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-3">
              <p className="text-2xl font-bold text-slate-100">{user._count.following}</p>
              <p className="text-xs text-slate-400">SIGUIENDO</p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-3">
              <p className="text-2xl font-bold text-slate-100">{user._count.followers}</p>
              <p className="text-xs text-slate-400">SEGUIDORES</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/me" className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
            Perfil
          </Link>
          <Link href="/feed" className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Actividad
          </Link>
          <Link href="/me/reviews" className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Reseñas
          </Link>
          <Link href="/me/library?status=WISHLIST" className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Wishlist
          </Link>
          <Link href="/me/library?status=PLAYED" className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Jugados
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h2 className="mb-3 border-b border-white/15 pb-2 text-sm font-semibold tracking-[0.15em] text-slate-300">JUEGOS FAVORITOS</h2>
            {favoriteReviews.length === 0 ? (
              <p className="text-sm text-slate-400">Todavía no hay reseñas para construir favoritos.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {favoriteReviews.map((review) => (
                  <Link key={review.id} href={`/games/${review.game.slug}`} className="block">
                    {review.game.coverUrl ? (
                      <Image
                        src={review.game.coverUrl}
                        alt={review.game.title}
                        width={220}
                        height={330}
                        className="h-40 w-full rounded-lg border border-white/15 object-cover"
                      />
                    ) : (
                      <div className="h-40 w-full rounded-lg border border-white/15 bg-slate-800" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h2 className="mb-3 border-b border-white/15 pb-2 text-sm font-semibold tracking-[0.15em] text-slate-300">ACTIVIDAD RECIENTE</h2>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-slate-400">Todavía no hay actividad.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recentReviews.slice(0, 4).map((review) => (
                  <Link key={review.id} href={`/games/${review.game.slug}`} className="block rounded-xl border border-white/10 bg-slate-950/60 p-2">
                    {review.game.coverUrl ? (
                      <Image
                        src={review.game.coverUrl}
                        alt={review.game.title}
                        width={300}
                        height={450}
                        className="h-44 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-44 w-full rounded-lg bg-slate-800" />
                    )}
                    <p className="mt-2 text-sm font-semibold text-slate-100">{review.game.title}</p>
                    <p className="text-xs text-slate-300">{review.score}/100</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h2 className="mb-3 border-b border-white/15 pb-2 text-sm font-semibold tracking-[0.15em] text-slate-300">
              WISHLIST ({watchlist.length})
            </h2>
            {watchlist.length === 0 ? (
              <p className="text-sm text-slate-400">Sin juegos en wishlist.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {watchlist.map((entry) => (
                  <Link key={entry.id} href={`/games/${entry.game.slug}`} title={entry.game.title}>
                    {entry.game.coverUrl ? (
                      <Image
                        src={entry.game.coverUrl}
                        alt={entry.game.title}
                        width={140}
                        height={210}
                        className="h-24 w-full rounded-md border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="h-24 w-full rounded-md border border-white/10 bg-slate-800" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h2 className="mb-3 border-b border-white/15 pb-2 text-sm font-semibold tracking-[0.15em] text-slate-300">
              DIARIO ({recentReviews.length})
            </h2>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-slate-400">Sin registros recientes.</p>
            ) : (
              <div className="space-y-2">
                {recentReviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="flex items-start gap-3 rounded-lg bg-slate-950/60 p-2">
                    <span className="rounded-md bg-cyan-500/20 px-2 py-1 text-[10px] font-semibold text-cyan-100">
                      {formatMonthDay(review.createdAt)}
                    </span>
                    <div>
                      <Link href={`/games/${review.game.slug}`} className="text-sm font-medium text-slate-200">
                        {review.game.title}
                      </Link>
                      <p className="text-xs text-slate-400">{review.score}/100</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
